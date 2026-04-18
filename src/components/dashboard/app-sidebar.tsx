"use client"

import Link from "next/link"
import {
  Home,
  PlusCircle,
  ClipboardCheck,
  BarChart3,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const mainNavItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Prepare Assignment",
    url: "/dashboard/pre-evaluation",
    icon: PlusCircle,
  },
  {
    title: "Grading Desk",
    url: "/dashboard/evaluation",
    icon: ClipboardCheck,
  },
  {
    title: "Result Insights",
    url: "/dashboard/post-evaluation",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-14 justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-red-100 text-red-800 shrink-0">
                <span className="text-[10px] font-bold">IIMB</span>
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-base tracking-tight">IIM Bangalore</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex w-full items-center justify-center">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Powered by <span className="font-semibold normal-case text-foreground">EducAItors</span>
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
