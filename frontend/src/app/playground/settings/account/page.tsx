"use client";
import React, { useState } from "react";
import PlaygroundLayout from "@/components/playground/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, AtSign, Lock, Shield, LogOut, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function AccountSettings() {
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
        
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
          duration: 3000,
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
      duration: 3000,
    });
  };

  return (
    <PlaygroundLayout
      title="Settings"
      description="Configure your workspace, team members, and application settings."
    >
      <div className="max-w-4xl mx-auto space-y-8 pt-4">
        {/* Profile Section */}
        <div className="flex items-start gap-6">
          {/* Profile Photo */}
          <div className="relative group">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || "/avatars/default.jpg"} />
              <AvatarFallback className="text-xl">{fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <div className="bg-black/50 rounded-3xl p-2">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </Label>
            <Input 
              id="avatar-upload" 
              type="file" 
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
            </div>
          </div>
          
          {/* Sidebar - Right Side */}
          <div className="md:col-span-4 space-y-8">
            {/* Profile Picture Section */}
            <div className="bg-muted/40 p-6 rounded-lg border border-border space-y-4">
              <h3 className="font-medium">Profile Picture</h3>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={avatarPreview || "/avatars/default.jpg"} />
                  <AvatarFallback>{fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="w-full">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90">
                      Upload New Image
                    </div>
                  </Label>
                  <Input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Square images work best. Max size 5MB.
                </p>
              </div>
            </div>
            
            {/* Account Actions Section */}
            <div className="bg-muted/40 p-6 rounded-lg border border-border space-y-6">
              <h3 className="font-medium">Account Actions</h3>
              <div className="space-y-6">
                <Link href="/api/auth/logout" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </Link>
                
                <Separator className="my-2" />
                
                <div>
                  <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlaygroundLayout>
  );
} 