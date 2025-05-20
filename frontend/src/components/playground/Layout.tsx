import React, { ReactNode, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useWorkspaces } from '@/hooks/useWorkspace';
import { useParams } from 'next/navigation';

interface PlaygroundLayoutProps {
  title: string;
  currentWorkspace: {
    id: string;
    name: string;
  };
  description?: string;
  error?: string | null;
  children: ReactNode;
}

export default function PlaygroundLayout({ 
  title, 
  description, 
  error, 
  children 
}: PlaygroundLayoutProps) {
  const params = useParams();
  const currentWorkspaceId = params.workspaceId as string | null;
  const { workspaces, loading: workspaceLoading, error: workspaceError } = useWorkspaces();
  const currentWorkspace = workspaces.find(ws => ws.id == currentWorkspaceId);
  // Wait for workspace data before rendering
  if (workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (workspaceError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-500">{workspaceError}</p>
          <p className="text-red-400 text-sm mt-2">Please select a valid workspace from the sidebar.</p>
        </div>
      </div>
    );
  }
  return (
    <SidebarProvider>
      <AppSidebar className="hidden lg:flex" />
      <SidebarInset className="bg-background">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/playground">My Workspaces</BreadcrumbLink>
              </BreadcrumbItem>
              
              {currentWorkspaceId && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/playground/${currentWorkspaceId}`}>
                      {currentWorkspace?.name || 'Workspace'}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container max-w-5xl mx-auto p-6">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <p className="font-medium text-sm">Error: {error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-2">
                    {description}
                  </p>
                )}
              </div>
              
              <div className="space-y-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 