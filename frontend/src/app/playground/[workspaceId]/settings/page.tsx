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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  // Get workspace data from API
  const { workspaces, loading, error } = useWorkspaces();
  
  // Find the current workspace based on the URL parameter
  const currentWorkspace = workspaces.find(ws => ws.id.toString() == workspaceId);

  // Create a safe workspace object with default values if currentWorkspace is not found
  const workspace = currentWorkspace 
    ? currentWorkspace
    : { id: workspaceId, name: "Workspace" };

  // Error message if workspace not found
  const workspaceError = !loading && workspaces.length > 0 && !currentWorkspace 
    ? "The workspace you're trying to access doesn't exist or you don't have permission to view it."
    : null;

  return (
    <PlaygroundLayout
      title={`${workspace.name} Settings`}
      description="Configure your workspace, team members, and application settings."
      currentWorkspace={workspace}
    >
      <div className="space-y-8">
        {workspaceError ? (
          <Alert variant="destructive">
            <AlertDescription>{workspaceError}</AlertDescription>
          </Alert>
        ) : (
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
        )}
      </div>
    </PlaygroundLayout>
  );
}
