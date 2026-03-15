"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/custom/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { DemoModeProvider } from "@/contexts/DemoModeContext"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="dash-ui-theme">
        <AuthProvider>
          <DemoModeProvider>
            {children}
          </DemoModeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
