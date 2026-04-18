"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function DashboardHeader() {
 return (
 <header className="flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
 <SidebarTrigger />

 <div className="flex flex-1 items-center justify-end gap-2">
 <ThemeSwitcher />
 <Button variant="ghost" size="icon-sm">
 <Search className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon-sm">
 <Bell className="h-4 w-4" />
 </Button>

 <DropdownMenu>
 <DropdownMenuTrigger
 render={
 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
 <Avatar className="h-8 w-8">
 <AvatarImage src="/avatar.png" alt="User" />
 <AvatarFallback>JD</AvatarFallback>
 </Avatar>
 </Button>
 }
 />
 <DropdownMenuContent align="end" className="w-56">
 <div className="flex items-center justify-start gap-2 p-2">
 <div className="flex flex-col space-y-1">
 <p className="text-sm font-medium">John Doe</p>
 <p className="text-xs text-muted-foreground">john@example.com</p>
 </div>
 </div>
 <DropdownMenuSeparator />
 <DropdownMenuItem>Profile</DropdownMenuItem>
 <DropdownMenuItem>Settings</DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem>Log out</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </header>
 )
}
