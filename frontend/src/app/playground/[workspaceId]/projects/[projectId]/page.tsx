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
  }, [cachedProject, projectWithAssets.initialized]);

  // Fetch detailed project data when needed
  useEffect(() => {
    if (!workspaceId || !projectId || !shouldFetchDetails || projectWithAssets.initialized) {
      return;
    }

    const fetchProjectDetails = async () => {
      setProjectWithAssets(prev => ({ ...prev, loading: true }));
      
      try {
        const [projectData, assetsData] = await Promise.all([
          getProject(true), // Include assets in project fetch
          getProjectAssets()
        ]);

        if (projectData) {
          setProjectWithAssets({
            project: projectData,
            assets: assetsData,
            loading: false,
            initialized: true
          });
        } else {
          // Project doesn't exist
          setProjectWithAssets({
            project: null,
            assets: null,
            loading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
        setProjectWithAssets({
          project: null,
          assets: null,
          loading: false,
          initialized: true
        });
        
        toast({
          title: "Error",
          description: "Failed to load project details. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchProjectDetails();
  }, [workspaceId, projectId, shouldFetchDetails, projectWithAssets.initialized, getProject, getProjectAssets, toast]);

  // Workspace resolution
  const currentWorkspace = useMemo(() => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    return workspace 
      ? { id: workspace.id, name: workspace.name }
      : { id: workspaceId, name: "Workspace" };
  }, [workspaces, workspaceId]);

  // Consolidated loading state
  const isLoading = workspacesLoading || projectsLoading || projectWithAssets.loading;
  
  // Consolidated error state
  const error = projectsError || projectDetailsError;

  // Video generation state
  const { 
    generateVideo, 
    isGenerating, 
    progress, 
    currentStep, 
    result, 
    error: videoError, 
    cancel, 
    reset 
  } = useVideoGeneration();

  // Enhanced video generation handler
  const handleGenerateVideo = async (
    text: string, 
    actorId: string, 
    actorVideoUrl: string, 
    language: string
  ) => {
    if (!user?.isAuthenticated || !user?.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate videos.",
        variant: "destructive",
      });
      return;
    }

    if (!actorId || !actorVideoUrl) {
      toast({
        title: "Invalid Actor",
        description: "Please select a valid actor.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateVideo({
        text: text.trim(),
        actor_id: String(actorId),
        actor_video_url: actorVideoUrl,
        language: language,
        voice_preset: 'professional_male',
        project_id: projectId,
        user_id: String(user.user.id),
        workspace_id: workspaceId,
      });
    } catch (error) {
      console.error('Failed to start video generation:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to start video generation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Navigation handlers
  const handleBackToWorkspace = () => {
    router.push(`/playground/${workspaceId}`);
  };

  // Delete handlers
  const openDeleteDialog = () => {
    setDeleteDialog({ open: true, isDeleting: false });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, isDeleting: false });
  };

  const handleDeleteProject = async () => {
    if (!projectWithAssets.project) return;
    
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const success = await deleteProject(projectWithAssets.project.id);
      if (success) {
        toast({
          title: "Project Deleted",
          description: `"${projectWithAssets.project.name}" has been deleted successfully.`,
        });
        router.push(`/playground/${workspaceId}`);
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
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
          onClick={openDeleteDialog}
        >
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Loading state
  if (isLoading) {
    return (
      <PlaygroundLayout
        title="Loading..."
        currentWorkspace={currentWorkspace}
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

  // Error state - project not found
  if (!projectWithAssets.project) {
    return (
      <PlaygroundLayout
        title="Project Not Found"
        currentWorkspace={currentWorkspace}
        error="The project you're looking for doesn't exist or you don't have access to it."
        showBackButton={true}
        onBack={handleBackToWorkspace}
        isProject={true}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Unable to find the requested project.
          </p>
          <Button onClick={handleBackToWorkspace} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Projects
          </Button>
        </div>
      </PlaygroundLayout>
    );
  }

  // Success state - render project
  return (
    <>
      <PlaygroundLayout
        title={projectWithAssets.project.name}
        description={projectWithAssets.project.description}
        currentWorkspace={currentWorkspace}
        error={error}
        showBackButton={true}
        onBack={handleBackToWorkspace}
        status={projectWithAssets.project.status}
        headerActions={<ProjectActions />}
        isProject={true}
        projectName={projectWithAssets.project.name}
      >
        <div className="space-y-6">
          {/* Video Preview */}
          <VideoPreview
            videoUrl={result?.video_url}
            isGenerating={isGenerating}
            progress={progress}
            currentStep={currentStep ?? undefined}
            error={videoError ?? undefined}
            processingTime={result?.processing_time}
            onCancel={cancel}
            onReset={reset}
            onRetry={reset}
            showGettingStarted={!result && !videoError && !isGenerating}
          />

          {/* Enhanced Chat Input */}
          <GestureChat 
            projectId={projectId} 
            onGenerateVideo={handleGenerateVideo}
            isGenerating={isGenerating}
            showTips={true}
          />
        </div>
      </PlaygroundLayout>

      {/* Professional Delete Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="This project and all its content will be permanently deleted. This action cannot be undone."
        itemName={projectWithAssets.project?.name || ""}
        itemType="project"
        destructiveAction="Delete Project"
        isLoading={deleteDialog.isDeleting}
      />
    </>
  );
}
