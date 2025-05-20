"use client";
import React from "react";
import { useParams } from "next/navigation";
import PlaygroundLayout from "@/components/playground/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { MembersSettings } from "@/components/settings/MembersSettings";
import { PublicAPISettings } from "@/components/settings/PublicAPISettings";
import { Badge } from "@/components/ui/badge";
import { useWorkspaces } from '@/hooks/useWorkspace';

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  // Get workspace data from API
  const { workspaces, loading, error } = useWorkspaces();
  
  // Find the current workspace based on the URL parameter
  const currentWorkspace = workspaces.find(ws => ws.id.toString() == workspaceId);

  // Show loading state while fetching workspaces
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If the workspace isn't found in the user's workspaces, show an error
  if (!loading && workspaces.length > 0 && !currentWorkspace) {
    console.log("SHOWING ERROR")
    console.log(workspaces)
    console.log(workspaceId)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Workspace Not Found</h2>
          <p className="text-red-500">The workspace you're trying to access doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) return null; // type guard for PlaygroundLayout

  return (
    <PlaygroundLayout
      title={`${currentWorkspace.name} Settings`}
      description="Configure your workspace, team members, and application settings."
      currentWorkspace={currentWorkspace}
    >
      <div className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-4">
            <TabsTrigger value="general">Workspace</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="api" disabled className="relative">
              Public API
              <Badge variant="outline" className="ml-2 bg-zinc-100 text-zinc-500 text-[10px] py-0 px-1.5 absolute -top-2 -right-2">
                Soon
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettings workspaceId={workspaceId} />
          </TabsContent>
          
          <TabsContent value="members">
            <MembersSettings workspaceId={workspaceId} />
          </TabsContent>
          
          <TabsContent value="api">
            <PublicAPISettings workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </PlaygroundLayout>
  );
}
