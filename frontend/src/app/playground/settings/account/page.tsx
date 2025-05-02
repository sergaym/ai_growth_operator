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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Account Settings</h2>
            <p className="text-muted-foreground mt-1">
              Manage your personal account information and preferences.
            </p>
          </div>
          <div>
            <Link href="/playground/settings">
              <Button variant="outline">
                Back to Settings
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Main Content - Left Side */}
          <div className="md:col-span-8 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">
                  Update your personal information and how others see you on the platform.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Input 
                      id="full-name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center">
                    <AtSign className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Security Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">
                  Manage your password and security settings.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Input 
                      id="current-password" 
                      type="password"
                      placeholder="Enter your current password"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Input 
                      id="new-password" 
                      type="password"
                      placeholder="Enter a new password"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Input 
                      id="confirm-password" 
                      type="password"
                      placeholder="Confirm your new password"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline">Change Password</Button>
                </div>
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