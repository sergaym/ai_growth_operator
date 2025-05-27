"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Filter, FolderPlus, Search, MoreHorizontal, Video, Music, Image, FileVideo } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces } from '@/hooks/useWorkspace';
import { useProjects, type Project } from '@/hooks/useProjects';
import { useToast } from "@/components/ui/use-toast";

// Project card skeleton component
function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/60 to-transparent animate-shimmer-slow" style={{ backgroundSize: '200% 100%' }}></div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          <div className="h-5 bg-gray-100 rounded-full w-1/4"></div>
        </div>
      </div>
    </Card>
  );
}

export default function WorkspaceProjects() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { toast } = useToast();
  
  // Get workspace data from API
  const { workspaces, loading: workspacesLoading } = useWorkspaces();
  
  // Get projects data from API
  const { 
    projects, 
    loading: projectsLoading, 
    error: projectsError,
    deleteProject,
    refreshProjects,
    stats
  } = useProjects(workspaceId);
  
  // Find the current workspace based on the URL parameter
  const currentWorkspace = workspaces.find(ws => ws.id === workspaceId);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter projects based on search query and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">Completed</span>;
      case "in_progress":
        return <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">In Progress</span>;
      case "draft":
        return <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">Draft</span>;
      case "archived":
        return <span className="text-xs bg-gray-500/10 text-gray-500 px-2 py-1 rounded-full">Archived</span>;
      default:
        return null;
    }
  };

  const getAssetIcon = (type: string, className: string = "h-3 w-3") => {
    switch (type) {
      case 'video':
        return <Video className={className} />;
      case 'audio':
        return <Music className={className} />;
      case 'image':
        return <Image className={className} />;
      case 'lipsync_video':
        return <FileVideo className={className} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      const success = await deleteProject(projectId);
      if (success) {
        toast({
          title: "Project Deleted",
          description: `"${projectName}" has been deleted successfully.`,
        });
      }
    }
  };

  const navigateToProject = (projectId: string) => {
    router.push(`/playground/${workspaceId}/projects/${projectId}`);
  };

  const navigateToWorkspaces = () => {
    router.push("/playground");
  };
  
  // Create a safe workspace object with default values if currentWorkspace is not found
  const workspace = !workspacesLoading && currentWorkspace 
    ? { id: currentWorkspace.id, name: currentWorkspace.name }
    : { id: workspaceId, name: "Workspace" };

  // Render error inside the layout instead of a fullscreen message
  const workspaceError = !workspacesLoading && !currentWorkspace 
    ? "The workspace you're trying to access doesn't exist or you don't have permission to view it."
    : null;

  const loading = workspacesLoading || projectsLoading;

  // Generate a new project ID and navigate to it
  const createNewProject = () => {
    // Generate a unique project ID (similar to UUID format)
    const projectId = 'proj_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    router.push(`/playground/${workspaceId}/projects/${projectId}`);
  };

  return (
    <PlaygroundLayout
      title="Projects"
      description="Create and manage your AI-generated content projects."
      currentWorkspace={workspace}
      error={workspaceError || projectsError}
    >
      {/* If workspace not found, show error and return button */}
      {workspaceError ? (
        <div className="text-center py-12">
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={navigateToWorkspaces}
          >
            Return to Workspaces
          </Button>
        </div>
      ) : (
        <>
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search projects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {statusFilter && <span className="text-xs">({statusFilter})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Drafts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
                    Archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={createNewProject} className="gap-1.5">
                <FolderPlus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </div>
          </div>

          {/* Project Grid */}
          {loading ? (
            // Show skeleton cards while loading
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <ProjectCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderPlus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">
                {projects.length === 0 ? "No projects yet" : "No projects found"}
              </h3>
              <p className="mt-1 text-gray-500">
                {projects.length === 0 
                  ? "Get started by creating your first project." 
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {projects.length === 0 && (
                <Button onClick={createNewProject} className="mt-4 gap-1.5">
                  <FolderPlus className="h-4 w-4" />
                  <span>Create Your First Project</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden group cursor-pointer" onClick={() => navigateToProject(project.id)}>
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {project.thumbnail_url ? (
                      <img 
                        src={project.thumbnail_url} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="text-xl font-bold text-white/70">
                          {project.name.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    )}
                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToProject(project.id);
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate mr-2">{project.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigateToProject(project.id)}>
                            Open Project
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => handleDeleteProject(project.id, project.name)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-gray-500 mb-3 truncate">{project.description}</p>
                    )}
                    
                    {/* Asset summary */}
                    {project.asset_summary && (
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                        {project.asset_summary.total_videos > 0 && (
                          <div className="flex items-center gap-1">
                            {getAssetIcon('video')}
                            <span>{project.asset_summary.total_videos}</span>
                          </div>
                        )}
                        {project.asset_summary.total_audio > 0 && (
                          <div className="flex items-center gap-1">
                            {getAssetIcon('audio')}
                            <span>{project.asset_summary.total_audio}</span>
                          </div>
                        )}
                        {project.asset_summary.total_images > 0 && (
                          <div className="flex items-center gap-1">
                            {getAssetIcon('image')}
                            <span>{project.asset_summary.total_images}</span>
                          </div>
                        )}
                        {project.asset_summary.total_lipsync_videos > 0 && (
                          <div className="flex items-center gap-1">
                            {getAssetIcon('lipsync_video')}
                            <span>{project.asset_summary.total_lipsync_videos}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(project.last_activity_at)}
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </PlaygroundLayout>
  );
}
