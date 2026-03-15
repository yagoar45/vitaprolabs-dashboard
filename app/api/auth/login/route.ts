import { NextRequest, NextResponse } from "next/server"
import { signToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string }

    const validEmail = process.env.AUTH_EMAIL
    const validPassword = process.env.AUTH_PASSWORD

    if (!validEmail || !validPassword) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 500 })
    }

    if (email !== validEmail || password !== validPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const token = await signToken(email)

    const res = NextResponse.json({ ok: true })
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return res
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
