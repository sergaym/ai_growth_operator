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

