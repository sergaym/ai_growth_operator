import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemName: string;
  itemType?: string;
  destructiveAction?: string;
  isLoading?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  itemType = "item",
  destructiveAction = "Delete",
  isLoading = false
}: DeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    // Don't auto-close - let parent component handle dialog state
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

