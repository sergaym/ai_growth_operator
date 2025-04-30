import React, { ReactNode } from 'react';
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

interface PlaygroundLayoutProps {
  title: string;
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
                <BreadcrumbLink href="/">AI UGC</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Playground</BreadcrumbPage>
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