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

  // Simple delete state
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Direct delete handler with confirmation
  const handleDeleteProject = async () => {
    if (!project) return;
    
    // Simple browser confirmation
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?\n\nThis action cannot be undone and you will be redirected to the workspace.`
    );
    
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

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
      setIsDeleting(false);
    }
  };

  // Project actions menu component
  const ProjectActions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isDeleting}>
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={refreshProject} disabled={isDeleting}>
          <Settings className="h-4 w-4 mr-2" />
          Refresh Project
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-500"
          onClick={handleDeleteProject}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Project'}
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

  // Error state - project not found (only show after fetch is complete)
  if (hasFetched && !project && !isLoading) {
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

  // Success state - render project (only if project exists and fetch is complete)
  if (!project || !hasFetched) {
    return null; // This should not happen due to the loading/error checks above, but satisfies TypeScript
  }

  return (
    <>
      <PlaygroundLayout
        title={project.name}
        description={project.description}
        currentWorkspace={currentWorkspace}
        error={error}
        showBackButton={true}
        onBack={handleBackToWorkspace}
        status={project.status}
        headerActions={<ProjectActions />}
        isProject={true}
        projectName={project.name}
      >
        <div className="space-y-6">
          {/* Project Assets Section */}
          {assets && assets.assets && assets.assets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Project Assets</h2>
                <span className="text-sm text-muted-foreground">
                  {assets.total} asset{assets.total !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.assets.map((asset) => (
                  <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {asset.type.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        asset.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : asset.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                    
                    {/* Video Preview */}
                    {asset.type === 'video' && asset.file_url && (
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <video 
                          src={asset.file_url} 
                          controls 
                          className="w-full h-full object-cover"
                          poster={asset.thumbnail_url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    
                    {/* Audio Preview */}
                    {asset.type === 'audio' && asset.file_url && (
                      <div className="bg-gray-50 rounded p-4">
                        <audio controls className="w-full">
                          <source src={asset.file_url} />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    )}
                    
                    {/* Image Preview */}
                    {asset.type === 'image' && asset.file_url && (
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={asset.file_url} 
                          alt="Project asset"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Lipsync Video Preview */}
                    {asset.type === 'lipsync_video' && asset.file_url && (
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <video 
                          src={asset.file_url} 
                          controls 
                          className="w-full h-full object-cover"
                          poster={asset.thumbnail_url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(asset.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Generation Section */}
          <div className="space-y-4">            
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
              showGettingStarted={!result && !videoError && !isGenerating && (!assets || assets.assets.length === 0)}
            />

            {/* Enhanced Chat Input */}
            <GestureChat 
              projectId={projectId} 
              onGenerateVideo={handleGenerateVideo}
              isGenerating={isGenerating}
              showTips={true}
            />
          </div>
        </div>
      </PlaygroundLayout>
    </>
  );
}
