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

                </div>
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-white/10 hover:bg-white/[0.1] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Product Demo</h3>
                  <p className="text-sm text-zinc-400">Last edited 5 hours ago</p>
                </div>
                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-white/10">
              <p className="text-sm text-zinc-400">Total Videos</p>
              <p className="text-2xl font-semibold mt-1">24</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10">
              <p className="text-sm text-zinc-400">Storage Used</p>
              <p className="text-2xl font-semibold mt-1">2.4 GB</p>
            </div>
          </div>
        </Card>

        {/* Quick Tips */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-sm text-zinc-400">Start with a clear script and storyboard for best results</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-zinc-400">Use high-quality voice recordings for better lip sync</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-sm text-zinc-400">Preview your video before finalizing to ensure quality</p>
            </div>
          </div>
        </Card>
      </div>
    </PlaygroundLayout>
  );
} 