import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon } from "@hugeicons/core-free-icons"

const copyOptions = [
  { value: "bia", label: "Bia" },
  { value: "karine", label: "Karine" },
  { value: "cloned", label: "Cloned" },
]

interface CopyFilterProps {
  value: string | undefined
  onChange: (copy: string | undefined) => void
  className?: string
}

export function CopyFilter({ value, onChange, className }: CopyFilterProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (copy: string | undefined) => {
    onChange(copy)
    setOpen(false)
  }

  const getLabel = (copy: string | undefined) => {
    if (!copy) return "Todas as copys"
    const option = copyOptions.find((o) => o.value === copy)
    return option?.label || copy
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
          className
        )}
      >
        <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
        <span>{getLabel(value)}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-2">
        <div className="flex flex-col gap-1">
          <Button
            variant={!value ? "secondary" : "ghost"}
            size="sm"
            className="justify-start"
            onClick={() => handleSelect(undefined)}
          >
            Todas as copies
          </Button>
          {copyOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={value === opt.value ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
