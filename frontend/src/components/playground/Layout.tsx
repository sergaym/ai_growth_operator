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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { ProjectStatus } from '@/contexts/ProjectsContext';

interface PlaygroundLayoutProps {
  title: string;
  currentWorkspace: {
    id: string;
    name: string;
  };
  description?: string;
  error?: string | null;
  children: ReactNode;
  // Enhanced header props for project pages
  showBackButton?: boolean;
  backUrl?: string;
  onBack?: () => void;
  status?: ProjectStatus;
  headerActions?: ReactNode;
  subtitle?: string;
  isProject?: boolean;
  projectName?: string;
}

export default function PlaygroundLayout({ 
  title, 
  description, 
  subtitle,
  error, 
  children,
  currentWorkspace,
  showBackButton = false,
  backUrl,
  onBack,
  status,
  headerActions,
  isProject = false,
  projectName
}: PlaygroundLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const currentWorkspaceId = params.workspaceId as string | null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else if (currentWorkspaceId) {
      router.push(`/playground/${currentWorkspaceId}`);
    } else {
      router.push('/playground');
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case ProjectStatus.IN_PROGRESS:
        return <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>;
      case ProjectStatus.DRAFT:
        return <Badge variant="default" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Draft</Badge>;
      case ProjectStatus.ARCHIVED:
        return <Badge variant="default" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar className="hidden lg:flex" />
      <SidebarInset className="bg-background">
        <Toaster richColors position="top-right" />
        
        <header className="flex h-12 lg:h-14 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
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
                      {currentWorkspace?.name || 'Loading...'}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              
              {isProject && projectName && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{projectName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              
              {!isProject && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container max-w-5xl mx-auto p-4">
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <p className="font-medium text-sm">Error: {error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Enhanced Header Section */}
              <div className="space-y-2">
                {/* Notion-style back button above title */}
                {showBackButton && (
                  <div className="mb-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBack}
                      className="gap-1 h-7 px-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors -ml-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span className="text-xs font-medium">{currentWorkspace?.name || 'Back'}</span>
                    </Button>
                  </div>
                )}
                
                {/* Title and actions row */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
                      {status && getStatusBadge(status)}
                    </div>
                    
                    {subtitle && (
                      <p className="text-muted-foreground text-sm mb-1">{subtitle}</p>
                    )}
                    
                    {description && (
                      <p className="text-muted-foreground">{description}</p>
                    )}
                  </div>
                  
                  {headerActions && (
                    <div className="shrink-0 ml-4">
                      {headerActions}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">{children}</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 