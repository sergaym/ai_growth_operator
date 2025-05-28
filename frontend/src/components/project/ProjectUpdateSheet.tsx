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

