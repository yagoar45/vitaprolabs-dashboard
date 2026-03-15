import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Video01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { getVTurbPlayers } from "@/integration/api/services/adService"
import type { VTurbPlayer } from "@/integration/api/services/adService"
import { useDemoMode } from "@/contexts/DemoModeContext"

interface PlayerFilterProps {
  value: string | undefined
  onChange: (playerId: string | undefined) => void
  className?: string
}

const DEMO_PLAYERS: VTurbPlayer[] = [
  { id: "demo-1", name: "VSL Principal" },
  { id: "demo-2", name: "VSL Depoimentos" },
  { id: "demo-3", name: "VSL Urgência" },
]

export function PlayerFilter({ value, onChange, className }: PlayerFilterProps) {
  const { isDemoMode } = useDemoMode()
  const [open, setOpen] = useState(false)
  const [players, setPlayers] = useState<VTurbPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (isDemoMode) {
      setPlayers(DEMO_PLAYERS)
      setLoading(false)
      return
    }
    async function fetchPlayers() {
      try {
        const data = await getVTurbPlayers()
        setPlayers(data)
      } catch (error) {
        console.error("Erro ao carregar players:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [isDemoMode])

  // Limpar busca ao fechar
  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return players
    const searchLower = search.toLowerCase()
    return players.filter((p) => p.name.toLowerCase().includes(searchLower))
  }, [players, search])

  const handleSelect = (playerId: string | undefined) => {
    onChange(playerId)
    setOpen(false)
  }

  const getLabel = () => {
    if (!value) return "Player VTurb"
    const player = players.find((p) => p.id === value)
    return player?.name ?? "Player"
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
          value && "border-purple-500/50 bg-purple-500/10",
          className
        )}
      >
        <HugeiconsIcon icon={Video01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        <span className="max-w-[150px] truncate">{getLabel()}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 sm:w-80 p-2">
        {loading ? (
          <div className="text-sm text-muted-foreground p-2">Carregando...</div>
        ) : players.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">Nenhum player encontrado</div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="relative mb-1">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              />
              <Input
                placeholder="Buscar VSL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {!search.trim() && (
                <Button
                  variant={!value ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start"
                  onClick={() => handleSelect(undefined)}
                >
                  Nenhum (sem VTurb)
                </Button>
              )}
              {filteredPlayers.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">
                  Nenhuma VSL encontrada
                </div>
              ) : (
                filteredPlayers.map((player) => (
                  <Button
                    key={player.id}
                    variant={value === player.id ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start truncate"
                    onClick={() => handleSelect(player.id)}
                    title={player.name}
                  >
                    {player.name}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
