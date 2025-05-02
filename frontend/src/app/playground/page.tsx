"use client";
import React, { useState, createElement } from "react";
import { Card } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Filter, FolderPlus, Search, MoreHorizontal, PlusCircle } from "lucide-react";
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

export default function PlaygroundOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState(projectsData);

  // Filter projects based on search query
  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">Completed</span>;
      case "in-progress":
        return <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">In Progress</span>;
      case "draft":
        return <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">Draft</span>;
      default:
        return null;
    }
  };

  const handleNewProject = () => {
    const projectId = nanoid(10);
    window.location.href = `/playground/${projectId}`;
  };

  return (
    <PlaygroundLayout
      title="Projects"
      description="Create and manage your AI-generated content projects."
    >
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setProjects(projectsData)}>All Projects</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProjects(projectsData.filter(p => p.status === "completed"))}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProjects(projectsData.filter(p => p.status === "in-progress"))}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProjects(projectsData.filter(p => p.status === "draft"))}>
                Drafts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleNewProject} className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderPlus className="mx-auto h-12 w-12 text-gray-400" />
          {createElement('h3', { className: "mt-4 text-lg font-medium" }, "No projects found")}
          <p className="mt-1 text-gray-500">Get started by creating a new project.</p>
          <Button onClick={handleNewProject} className="mt-4">Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {/* Placeholder for thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-xl font-bold text-white/70">{project.name.substring(0, 2).toUpperCase()}</div>
                </div>
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => window.location.href = `/playground/${project.id}`}>
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  {createElement('h3', { className: "font-medium truncate mr-2" }, project.name)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-gray-500 mb-3 truncate">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {project.lastEdited}
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PlaygroundLayout>
  );
} 