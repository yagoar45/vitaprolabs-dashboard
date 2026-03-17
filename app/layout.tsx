export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/custom/Providers"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard de performance",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
