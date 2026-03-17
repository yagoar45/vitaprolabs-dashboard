"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { AppLayout } from "@/components/custom/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/custom/DateRangePicker"
import { SourceFilter } from "@/components/custom/SourceFilter"
import { PlayerFilter } from "@/components/custom/PlayerFilter"
import { useAdsData } from "@/hooks/useAdsData"
import { AdsSearchBar } from "@/components/custom/AdsSearchBar"
import { AdsTable } from "@/components/custom/AdsTable"
import { AdsMobileList } from "@/components/custom/AdsMobileList"

export default function AdsPage() {
  const isMobile = useIsMobile()
  const {
    source, setSource,
    playerId, setPlayerId,
    dateRange, setDateRange,
    search, setSearch,
    sortField, sortDirection, handleSort,
    filteredAndSortedAds,
    displayTotals,
    loading, error,
  } = useAdsData()

  return (
    <AppLayout title="Ads">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Gerenciador de Ads</CardTitle>
            <CardDescription>
              Visualize o desempenho de todos os seus anúncios
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <SourceFilter value={source} onChange={setSource} />
            <PlayerFilter value={playerId} onChange={setPlayerId} />
          </div>
        </CardHeader>
        <CardContent>
          <AdsSearchBar value={search} onChange={setSearch} />
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : filteredAndSortedAds.length === 0 ? (
            <EmptyState hasSearch={!!search} />
          ) : isMobile ? (
            <AdsMobileList ads={filteredAndSortedAds} totals={displayTotals} />
          ) : (
            <AdsTable
              ads={filteredAndSortedAds}
              totals={displayTotals}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              showVturb={!!playerId}
            />
          )}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded bg-muted" />
      ))}
    </div>
  )
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-red-500">{message}</p>
    </div>
  )
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-muted-foreground">
        {hasSearch ? "Nenhum ad encontrado para essa busca" : "Nenhum ad encontrado"}
      </p>
    </div>
  )
}
