"use client"

import Link from "next/link"
import {
  Home,
  PlusCircle,
  ClipboardCheck,
  BarChart3,
  RefreshCcw,
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
  {
    title: "Re-evaluation Requests",
    url: "/dashboard/re-evaluation",
    icon: RefreshCcw,
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
            <SidebarMenu className="gap-2">
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

      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        {/* Expanded View */}
        <div className="flex w-full flex-col items-center justify-center gap-1 group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">
            Powered by
          </span>
          <span className="font-semibold normal-case text-muted-foreground text-xs">
            Educ<span className="text-blue-500">AI</span>tors
          </span>
        </div>

        {/* Collapsed View */}
        <div className="hidden w-full items-center justify-center group-data-[collapsible=icon]:flex">
          <span className="font-bold text-muted-foreground">
            E<span className="text-blue-500">AI</span>
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
