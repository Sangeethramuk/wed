"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  PlusCircle,
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
  { title: "Prepare Assignment", url: "/dashboard/pre-evaluation", icon: PlusCircle },
  { title: "Grading Desk", url: "/dashboard/evaluation", icon: ClipboardCheck },
  { title: "Re-evaluation", url: "/dashboard/re-evaluation/triage", icon: RefreshCcw },
  { title: "Result Insights", url: "/dashboard/post-evaluation", icon: BarChart3 },
]

function isItemActive(pathname: string, itemUrl: string) {
  if (itemUrl === "/dashboard") return pathname === "/dashboard"
  return pathname.startsWith(itemUrl)
}

export function AppSidebar() {
  const pathname = usePathname() ?? ""

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16 justify-center px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                <span className="text-xs font-semibold">SIU</span>
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-semibold text-sm truncate">Symbiosis University</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => {
                const active = isItemActive(pathname, item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size="lg"
                      isActive={active}
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                      className={cn(
                        active && "bg-primary/10 text-primary data-active:bg-primary/10 data-active:text-primary hover:bg-primary/15 hover:text-primary",
                      )}
                    >
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 gap-1">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Help & Information">
              <HelpCircle className="size-5" />
              <span className="text-sm font-medium">Help & Information</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Log out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-5" />
              <span className="text-sm font-medium">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex w-full items-center justify-center pt-3 mt-1 border-t border-sidebar-border/60">
          <span className="text-xs text-muted-foreground/70 tracking-wider">
            Powered by <span className="font-semibold text-foreground">EducAItors</span>
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
