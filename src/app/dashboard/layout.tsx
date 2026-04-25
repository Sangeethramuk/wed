import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { GlobalDemoControl } from "@/components/dashboard/global-demo-control"
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "17rem",
        "--sidebar-width-icon": "4rem",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 min-h-0 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
      <Toaster richColors closeButton position="top-right" />
      <GlobalDemoControl />
    </SidebarProvider>
  )
}
