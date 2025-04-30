"use client";

import * as React from "react"
import {
  Bot,
  Command,
  LifeBuoy,
  Send,
  SquareTerminal,
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

const data = {
  user: {
    name: "AI UGC",
    email: "demo@example.com",
    avatar: "/avatars/default.jpg",
  },
  projects: [
    {
      name: "Playground",
      url: "/playground",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Projects",
          url: "/playground/projects",
          items: [
            {
              title: "Overview",
              url: "/playground/projects",
            },
            {
              title: "Legacy",
              url: "/playground/projects/legacy",
            },
          ],
        },
        {
          title: "History",
          url: "/playground/history",
        },
        {
          title: "Starred",
          url: "/playground/starred",
        },
        {
          title: "Settings",
          url: "/playground/settings",
        },
      ],
    },
    {
      name: "Avatars",
      url: "/avatars",
      icon: Bot,
    }
  ],
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <span className="truncate font-semibold">AI UGC</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
} 