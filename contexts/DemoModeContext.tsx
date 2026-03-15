import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface DemoModeContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
}

const DemoModeContext = createContext<DemoModeContextType | null>(null)

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem("demo-mode") === "true"
  })

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev
      localStorage.setItem("demo-mode", String(next))
      return next
    })
  }, [])

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (!context) throw new Error("useDemoMode must be used within DemoModeProvider")
  return context
}
