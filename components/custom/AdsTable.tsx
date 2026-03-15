import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdData, AdTotals } from "@/integration/api/services/adService"
import { formatCurrency, formatNumber, formatPercent, formatOptionalNumber } from "@/lib/utils"
import { SortableHeader } from "./SortableHeader"
import type { SortField, SortDirection } from "@/hooks/useAdsData"

interface AdsTableProps {
  ads: AdData[]
  totals: AdTotals | null
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  showVturb: boolean
}

function profitColor(value: number) {
  return value >= 0 ? "text-green-500" : "text-red-500"
}

export function AdsTable({ ads, totals, sortField, sortDirection, onSort, showVturb }: AdsTableProps) {
  const sortProps = { sortField, sortDirection, onSort }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="name" {...sortProps}>Ad</SortableHeader>
            <SortableHeader field="purchases" className="text-right" {...sortProps}>Purchase</SortableHeader>
            <SortableHeader field="purchaseCpa" className="text-right" {...sortProps}>CPA</SortableHeader>
            <SortableHeader field="cost" className="text-right" {...sortProps}>Custo</SortableHeader>
            <SortableHeader field="revenue" className="text-right" {...sortProps}>Faturamento</SortableHeader>
            <SortableHeader field="profit" className="text-right" {...sortProps}>Lucro</SortableHeader>
            <SortableHeader field="roas" className="text-right" {...sortProps}>ROAS</SortableHeader>
            <SortableHeader field="ics" className="text-right" {...sortProps}>ICs</SortableHeader>
            <SortableHeader field="costPerIc" className="text-right" {...sortProps}>Custo/IC</SortableHeader>
            <SortableHeader field="clicks" className="text-right" {...sortProps}>Clicks</SortableHeader>
            <SortableHeader field="cpc" className="text-right" {...sortProps}>CPC</SortableHeader>
            <SortableHeader field="hookRate" className="text-right" {...sortProps}>Hook Rate</SortableHeader>
            <SortableHeader field="holdRate" className="text-right" {...sortProps}>Hold Rate</SortableHeader>
            {showVturb && (
              <>
                <SortableHeader field="vturbViews" className="text-right" {...sortProps}>Views</SortableHeader>
                <SortableHeader field="vturbPlays" className="text-right" {...sortProps}>Plays</SortableHeader>
                <SortableHeader field="vturbPlayRate" className="text-right" {...sortProps}>Play Rate</SortableHeader>
                <SortableHeader field="vturbPitchRetention" className="text-right" {...sortProps}>Ret. Pitch</SortableHeader>
                <SortableHeader field="vturbPitchAudience" className="text-right" {...sortProps}>Aud. Pitch</SortableHeader>
                <SortableHeader field="vturbConversionRate" className="text-right" {...sortProps}>Conv. Rate</SortableHeader>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {totals && (
            <TableRow className="bg-muted/50 font-semibold border-b-2">
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-right">{formatNumber(totals.purchases)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.purchaseCpa)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.cost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.revenue)}</TableCell>
              <TableCell className={`text-right ${profitColor(totals.profit)}`}>
                {formatCurrency(totals.profit)}
              </TableCell>
              <TableCell className="text-right">{totals.roas.toFixed(2)}x</TableCell>
              <TableCell className="text-right">{formatNumber(totals.ics)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.costPerIc)}</TableCell>
              <TableCell className="text-right">{formatNumber(totals.clicks)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.cpc)}</TableCell>
              <TableCell className="text-right">{formatPercent(totals.hookRate)}</TableCell>
              <TableCell className="text-right">{formatPercent(totals.holdRate)}</TableCell>
              {showVturb && (
                <>
                  <TableCell className="text-right">{formatOptionalNumber(totals.vturbViews)}</TableCell>
                  <TableCell className="text-right">{formatOptionalNumber(totals.vturbPlays)}</TableCell>
                  <TableCell className="text-right">{formatPercent(totals.vturbPlayRate)}</TableCell>
                  <TableCell className="text-right">{formatPercent(totals.vturbPitchRetention)}</TableCell>
                  <TableCell className="text-right">{formatOptionalNumber(totals.vturbPitchAudience)}</TableCell>
                  <TableCell className="text-right">{formatPercent(totals.vturbConversionRate, 2)}</TableCell>
                </>
              )}
            </TableRow>
          )}
          {ads.map((ad) => (
            <TableRow key={ad.name}>
              <TableCell className="max-w-[300px] truncate font-medium" title={ad.name}>
                {ad.name}
              </TableCell>
              <TableCell className="text-right">{formatNumber(ad.purchases)}</TableCell>
              <TableCell className="text-right">{formatCurrency(ad.purchaseCpa)}</TableCell>
              <TableCell className="text-right">{formatCurrency(ad.cost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(ad.revenue)}</TableCell>
              <TableCell className={`text-right ${profitColor(ad.profit)}`}>
                {formatCurrency(ad.profit)}
              </TableCell>
              <TableCell className="text-right">{ad.roas.toFixed(2)}x</TableCell>
              <TableCell className="text-right">{formatNumber(ad.ics)}</TableCell>
              <TableCell className="text-right">{formatCurrency(ad.costPerIc)}</TableCell>
              <TableCell className="text-right">{formatNumber(ad.clicks)}</TableCell>
              <TableCell className="text-right">{formatCurrency(ad.cpc)}</TableCell>
              <TableCell className="text-right">{formatPercent(ad.hookRate)}</TableCell>
              <TableCell className="text-right">{formatPercent(ad.holdRate)}</TableCell>
              {showVturb && (
                <>
                  <TableCell className="text-right">{formatOptionalNumber(ad.vturbViews)}</TableCell>
                  <TableCell className="text-right">{formatOptionalNumber(ad.vturbPlays)}</TableCell>
                  <TableCell className="text-right">{formatPercent(ad.vturbPlayRate)}</TableCell>
                  <TableCell className="text-right">{formatPercent(ad.vturbPitchRetention)}</TableCell>
                  <TableCell className="text-right">{formatOptionalNumber(ad.vturbPitchAudience)}</TableCell>
                  <TableCell className="text-right">{formatPercent(ad.vturbConversionRate, 2)}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
