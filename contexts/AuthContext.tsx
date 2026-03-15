"use client"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json() as { error: string }
        return { error: data.error ?? "Erro ao fazer login" }
      }

      router.push("/dashboard")
      return { error: null }
    } catch {
      return { error: "Erro de conexão" }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth")
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
