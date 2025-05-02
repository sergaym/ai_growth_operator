"use client";
import React from "react";
import PlaygroundLayout from "@/components/playground/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { MembersSettings } from "@/components/settings/MembersSettings";
import { PublicAPISettings } from "@/components/settings/PublicAPISettings";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <PlaygroundLayout
      title="Settings"
      description="Configure your workspace, team members, and application settings."
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Workspace Settings</h2>
            <p className="text-muted-foreground mt-1">
              Manage your workspace preferences, team members, and integrations.
            </p>
          </div>
          <div>
            <Link href="/playground/settings/account">
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="api">Public API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="members">
            <MembersSettings />
          </TabsContent>
          
          <TabsContent value="api">
            <PublicAPISettings />
          </TabsContent>
        </Tabs>
      </div>
    </PlaygroundLayout>
  );
} 