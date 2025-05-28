import React, { useEffect, useRef } from 'react';
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
  const wasOpen = useRef(false);

  // Force cleanup of any lingering portal elements
  useEffect(() => {
    if (!open && wasOpen.current) {
      console.log('Dialog closed, forcing DOM cleanup');
      
      // Small delay to ensure React has processed the state change
      const timeoutId = setTimeout(() => {
        // Remove any lingering dialog overlays
        const overlays = document.querySelectorAll('[data-state="closed"][data-slot="dialog-overlay"]');
        overlays.forEach(overlay => {
          console.warn('Removing lingering dialog overlay:', overlay);
          overlay.remove();
        });
        
        // Remove any orphaned dialog content
        const contents = document.querySelectorAll('[data-state="closed"][data-slot="dialog-content"]');
        contents.forEach(content => {
          console.warn('Removing lingering dialog content:', content);
          content.remove();
        });
        
        // Reset body styles that might have been left behind
        document.body.style.removeProperty('pointer-events');
        document.body.style.removeProperty('overflow');
        
        // Remove any Radix focus guards that might be lingering
        const focusGuards = document.querySelectorAll('[data-radix-focus-guard]');
        focusGuards.forEach(guard => {
          if (!guard.closest('[data-state="open"]')) {
            console.warn('Removing lingering focus guard:', guard);
            guard.remove();
          }
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    
    wasOpen.current = open;
  }, [open]);

  // Emergency escape hatch - allow force close with double escape
  useEffect(() => {
    let escapeCount = 0;
    let resetTimer: NodeJS.Timeout;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        escapeCount++;
        if (escapeCount >= 2) {
          // Force close on double escape
          console.warn('Force closing delete dialog via double escape');
          onOpenChange(false);
          escapeCount = 0;
        } else {
          // Reset counter after 1 second
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            escapeCount = 0;
          }, 1000);
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(resetTimer);
    };
  }, [open, onOpenChange]);

  const handleConfirm = async () => {
    try {
      console.log('Delete dialog: confirming deletion');
      await onConfirm();
    } catch (error) {
      console.error('Delete confirmation error:', error);
      // Ensure dialog can still be closed on error
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  // Prevent closing dialog when loading unless explicitly requested
  const handleOpenChange = (open: boolean) => {
    console.log('Delete dialog: open change requested:', open, 'isLoading:', isLoading);
    if (!open && isLoading) {
      // Prevent closing when loading unless parent explicitly allows it
      console.log('Delete dialog: preventing close while loading');
      return;
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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