import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/sonner"
import { DemoNavPanel } from "@/components/demo/demo-nav-panel"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 min-h-0 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
      <Toaster richColors closeButton position="top-right" />
      <DemoNavPanel />
    </SidebarProvider>
  )
}
