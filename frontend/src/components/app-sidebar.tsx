"use client";

import * as React from "react"
import {
  Bot,
  Command,
  LifeBuoy,
  Send,
  SquareTerminal,
  Settings,
  CreditCard,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { nanoid } from 'nanoid'
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps): React.ReactNode {
  const { user: authState } = useAuth();
  const pathname = usePathname();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  
  // Extract workspace ID from pathname using regex, but do it in useEffect
  useEffect(() => {
    const workspaceMatch = pathname.match(/\/playground\/([^\/]+)/);
    setCurrentWorkspaceId(workspaceMatch ? workspaceMatch[1] : null);
  }, [pathname]);
  
  const user = {
    name: authState?.user?.first_name,
    email: authState?.user?.email,
    avatar: "/avatars/default.jpg"
  } as User;
  
  // Create different menu items based on whether we're at the workspace selection page
  // or within a specific workspace
  const getProjectsMenu = () => {
    // At the workspace selection page
    if (!currentWorkspaceId) {
      return [
        {
          name: "Workspaces",
          url: "/playground",
          icon: SquareTerminal,
          isActive: true,
          items: [],
        }
      ];
    }

    // When a workspace is selected, show normal menu
    return [
      {
        name: "Playground",
        url: `/playground/${currentWorkspaceId}`,
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: `/playground/${currentWorkspaceId}`,
          }
        ],
      },
      {
        name: "Billing",
        url: `/playground/${currentWorkspaceId}/billing`,
        icon: CreditCard,
        items: [
          {
            title: "Subscription",
            url: `/playground/${currentWorkspaceId}/billing`,
          },
          {
            title: "Invoices",
            url: `/playground/${currentWorkspaceId}/billing/invoices`,
          }
        ],
      },
      {
        name: "Settings",
        url: `/playground/${currentWorkspaceId}/settings`,
        icon: Settings,
      },
      {
        name: "Avatars",
        url: "#",
        icon: Bot,
        disabled: true,
      }
    ];
  };

  const data = {
    user,
    projects: getProjectsMenu(),
    navSecondary: [
      {
        title: "Support",
        url: "https://help.aiugc.com",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "https://feedback.aiugc.com",
        icon: Send,
      },
    ],
  };

  const router = useRouter();
  const handleNewProject = () => {
    const projectId = nanoid(10);
    router.push(`/playground/${currentWorkspaceId}/projects/${projectId}`);
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {currentWorkspaceId && (
          <div className="px-4">
            <Button 
              variant="outline"
              className="w-full"
              onClick={handleNewProject}
            >
              New Project
            </Button>
          </div>
        )}
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
} 