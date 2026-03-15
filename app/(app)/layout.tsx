// Auth is handled by middleware — no client-side guard needed here
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
