import { useState } from "react"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { type DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"

type PresetKey = "today" | "yesterday" | "last7" | "last14" | "thisMonth" | "lastMonth" | "custom"

interface Preset {
  key: PresetKey
  label: string
  getRange: () => DateRange
}

const presets: Preset[] = [
  {
    key: "today",
    label: "Hoje",
    getRange: () => {
      const today = new Date()
      return { from: today, to: today }
    },
  },
  {
    key: "yesterday",
    label: "Ontem",
    getRange: () => {
      const yesterday = subDays(new Date(), 1)
      return { from: yesterday, to: yesterday }
    },
  },
  {
    key: "last7",
    label: "Últimos 7 dias",
    getRange: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    key: "last14",
    label: "Últimos 14 dias",
    getRange: () => ({
      from: subDays(new Date(), 13),
      to: new Date(),
    }),
  },
  {
    key: "thisMonth",
    label: "Este mês",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    key: "lastMonth",
    label: "Mês passado",
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      }
    },
  },
]

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>("thisMonth")
  const isMobile = useIsMobile()

  const handlePresetClick = (preset: Preset) => {
    setSelectedPreset(preset.key)
    onChange(preset.getRange())
    setOpen(false)
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setSelectedPreset("custom")
    onChange(range)
  }

  const formatDateRange = () => {
    if (!value?.from) return "Selecione um período"
    if (!value.to) return format(value.from, "dd MMM yyyy", { locale: ptBR })
    if (isMobile) {
      return `${format(value.from, "dd/MM", { locale: ptBR })} - ${format(value.to, "dd/MM", { locale: ptBR })}`
    }
    return `${format(value.from, "dd MMM", { locale: ptBR })} - ${format(value.to, "dd MMM yyyy", { locale: ptBR })}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
          className
        )}
      >
        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        <span>{formatDateRange()}</span>
      </PopoverTrigger>
      <PopoverContent align={isMobile ? "center" : "start"} className="w-auto p-0">
        <div className={cn("flex", isMobile ? "flex-col" : "flex-row")}>
          <div className={cn(
            "flex gap-1 p-3",
            isMobile ? "flex-row flex-wrap border-b" : "flex-col border-r"
          )}>
            {presets.map((preset) => (
              <Button
                key={preset.key}
                variant={selectedPreset === preset.key ? "secondary" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              variant={selectedPreset === "custom" ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => setSelectedPreset("custom")}
            >
              Personalizado
            </Button>
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleCalendarSelect}
              numberOfMonths={isMobile ? 1 : 2}
              disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
