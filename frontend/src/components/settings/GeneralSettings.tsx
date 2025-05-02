"use client";
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CloudUpload, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

export function GeneralSettings() {
  const [workspaceName, setWorkspaceName] = useState("My AI UGC Workspace");
  const [isUploading, setIsUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setIsUploading(true);
      };
      
      reader.onload = (event) => {
        setIconPreview(event.target?.result as string);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the workspace settings
    toast({
      title: "Settings saved",
      description: "Your workspace settings have been updated successfully.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-6">
        {/* Workspace Icon - Now left aligned */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-medium">Workspace</h3>
          <div className="flex items-start gap-6">
            <div 
              className="relative w-20 h-20 rounded-md overflow-hidden flex items-center justify-center 
                        bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleIconClick}
            >
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
              <Input 
                id="workspace-name" 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
                className="border-gray-200 focus:border-gray-300 focus:ring-gray-200"
              />
              <p className="text-xs text-gray-500">
                This name will appear in the sidebar and shared documents.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="icon-upload" className="cursor-pointer">
                  <div className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    Upload New Icon
                  </div>
                </Label>
                <Input 
                  id="icon-upload" 
                  type="file" 
                  accept="image/*"
                  onChange={handleIconChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">Recommended size: 128×128px. Max file size: 5MB.</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 