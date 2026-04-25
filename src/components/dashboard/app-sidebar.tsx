"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  ClipboardCheck,
  BarChart3,
  RefreshCcw,
  HelpCircle,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Assignments", url: "/dashboard/assignments", icon: ClipboardCheck },
  { title: "Grading Desk", url: "/dashboard/evaluation", icon: ClipboardCheck },
  { title: "Re-evaluation", url: "/dashboard/re-evaluation/triage", icon: RefreshCcw },
  { title: "Result Insights", url: "/dashboard/post-evaluation", icon: BarChart3 },
]

const HIDE_WHEN_COLLAPSED = "group-data-[collapsible=icon]:hidden"

function isItemActive(pathname: string, itemUrl: string) {
  if (itemUrl === "/dashboard") return pathname === "/dashboard"
  if (itemUrl === "/dashboard/assignments") return pathname.startsWith("/dashboard/assignments") || pathname.startsWith("/dashboard/pre-evaluation")
  return pathname.startsWith(itemUrl)
}

export function AppSidebar() {
  const pathname = usePathname() ?? ""

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16 justify-center px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              tooltip="Symbiosis University"
              className="group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                <span className="text-xs font-semibold">SIU</span>
              </div>
              <div className={cn("flex flex-col leading-tight min-w-0", HIDE_WHEN_COLLAPSED)}>
                <span className="font-semibold text-sm truncate">Symbiosis University</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:pt-3">
        <SidebarGroup className="group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
          <SidebarGroupContent className="group-data-[collapsible=icon]:w-full">
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:items-center">
              {mainNavItems.map((item) => {
                const active = isItemActive(pathname, item.url)
                return (
                  <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:w-auto">
                    <SidebarMenuButton
                      size="lg"
                      isActive={active}
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                      className={cn(
                        "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center",
                        active && "bg-primary/10 text-primary data-active:bg-primary/10 data-active:text-primary hover:bg-primary/15 hover:text-primary",
                      )}
                    >
                      <item.icon className="size-5" />
                      <span className={cn("text-sm font-medium", HIDE_WHEN_COLLAPSED)}>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-4 gap-1 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:w-auto">
            <SidebarMenuButton
              size="lg"
              tooltip="Help & Information"
              className="group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center"
            >
              <HelpCircle className="size-5" />
              <span className={cn("text-sm font-medium", HIDE_WHEN_COLLAPSED)}>Help & Information</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="group-data-[collapsible=icon]:w-auto">
            <SidebarMenuButton
              size="lg"
              tooltip="Log out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="size-5" />
              <span className={cn("text-sm font-medium", HIDE_WHEN_COLLAPSED)}>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div
          className={cn(
            "flex w-full items-center justify-center pt-3 mt-1 border-t border-sidebar-border/60",
            HIDE_WHEN_COLLAPSED,
          )}
        >
          <span className="text-xs text-muted-foreground/70 tracking-wider">
            Powered by <span className="font-semibold text-foreground">EducAItors</span>
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
