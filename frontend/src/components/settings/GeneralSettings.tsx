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
    <div className="space-y-8">
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="workspace-name">Workspace Name</Label>
          <Input 
            id="workspace-name" 
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Enter workspace name"
          />
          <p className="text-sm text-muted-foreground">
            This name will appear in the sidebar and shared documents.
          </p>
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <Label>Workspace Icon</Label>
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-md overflow-hidden border border-border flex items-center justify-center bg-muted">
                {iconPreview ? (
                  <img src={iconPreview} alt="Workspace icon" className="w-full h-full object-cover" />
                ) : (
                  <CloudUpload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
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