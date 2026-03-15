import type { AdData, AdTotals } from "@/integration/api/services/adService"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"

interface AdsMobileListProps {
  ads: AdData[]
  totals: AdTotals | null
}

function profitColor(value: number) {
  return value >= 0 ? "text-green-500" : "text-red-500"
}

function StatCell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${className ?? ""}`}>{value}</p>
    </div>
  )
}

export function AdsMobileList({ ads, totals }: AdsMobileListProps) {
  return (
    <div className="space-y-3">
      {totals && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Total</p>
          <div className="grid grid-cols-3 gap-3">
            <StatCell label="Compras" value={formatNumber(totals.purchases)} />
            <StatCell label="CPA" value={formatCurrency(totals.purchaseCpa)} />
            <StatCell label="ROAS" value={`${totals.roas.toFixed(2)}x`} />
            <StatCell label="Custo" value={formatCurrency(totals.cost)} />
            <StatCell label="Receita" value={formatCurrency(totals.revenue)} />
            <StatCell label="Lucro" value={formatCurrency(totals.profit)} className={profitColor(totals.profit)} />
            {totals.hookRate !== undefined && (
              <>
                <StatCell label="Hook" value={formatPercent(totals.hookRate)} />
                <StatCell label="Hold" value={formatPercent(totals.holdRate)} />
              </>
            )}
          </div>
        </div>
      )}
      {ads.map((ad) => (
        <div key={ad.name} className="rounded-lg border p-3">
          <p className="text-sm font-medium mb-3 break-words">{ad.name}</p>
          <div className="grid grid-cols-3 gap-3">
            <StatCell label="Compras" value={formatNumber(ad.purchases)} />
            <StatCell label="CPA" value={formatCurrency(ad.purchaseCpa)} />
            <StatCell label="ROAS" value={`${ad.roas.toFixed(2)}x`} />
            <StatCell label="Custo" value={formatCurrency(ad.cost)} />
            <StatCell label="Receita" value={formatCurrency(ad.revenue)} />
            <StatCell label="Lucro" value={formatCurrency(ad.profit)} className={profitColor(ad.profit)} />
            {ad.hookRate !== undefined && (
              <>
                <StatCell label="Hook" value={formatPercent(ad.hookRate)} />
                <StatCell label="Hold" value={formatPercent(ad.holdRate)} />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
