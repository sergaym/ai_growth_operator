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
        
