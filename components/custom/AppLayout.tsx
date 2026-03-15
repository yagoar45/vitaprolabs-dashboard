import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/custom/Sidebar"
import { Separator } from "@/components/ui/separator"

interface AppLayoutProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function AppLayout({ title, children, actions }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex min-h-14 flex-wrap items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="font-semibold">{title}</h1>
          {actions && <div className="ml-auto">{actions}</div>}
        </header>
        <main className="flex-1 space-y-4 p-3 md:space-y-6 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
