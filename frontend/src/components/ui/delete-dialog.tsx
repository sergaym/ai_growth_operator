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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] gap-0 p-0 overflow-hidden">
        {/* Header with icon */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold text-gray-900 leading-6">
                {title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Trash2 className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="font-medium text-gray-900 truncate">
                  {itemName}
                </span>
              </div>
            </div>
            
            <DialogDescription className="text-sm text-gray-600 leading-5">
              {description || (
                <>
                  This {itemType} will be permanently deleted and cannot be recovered. 
                  All associated data will be lost.
                </>
              )}
            </DialogDescription>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 gap-3 sm:gap-3 flex-row">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 h-9 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 h-9 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-200 text-white font-medium",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-150"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              destructiveAction
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 