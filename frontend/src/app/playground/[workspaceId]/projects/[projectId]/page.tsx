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
  
  // Get project details with auto-fetch
  const { 
    project,
    loading: projectLoading, 
    error: projectError,
    assets,
    hasFetched,
    refreshProject,
    updateProject,
    clearError
  } = useProjectDetails(workspaceId, projectId);

  // Get workspace projects for delete functionality
  const { deleteProject } = useWorkspaceProjects(workspaceId);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    isDeleting: false,
  });

  // Workspace resolution
  const currentWorkspace = useMemo(() => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    return workspace 
      ? { id: workspace.id, name: workspace.name }
      : { id: workspaceId, name: "Workspace" };
  }, [workspaces, workspaceId]);

  // Consolidated loading and error states
  const isLoading = workspacesLoading || projectLoading || !hasFetched;
  const error = projectError;

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
      
      // Refresh project assets after generation starts
      // This will help show any newly created assets
      setTimeout(() => {
        refreshProject();
      }, 2000);
    } catch (error) {
      console.error('Failed to start video generation:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to start video generation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Watch for video generation completion to refresh assets
  useEffect(() => {
    if (result?.video_url) {
      // Video generation completed, refresh project to get latest assets
      refreshProject();
    }
  }, [result?.video_url, refreshProject]);

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
    if (!project) return;
    
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const success = await deleteProject(project.id);
      if (success) {
        toast({
          title: "Project Deleted",
          description: `"${project.name}" has been deleted successfully.`,
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
