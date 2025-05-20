"use client";

import React, { useState, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { useParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudUpload, Camera, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspaces } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';

export function GeneralSettings() {
  const params = useParams();
  const currentWorkspaceId = params.workspaceId as string | null;
  const { workspaces, loading: workspaceLoading, error: workspaceError } = useWorkspaces();
  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  // If no workspace is found and we have a workspace ID, show error
  if (currentWorkspaceId && !currentWorkspace) {
    throw new Error('Workspace not found');
  }

  const [workspaceName, setWorkspaceName] = useState<string>(currentWorkspace?.name || "My AI UGC Workspace");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setIsUploading(true);
      };
      
      reader.onload = (event) => {
        setIconPreview(event.target?.result as string);
        setIsUploading(false);
        
        toast({
          title: "Icon updated",
          description: "Your workspace icon has been updated.",
          duration: 3000,
        });
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload icon",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleSaveWorkspaceName = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setIsSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${currentWorkspace.id}/name`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ new_name: workspaceName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update workspace name');
      }
      
      toast({
        title: "Success",
        description: "Workspace name updated successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workspace name",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (workspaceLoading || !workspaces) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return <div className="text-red-500 text-center py-4">Workspace not found</div>;
  }

  if (workspaceError) {
    return (
      <div className="text-red-500 text-center py-4">{workspaceError}</div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start gap-6">
            <div className="relative w-20 h-20 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" onClick={handleIconClick}>
              {iconPreview ? (
                <img src={iconPreview} alt="Workspace icon" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                  <CloudUpload className="h-8 w-8 mb-1" />
                  <span className="text-[10px]">Upload</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/5 flex items-center justify-center transition-opacity">
                <div className="bg-black/50 rounded-full p-1.5">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 flex-1">
              <Label htmlFor="workspace-name" className="text-sm font-medium text-gray-700">Workspace Name</Label>
              <div className="space-y-2">
                <Input 
                  id="workspace-name" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                  className="border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                />
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled={isSaving || workspaceName === currentWorkspace?.name}
                  onClick={handleSaveWorkspaceName}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                This name will appear in the sidebar and shared documents.
              </p>
            </div>
          </div>
          <Input 
            ref={fileInputRef}
            id="icon-upload" 
            type="file" 
            accept="image/*"
            onChange={handleIconChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}