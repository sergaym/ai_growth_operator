"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces } from '@/hooks/useWorkspace';
import { useWorkspaceProjects, useProjectDetails, type Project } from '@/hooks/useProjects';
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useAuth } from "@/hooks/useAuth";
import PlaygroundLayout from "@/components/playground/Layout";
import { VideoPreview } from "@/components/chat/VideoPreview";
import { GestureChat } from "@/components/chat/GestureChat";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Settings,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;
  
  const { user } = useAuth();
  const { workspaces, loading: workspacesLoading } = useWorkspaces();
  
  // Get workspace projects (this will auto-fetch and cache projects)
  const { 
    projects, 
    loading: projectsLoading, 
    error: projectsError,
    deleteProject 
  } = useWorkspaceProjects(workspaceId);

  // Get project-specific utilities for detailed operations
  const { 
    getProject, 
    getProjectAssets, 
    updateProject,
    loading: projectDetailsLoading,
    error: projectDetailsError 
  } = useProjectDetails(workspaceId, projectId);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    isDeleting: false,
  });

  // Project state management
  const [projectWithAssets, setProjectWithAssets] = useState<{
    project: Project | null;
    assets: any;
    loading: boolean;
    initialized: boolean;
  }>({
    project: null,
    assets: null,
    loading: true,
    initialized: false
  });

  // Get cached project from workspace projects
  const cachedProject = useMemo(() => {
    return projects.find(p => p.id === projectId) || null;
  }, [projects, projectId]);

  // Determine if we should fetch detailed project data
  const shouldFetchDetails = useMemo(() => {
    // If we have a cached project, we don't need to fetch details initially
    if (cachedProject) return false;
    
    // If projects are still loading, wait
    if (projectsLoading) return false;
    
    // If projects loaded but no cached project found, try detailed fetch
    return true;
  }, [cachedProject, projectsLoading]);

  // Initialize project state when cached project is available
  useEffect(() => {
    if (cachedProject && !projectWithAssets.initialized) {
      setProjectWithAssets({
        project: cachedProject,
        assets: null,
        loading: false,
        initialized: true
      });
    }
    return null;
  };

  // Load project data or create if not exists
  useEffect(() => {
    const loadOrCreateProject = async () => {
      if (!stringWorkspaceId || !stringProjectId) return;
      
      setLoading(true);
      try {
        // First, try to load the existing project
        const projectData = await getProject(stringProjectId, true);
        
        if (projectData) {
          // Project exists, load its data
          const assetsData = await getProjectAssets(stringProjectId);
          setProject(projectData);
          setAssets(assetsData);
        } else {
          // Project doesn't exist, auto-create it
          console.log(`Project ${stringProjectId} not found, auto-creating...`);
          const newProject = await autoCreateProject();
          
          if (newProject) {
            setProject(newProject);
            setAssets(null); // New project has no assets yet
          } else {
            console.error('Failed to auto-create project');
          }
        }
      } catch (error) {
        console.error('Error loading/creating project:', error);
        
        // If there's an error loading, try to auto-create
        if (!isCreatingProject) {
          const newProject = await autoCreateProject();
          if (newProject) {
            setProject(newProject);
            setAssets(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrCreateProject();
  }, [stringWorkspaceId, stringProjectId, getProject, getProjectAssets]);

  // Video generation state
  const { 
    generateVideo, 
    isGenerating, 
    progress, 
    currentStep, 
    result, 
    error, 
    cancel, 
    reset 
  } = useVideoGeneration();

  // Handle video generation request from GestureChat
  const handleGenerateVideo = async (text: string, actorId: string, actorVideoUrl: string, language: string) => {
    if (!user?.isAuthenticated || !user?.user) {
      alert('Please log in to generate videos');
      return;
    }

    if (!actorId || !actorVideoUrl) {
      alert('Please select a valid actor');
      return;
    }

    try {
      await generateVideo({
        text: text.trim(),
        actor_id: String(actorId),
        actor_video_url: actorVideoUrl,
        language: language,
        voice_preset: 'professional_male',
        project_id: stringProjectId,
        user_id: String(user.user.id),
        workspace_id: stringWorkspaceId,
      });
    } catch (error) {
      console.error('Failed to start video generation:', error);
    }
  };

  const handleBackToWorkspace = () => {
    router.push(`/playground/${stringWorkspaceId}`);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      const success = await deleteProject(project.id);
      if (success) {
        router.push(`/playground/${stringWorkspaceId}`);
      }
    }
  };

  // Project actions menu component
  const ProjectActions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Project Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-500"
          onClick={handleDeleteProject}
        >
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading || projectsLoading || isCreatingProject) {
    return (
      <PlaygroundLayout
        title={isCreatingProject ? "Creating Project..." : "Loading..."}
        currentWorkspace={workspace}
        showBackButton={true}
        onBack={handleBackToWorkspace}
        isProject={true}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PlaygroundLayout>
    );
  }

  if (!project) {
    return (
      <PlaygroundLayout
        title="Project Creation Failed"
        currentWorkspace={workspace}
        error="Failed to create or load project. Please try again."
        showBackButton={true}
        onBack={handleBackToWorkspace}
        isProject={true}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Unable to create or load the project.</p>
        </div>
      </PlaygroundLayout>
    );
  }

  return (
    <PlaygroundLayout
      title={project.name}
      description={project.description}
      currentWorkspace={workspace}
      error={projectsError}
      showBackButton={true}
      onBack={handleBackToWorkspace}
      status={project.status}
      headerActions={<ProjectActions />}
      isProject={true}
      projectName={project.name}
    >
      <div className="space-y-6">
        {/* Video Preview */}
        <VideoPreview
          videoUrl={result?.video_url}
          isGenerating={isGenerating}
          progress={progress}
          currentStep={currentStep ?? undefined}
          error={error ?? undefined}
          processingTime={result?.processing_time}
          onCancel={cancel}
          onReset={reset}
          onRetry={reset}
          showGettingStarted={!result && !error && !isGenerating}
        />

        {/* Enhanced Chat Input */}
        <GestureChat 
          projectId={stringProjectId} 
          onGenerateVideo={handleGenerateVideo}
          isGenerating={isGenerating}
          showTips={true}
        />
      </div>
    </PlaygroundLayout>
  );
}
