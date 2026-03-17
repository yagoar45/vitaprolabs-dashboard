"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Home09Icon, Logout03Icon, MegaphoneIcon, Rocket01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home09Icon },
  { title: "Ads", url: "/ads", icon: MegaphoneIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shadow-sm">
            <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} className="h-6 w-6 text-primary" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Dashboard
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url}>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                          "cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-sidebar-foreground/80"
                        )}
                      >
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              onClick={signOut}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                "hover:bg-red-500/10 hover:text-red-500",
                "text-sidebar-foreground/60 cursor-pointer"
              )}
            >
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
