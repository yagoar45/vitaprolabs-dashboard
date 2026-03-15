import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"
import { getAvailableSources } from "@/integration/api/services/dashboardService"
import { useDemoMode } from "@/contexts/DemoModeContext"

// Mapeamento de alias para nome amigável
const sourceLabels: Record<string, string> = {
  facebook: "Facebook",
  google: "Google Ads",
  taboola: "Taboola",
  revcontent: "RevContent",
}

interface SourceFilterProps {
  value: string | undefined
  onChange: (source: string | undefined) => void
  className?: string
}

const DEMO_SOURCES = ["facebook", "google", "taboola"]

export function SourceFilter({ value, onChange, className }: SourceFilterProps) {
  const { isDemoMode } = useDemoMode()
  const [open, setOpen] = useState(false)
  const [sources, setSources] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setSources(DEMO_SOURCES)
      setLoading(false)
      return
    }
    async function fetchSources() {
      try {
        const data = await getAvailableSources()
        setSources(data)
      } catch (error) {
        console.error("Erro ao carregar fontes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSources()
  }, [isDemoMode])

  const handleSelect = (source: string | undefined) => {
    onChange(source)
    setOpen(false)
  }

  const getLabel = (source: string | undefined) => {
    if (!source || source === "all") return "Todas as fontes"
    return sourceLabels[source] || source
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
          className
        )}
      >
        <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
        <span>{getLabel(value)}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-2">
        {loading ? (
          <div className="text-sm text-muted-foreground p-2">Carregando...</div>
        ) : (
          <div className="flex flex-col gap-1">
            <Button
              variant={!value || value === "all" ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => handleSelect(undefined)}
            >
              Todas as fontes
            </Button>
            {sources.map((source) => (
              <Button
                key={source}
                variant={value === source ? "secondary" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => handleSelect(source)}
              >
                {sourceLabels[source] || source}
              </Button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
