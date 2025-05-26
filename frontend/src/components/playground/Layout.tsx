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
import { Toaster } from 'sonner';

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

  return (
    <SidebarProvider>
      <AppSidebar className="hidden lg:flex" />
      <SidebarInset className="bg-background">
        <Toaster richColors position="top-right" />
        {/* Subtle top loading bar - visible only during loading */}
        {workspaceLoading && (
          <div className="fixed top-0 left-0 w-full h-0.5 z-50">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-shimmer"></div>
          </div>
        )}
        
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
                      {workspaceLoading ? (
                        <span className="w-24 h-5 bg-gray-200 rounded animate-pulse inline-block" />
                      ) : (
                        currentWorkspace?.name || 'Workspace'
                      )}
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
            {workspaceError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <p className="font-medium text-sm">Error: {workspaceError}</p>
                <p className="text-sm mt-1">Please select a valid workspace from the sidebar.</p>
              </div>
            )}
            
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