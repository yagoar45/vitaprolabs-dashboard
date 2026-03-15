import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

const PUBLIC_PATHS = ["/auth", "/api/auth/login"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  const token = req.cookies.get("session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  const session = await verifyToken(token)

  if (!session) {
    const res = NextResponse.redirect(new URL("/auth", req.url))
    res.cookies.set("session", "", { maxAge: 0, path: "/" })
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
