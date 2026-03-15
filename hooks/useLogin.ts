"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function useLogin() {
  const { signIn, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    setError(null)
    const { error: err } = await signIn(email, password)
    if (err) setError(err)
  }

  return { isLoading, error, handleLogin }
}
