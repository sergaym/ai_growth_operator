"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

export function GeneralSettings() {
  const [workspaceName, setWorkspaceName] = useState("My AI UGC Workspace");
  const [isUploading, setIsUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const { toast } = useToast();

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
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 