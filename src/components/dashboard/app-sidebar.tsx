"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  ClipboardCheck,
  BarChart3,
  RefreshCcw,
  HelpCircle,
  LogOut
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const mainNavItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Grading Desk",
    url: "/dashboard/evaluation",
    icon: ClipboardCheck,
  },
  {
    title: "Re-evaluation",
    url: "/dashboard/re-evaluation/triage",
    icon: RefreshCcw,
  },
  {
    title: "Result Insights",
    url: "/dashboard/post-evaluation",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/10">
      <SidebarHeader className="border-b border-border/10 h-16 justify-center px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              className="hover:bg-transparent"
              tooltip="Symbiosis University"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-full bg-red-50 text-red-600 shrink-0 border border-red-100 shadow-sm group-data-[collapsible=icon]:size-8">
                <span className="text-[10px] font-black tracking-tighter group-data-[collapsible=icon]:text-[8px]">SIU</span>
              </div>
              <div className="flex flex-col gap-0.5 leading-none ml-2 group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-sm tracking-tight text-[#1E293B]">Symbiosis University</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname?.startsWith(item.url))
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    className={cn(
                      "h-11 px-4 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                      isActive
                        ? "bg-[#2563EB]/5 text-[#2563EB] font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <item.icon className={cn("size-5 shrink-0", !isActive && "text-muted-foreground/60")} />
                    <span className="text-[14px] group-data-[collapsible=icon]:hidden ml-1">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/10 p-6 space-y-4 group-data-[collapsible=icon]:p-2">
        <div className="flex flex-col gap-4">
          <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
            <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
              <HelpCircle className="size-4" />
            </div>
            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Help & Information</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-red-500/80 hover:text-red-600 transition-colors group">
            <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
              <LogOut className="size-4" />
            </div>
            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Log out</span>
          </Link>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-1.5 pt-4 opacity-40 group-data-[collapsible=icon]:hidden">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest text-center">
            Powered by
          </span>
          <span className="font-bold text-muted-foreground text-xs tracking-tight">
            Educ<span className="text-blue-500">AI</span>tors
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
