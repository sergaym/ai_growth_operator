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
          
          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 border-gray-200 focus:border-gray-300"
                  placeholder="Your name"
                />
              </div>
              
              <div className="flex items-center">
                <AtSign className="w-4 h-4 mr-2 text-gray-500" />
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-gray-200 focus:border-gray-300"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveProfile}
              className="mt-2"
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        </div>
        
        <Separator className="bg-gray-100" />
        
        {/* Password Section */}
        <div className="space-y-5">
          <h3 className="text-base font-medium text-gray-700">Password</h3>
          
          <div className="grid gap-4 max-w-lg">
            <div className="flex items-center">
              <Lock className="w-4 h-4 mr-2 text-gray-500" />
              <Input 
                type="password"
                placeholder="Current password"
                className="flex-1 border-gray-200 focus:border-gray-300"
              />
            </div>
            
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-gray-500" />
              <Input 
                type="password"
                placeholder="New password"
                className="flex-1 border-gray-200 focus:border-gray-300"
              />
            </div>
            
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-gray-500" />
              <Input 
                type="password"
                placeholder="Confirm new password"
                className="flex-1 border-gray-200 focus:border-gray-300"
              />
            </div>
            
            <div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="bg-gray-100" />
        
        {/* Account Actions */}
        <div className="space-y-5">
          <h3 className="text-base font-medium text-gray-700">Account</h3>
          
          <div className="space-y-4">
            <Link href="/api/auth/logout" className="block max-w-lg">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </Link>
            
            <div className="pt-2 max-w-lg">
              <Button variant="destructive" className="w-full justify-start" size="sm">
                Delete Account
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PlaygroundLayout>
  );
} 