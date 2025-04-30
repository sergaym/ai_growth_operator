"use client";

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
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
  navMain: [
    {
      title: "Video Generation",
      url: "/playground",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Create Video",
          url: "/playground#video-generation",
        },
        {
          title: "My Videos",
          url: "/playground#my-videos",
        },
        {
          title: "Settings",
          url: "/playground#settings",
        },
      ],
    },
    {
      title: "Avatars",
      url: "/avatars",
      icon: Bot,
      items: [
        {
          title: "Create Avatar",
          url: "/playground#avatar-creation",
        },
        {
          title: "My Avatars",
          url: "/avatars",
        },
        {
          title: "Templates",
          url: "/templates",
        },
      ],
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: BookOpen,
      items: [
        {
          title: "Getting Started",
          url: "/docs/getting-started",
        },
        {
          title: "API Reference",
          url: "/docs/api",
        },
        {
          title: "Examples",
          url: "/docs/examples",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Account",
          url: "/settings/account",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "API Keys",
          url: "/settings/api-keys",
        },
      ],
    },
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
  projects: [
    {
      name: "Marketing Videos",
      url: "/projects/marketing",
      icon: Frame,
    },
    {
      name: "Sales Demos",
      url: "/projects/sales",
      icon: PieChart,
    },
    {
      name: "Training",
      url: "/projects/training",
      icon: Map,
    },
  ],
}

