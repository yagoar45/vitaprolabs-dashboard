import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"

interface AdsSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function AdsSearchBar({ value, onChange }: AdsSearchBarProps) {
  return (
    <div className="relative mb-4">
      <HugeiconsIcon
        icon={Search01Icon}
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      />
      <Input
        placeholder="Buscar por nome do ad..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
