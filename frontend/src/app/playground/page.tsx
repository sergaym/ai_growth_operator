"use client";
import React, { useState, createElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Filter, FolderPlus, Search, MoreHorizontal, PlusCircle } from "lucide-react";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nanoid } from 'nanoid';

// Simulated project data
const projectsData = [
  {
    id: nanoid(10),
    name: "Marketing Video",
    description: "Brand awareness campaign",
    lastEdited: "2 days ago",
    status: "completed",
    thumbnail: "/projects/marketing-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Product Showcase",
    description: "New feature demonstration",
    lastEdited: "5 hours ago",
    status: "in-progress",
    thumbnail: "/projects/product-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Team Introduction",
    description: "Company culture video",
    lastEdited: "1 week ago",
    status: "completed",
    thumbnail: "/projects/team-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Tutorial Series",
    description: "How-to guides for new users",
    lastEdited: "3 days ago",
    status: "draft",
    thumbnail: "/projects/tutorial-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Customer Testimonial",
    description: "Success story interview",
    lastEdited: "Just now",
    status: "in-progress",
    thumbnail: "/projects/testimonial-thumbnail.jpg",
  },
];

// Define the Workspace type
interface Workspace {
  id: string;
  name: string;
  type?: string;
}

export default function PlaygroundOverview() {
  const { workspaces, loading, error } = useWorkspaces();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter workspaces based on search query
  const filteredWorkspaces = searchQuery && workspaces
    ? workspaces.filter((workspace: Workspace) => 
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workspaces;

  const handleNewWorkspace = () => {
    // This would typically create a new workspace via API call
    // For now, just show an alert
    alert('Create new workspace - to be implemented');
  };

  // Show loading spinner while fetching workspaces
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error message if there's an error fetching workspaces
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <PlaygroundLayout
      title="Workspaces"
      description="Select a workspace or create a new one to get started."
      currentWorkspace={{ id: '', name: 'Select a workspace' }}
    >

        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search workspaces..."
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="gap-1" onClick={handleNewWorkspace}>
              <PlusCircle className="h-4 w-4" />
              <span>New Workspace</span>
            </Button>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces && filteredWorkspaces.length > 0 ? filteredWorkspaces.map((workspace: Workspace) => (
            <Card key={workspace.id} className="overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-0">
                <a href={`/playground/${workspace.id}`} className="block">
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                        <span className="text-2xl font-bold text-indigo-500">
                          {workspace.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Settings</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{workspace.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Type: {workspace.type || 'Default'}</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center">
              <div className="mb-4">
                <FolderPlus className="h-12 w-12 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No workspaces found</h3>
              <p className="text-sm text-gray-500 mt-1">Create your first workspace to get started.</p>
              <Button className="mt-4" onClick={handleNewWorkspace}>
                Create Workspace
              </Button>
            </div>
          )}
        </div>
    </PlaygroundLayout>
  );
} 