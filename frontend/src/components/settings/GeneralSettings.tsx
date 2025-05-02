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
        
        // Show toast on successful upload
        toast({
          title: "Icon updated",
          description: "Your workspace icon has been updated.",
          duration: 3000,
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-6">
        {/* Workspace Icon - Now left aligned */}
        <div className="flex flex-col space-y-4">
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