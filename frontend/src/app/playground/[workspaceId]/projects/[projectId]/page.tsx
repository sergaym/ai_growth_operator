"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces } from '@/hooks/useWorkspace';
import { useWorkspaceProjects, useProjectDetails, type Project } from '@/hooks/useProjects';
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useAuth } from "@/hooks/useAuth";
import PlaygroundLayout from "@/components/playground/Layout";
import { VideoPreview } from "@/components/chat/VideoPreview";
import { GestureChat } from "@/components/chat/GestureChat";
import { Button } from "@/components/ui/button";
import { ProjectUpdateSheet } from "@/components/project/ProjectUpdateSheet";
import { 
  MoreHorizontal,
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  User,
  Clock,
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { AssetViewer } from "@/components/project/AssetViewer";


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
    refreshAssets,
    updateProject,
    clearError
  } = useProjectDetails(workspaceId, projectId);

  // Get workspace projects for delete functionality
  const { deleteProject } = useWorkspaceProjects(workspaceId);

  // Enhanced state management
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  // Workspace resolution
  const currentWorkspace = useMemo(() => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    return workspace 
      ? { id: workspace.id, name: workspace.name }
      : { id: workspaceId, name: "Workspace" };
  }, [workspaces, workspaceId]);

  // Consolidated loading and error states
  // Only show loading on initial load, not during refreshes/updates
  const isInitialLoading = (workspacesLoading && !workspaces.length) || (projectLoading && !hasFetched);
  const error = projectError;

  // Progressive loading - show partial data immediately
  const showPartialContent = workspaces.length > 0 && currentWorkspace;
  
  // Optimistic data display - use cached data when available
  const [cachedProject, setCachedProject] = useState<Project | null>(null);
  
  // Cache project data as soon as it's available
  useEffect(() => {
    if (project && !cachedProject) {
      setCachedProject(project);
    } else if (project && project.updated_at !== cachedProject?.updated_at) {
      setCachedProject(project);
    }
  }, [project, cachedProject]);

  // Always render the layout - use skeletons for missing data
  const displayProject = project || cachedProject;
  const displayTitle = displayProject?.name || "Untitled Project";
  const displayDescription = displayProject?.description;
  const isDataLoading = !project || !hasFetched;
  const showSkeleton = isDataLoading && !cachedProject;

  // Skeleton loading components for fast perceived performance
  const ProjectHeaderSkeleton = () => (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="hidden md:flex items-center gap-4 text-sm mr-4">
        <div className="flex items-center gap-1">
          <div className="h-3.5 w-3.5 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3.5 w-3.5 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded" />
    </div>
  );

  const AssetsSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <div className="h-5 w-14 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-36 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-1.5" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-14 bg-gray-200 rounded-full" />
                <div className="h-6 w-6 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="border-b border-gray-100 pb-3">
        <div className="h-5 w-28 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-52 bg-gray-200 rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-gray-100 rounded-lg" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-10 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

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

  // Keyboard shortcuts - Notion style
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + E to edit project
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setIsUpdateSheetOpen(true);
      }
      
      // Escape to close dialogs
      if (e.key === 'Escape') {
        setShowDeleteConfirm(false);
        setIsUpdateSheetOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Watch for video generation completion to refresh assets
  useEffect(() => {
    if (result?.video_url) {
      // Video generation completed, refresh project to get latest assets
      refreshProject();
    }
  }, [result?.video_url, refreshProject]);

  // Smart content display logic - Show assets if they exist regardless of status
  const hasExistingAssets = assets && assets.assets && assets.assets.length > 0;
  
  // Debug logging - temporary
  useEffect(() => {
    console.log('🔍 Asset Detection Debug:', {
      assets,
      hasAssets: !!assets,
      assetsArray: assets?.assets,
      assetsLength: assets?.assets?.length,
      hasExistingAssets,
      projectId,
      workspaceId,
      hasFetched,
      showSkeleton,
      projectLoading
    });
  }, [assets, hasExistingAssets, projectId, workspaceId, hasFetched, showSkeleton, projectLoading]);
  
  const hasVideoGenerationActivity = isGenerating || result?.video_url || videoError;
  const shouldShowVideoPreview = hasVideoGenerationActivity || !hasExistingAssets;
  const shouldShowGettingStarted = !hasExistingAssets && !hasVideoGenerationActivity;

  // Smart reset handler for better UX
  const handleReset = useCallback(() => {
    reset();
    // If there are existing assets, this allows starting fresh generation
  }, [reset]);

  // Enhanced video generation handler with better asset integration
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
      // Reset any previous generation state
      reset();
      
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

  // Navigation handlers
  const handleBackToWorkspace = () => {
    router.push(`/playground/${workspaceId}`);
  };

  // Direct delete handler with confirmation
  const handleDeleteProject = async () => {
    if (!project) return;
    setShowDeleteConfirm(false);
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

  // Format date in Notion style
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Enhanced project actions menu component
  const ProjectActions = () => (
    <div className="flex items-center gap-2">
      {/* Project Metadata - Notion style */}
      {project && (
        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground mr-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Edited {formatDate(project.updated_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
        </div>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={isDeleting}
            className="h-8 w-8 hover:bg-gray-100"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => setIsUpdateSheetOpen(true)} 
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit project details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete project'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Delete confirmation dialog
  const DeleteConfirmDialog = () => {
    if (!showDeleteConfirm) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Delete project</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <strong>"{project?.name}"</strong>? 
            All assets and data will be permanently removed.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete project
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Progressive loading - immediately show layout with skeletons
  // Error state - project not found (only show after fetch is complete)
  if (hasFetched && !project && !isInitialLoading) {
    return (
      <PlaygroundLayout
        title="Project Not Found"
        currentWorkspace={currentWorkspace}
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
            Return to Workspace
          </Button>
        </div>
      </PlaygroundLayout>
    );
  }

  return (
    <>
      <PlaygroundLayout
        title={displayTitle}
        description={displayDescription}
        currentWorkspace={currentWorkspace}
        error={null}
        showBackButton={true}
        onBack={handleBackToWorkspace}
        status={project?.status}
        headerActions={showSkeleton ? <ProjectHeaderSkeleton /> : <ProjectActions />}
        isProject={true}
        projectName={project?.name}
      >
        <div className="space-y-6">
          {/* Loading State for Assets */}
          {showSkeleton && <AssetsSkeleton />}
          
          
          {/* Existing Assets Section - Show if assets exist */}
          {!showSkeleton && assets && assets.assets && assets.assets.length > 0 && (
            <div className="space-y-6">

              
              {/* Asset Grid - Responsive layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assets.assets.map((asset, index) => (
                  <div 
                    key={asset.id} 
                    className="animate-in fade-in-50 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AssetViewer 
                      asset={asset}
                      showMetadata={true}
                      compact={false}
                    />
                  </div>
                ))}
              </div>
              
              {/* Asset Summary Stats */}
              {assets.asset_summary && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Asset Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {assets.asset_summary.total_videos > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                          <Video className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{assets.asset_summary.total_videos}</p>
                        <p className="text-xs text-gray-500">Videos</p>
                      </div>
                    )}
                    {assets.asset_summary.total_lipsync_videos > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1">
                          <Video className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{assets.asset_summary.total_lipsync_videos}</p>
                        <p className="text-xs text-gray-500">Lip-sync</p>
                      </div>
                    )}
                    {assets.asset_summary.total_audio > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full mx-auto mb-1">
                          <Music className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{assets.asset_summary.total_audio}</p>
                        <p className="text-xs text-gray-500">Audio</p>
                      </div>
                    )}
                    {assets.asset_summary.total_images > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                          <ImageIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{assets.asset_summary.total_images}</p>
                        <p className="text-xs text-gray-500">Images</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video Generation Section - Smart Display Logic */}
          {showSkeleton ? (
            <ContentSkeleton />
          ) : (
            <div className="space-y-4">
              {/* Section Header */}
              
              {/* Video Preview - Only show when there's generation activity or no existing assets */}
              {shouldShowVideoPreview && (
                <VideoPreview
                  videoUrl={result?.video_url}
                  isGenerating={isGenerating}
                  progress={progress}
                  currentStep={currentStep ?? undefined}
                  error={videoError ?? undefined}
                  processingTime={result?.processing_time}
                  onCancel={cancel}
                  onReset={handleReset}
                  onRetry={reset}
                  showGettingStarted={shouldShowGettingStarted}
                  compact={Boolean(hasExistingAssets)} // Use compact mode when assets exist
                />
              )}

              {/* Enhanced Chat Input */}
              <GestureChat 
                projectId={projectId} 
                onGenerateVideo={handleGenerateVideo}
                isGenerating={isGenerating}
                showTips={!hasExistingAssets} // Only show tips for new projects
              />
            </div>
          )}
        </div>
      </PlaygroundLayout>

      {/* Project Update Sheet */}
      {project && (
        <ProjectUpdateSheet
          project={project}
          open={isUpdateSheetOpen}
          onOpenChange={setIsUpdateSheetOpen}
          onUpdate={updateProject}
          isUpdating={false}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog />
    </>
  );
}

