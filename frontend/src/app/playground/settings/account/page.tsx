"use client";
import React, { useState } from "react";
import PlaygroundLayout from "@/components/playground/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, AtSign, Lock, Shield, LogOut } from "lucide-react";
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your password and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter>
                <Button variant="outline">Change Password</Button>
              </CardFooter>
            </Card>
          </div>
          
