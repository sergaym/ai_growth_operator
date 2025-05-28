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
