"use client";
import React, { useState, useEffect } from "react";
import PlaygroundLayout from "@/components/playground/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, AtSign, Lock, Shield, Camera, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AccountSettings() {
  const [fullName, setFullName] = useState("John Doe");
  const [email] = useState("john.doe@example.com");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-save name when it changes
  useEffect(() => {
    // Debounce to avoid too many saves
    const timer = setTimeout(() => {
      // We would typically save to the server here
      // For now, we'll just show a toast for demonstration
      toast({
        title: "Name updated",
        description: "Your name has been updated automatically.",
        duration: 2000,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [fullName, toast]);

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

  return (
    <PlaygroundLayout
      title="Settings"
      description="Configure your workspace, team members, and application settings."
    >
      <div className="max-w-4xl mx-auto space-y-8 pt-4">
        {/* Profile Section */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-4">Profile Information</h3>
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
            
            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full-name" className="text-sm text-gray-600 mb-1 block">Name</Label>
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                      <Input 
                        id="full-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="flex-1 border-gray-200 focus:border-gray-300"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-600 mb-1 block">Email Address</Label>
                    <div className="flex items-center">
                      <AtSign className="w-4 h-4 mr-2 text-gray-500" />
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="flex-1 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="bg-gray-100" />
        
        {/* Password Section */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-4">Security</h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current-password" className="text-sm text-gray-600 mb-1 block">Current Password</Label>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  <Input 
                    id="current-password"
                    type="password"
                    placeholder="Enter current"
                    className="flex-1 border-gray-200 focus:border-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="new-password" className="text-sm text-gray-600 mb-1 block">New Password</Label>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" />
                  <Input 
                    id="new-password"
                    type="password"
                    placeholder="Enter new"
                    className="flex-1 border-gray-200 focus:border-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirm-password" className="text-sm text-gray-600 mb-1 block">Confirm Password</Label>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" />
                  <Input 
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new"
                    className="flex-1 border-gray-200 focus:border-gray-300"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Button variant="outline" size="sm">
                Update Password
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="bg-gray-100" />
        
        {/* Account Actions - Only Delete Account */}
        <div className="pt-2">
          <details className="group">
            <summary className="flex items-center text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>Advanced Account Options</span>
            </summary>
            <div className="mt-4 pl-6 border-l-2 border-gray-100">
              <Button 
                variant="outline" 
                className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600" 
                size="sm"
              >
                Delete Account
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </details>
        </div>
      </div>
    </PlaygroundLayout>
  );
} 