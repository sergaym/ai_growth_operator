"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Edit3, 
  Save, 
  Loader2,
  Info,
  Calendar,
  Clock,
  Hash,
  GripVertical
} from "lucide-react";
import { ProjectStatus, type Project, type ProjectUpdateRequest } from "@/hooks/useProjects";

interface ProjectUpdateSheetProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (request: ProjectUpdateRequest) => Promise<Project | null>;
  isUpdating?: boolean;
}

// Status display configuration with better styling
const statusConfig = {
  [ProjectStatus.DRAFT]: {
    label: "Draft",
    description: "Project is in draft state",
    variant: "secondary" as const,
    dotColor: "bg-amber-500"
  },
  [ProjectStatus.IN_PROGRESS]: {
    label: "In Progress",
    description: "Actively working on this project",
    variant: "default" as const,
    dotColor: "bg-blue-500"
  },
  [ProjectStatus.COMPLETED]: {
    label: "Completed",
    description: "Project is finished",
    variant: "default" as const,
    dotColor: "bg-green-500"
  },
  [ProjectStatus.ARCHIVED]: {
    label: "Archived",
    description: "Project is archived",
    variant: "outline" as const,
    dotColor: "bg-gray-500"
  }
};

export function ProjectUpdateSheet({ 
  project, 
  open, 
  onOpenChange, 
  onUpdate, 
  isUpdating = false 
}: ProjectUpdateSheetProps) {
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<ProjectUpdateRequest>({
    name: "",
    description: "",
    status: ProjectStatus.DRAFT,
    thumbnail_url: "",
  });

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // Resize state
  const [width, setWidth] = useState(540); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Sync form data with project when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || ProjectStatus.DRAFT,
        thumbnail_url: project.thumbnail_url || "",
      });
    }
  }, [project]);

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sheetRef.current) return;
    
    const rect = sheetRef.current.getBoundingClientRect();
    const newWidth = window.innerWidth - e.clientX;
    
    // Constrain width between 320px and 80% of window width
    const minWidth = 320;
    const maxWidth = window.innerWidth * 0.8;
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setWidth(constrainedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle form field changes
  const handleChange = (field: keyof ProjectUpdateRequest, value: string | ProjectStatus) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!project) return;

    // Validation
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.length > 255) {
      toast({
        title: "Validation Error",
        description: "Project name must be less than 255 characters.",
        variant: "destructive",
      });
      return;
    }

    if (formData.description && formData.description.length > 1000) {
      toast({
        title: "Validation Error",
        description: "Project description must be less than 1000 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Only send fields that have changed
      const updateRequest: ProjectUpdateRequest = {};
      
      if (formData.name !== project.name) {
        updateRequest.name = formData.name;
      }
      
      if (formData.description !== project.description) {
        updateRequest.description = formData.description;
      }
      
      if (formData.status !== project.status) {
        updateRequest.status = formData.status;
      }
      
      if (formData.thumbnail_url !== project.thumbnail_url) {
        updateRequest.thumbnail_url = formData.thumbnail_url;
      }

      // Only proceed if there are actual changes
      if (Object.keys(updateRequest).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to the project.",
        });
        onOpenChange(false);
        return;
      }

      const updatedProject = await onUpdate(updateRequest);
      
      if (updatedProject) {
        toast({
          title: "Project Updated",
          description: "Project details have been updated successfully.",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (project) {
      // Reset form to original values
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || ProjectStatus.DRAFT,
        thumbnail_url: project.thumbnail_url || "",
      });
    }
    onOpenChange(false);
  };

  // Check if there are unsaved changes
  const hasChanges = project && (
    formData.name !== project.name ||
    formData.description !== project.description ||
    formData.status !== project.status ||
    formData.thumbnail_url !== project.thumbnail_url
  );

  if (!project) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        ref={sheetRef}
        className="flex flex-col p-0 w-auto border-l"
        style={{ 
          width: `${width}px`,
          maxWidth: 'none'
        }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors z-10 group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Content with proper padding */}
        <div className="flex flex-col h-full p-6 pl-8">
          <SheetHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Edit3 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <SheetTitle className="text-xl">Edit Project Details</SheetTitle>
                <SheetDescription className="text-base">
                  Make changes to your project information. Click save when you're done.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="flex-1 space-y-8 overflow-auto">
            {/* Project Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter project name"
                disabled={isSaving || isUpdating}
                maxLength={255}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                {(formData.name || "").length}/255 characters
              </p>
            </div>

            {/* Project Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your project"
                disabled={isSaving || isUpdating}
                maxLength={1000}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {(formData.description || "").length}/1000 characters
              </p>
            </div>

            {/* Project Status */}
            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as ProjectStatus)}
                disabled={isSaving || isUpdating}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select status">
                    {formData.status && (
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${statusConfig[formData.status].dotColor}`} />
                        <span>{statusConfig[formData.status].label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                        <div className="space-y-1">
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-muted-foreground">{config.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-3">
              <Label htmlFor="thumbnail" className="text-sm font-medium">
                Thumbnail URL
              </Label>
              <Input
                id="thumbnail"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isSaving || isUpdating}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Optional: URL to a thumbnail image for your project
              </p>
            </div>

            <Separator className="my-8" />

            {/* Project Information Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Project Information
                </CardTitle>
                <CardDescription>
                  Read-only project metadata and timestamps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Created
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last Updated
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    Project ID
                  </div>
                  <div className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                    {project.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <SheetFooter className="flex-col gap-2 pt-6 mt-auto">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isUpdating || !hasChanges}
              className="w-full h-11"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSaving || isUpdating}
              className="w-full h-11"
              size="lg"
            >
              Cancel
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
} 