import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { TableHead } from "@/components/ui/table"
import type { SortField, SortDirection } from "@/hooks/useAdsData"

interface SortableHeaderProps {
  field: SortField
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  className?: string
  children: React.ReactNode
}

export function SortableHeader({ field, sortField, sortDirection, onSort, className, children }: SortableHeaderProps) {
  return (
    <TableHead
      className={`cursor-pointer select-none hover:bg-muted/50 transition-colors ${className ?? ""}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1 ${className?.includes("text-right") ? "justify-end" : ""}`}>
        {children}
        {sortField === field && (
          <HugeiconsIcon
            icon={sortDirection === "desc" ? ArrowDown01Icon : ArrowUp01Icon}
            className="size-3"
          />
        )}
      </div>
    </TableHead>
  )
}
