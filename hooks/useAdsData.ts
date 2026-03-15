import { useMemo, useState } from "react"
import { format, startOfMonth } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useQuery } from "@tanstack/react-query"
import { getAds } from "@/integration/api/services/adService"
import type { AdData, AdTotals } from "@/integration/api/services/adService"
import { useDemoMode } from "@/contexts/DemoModeContext"
import { DEMO_ADS_RESPONSE } from "@/data/demo"

export type SortField = keyof Omit<AdData, "name"> | "name"
export type SortDirection = "asc" | "desc"

function getInitialDateRange(): DateRange {
  return { from: startOfMonth(new Date()), to: new Date() }
}

export function useAdsData() {
  const { isDemoMode } = useDemoMode()
  const [source, setSource] = useState<string | undefined>(undefined)
  const [copy, setCopy] = useState<string | undefined>(undefined)
  const [playerId, setPlayerId] = useState<string | undefined>(undefined)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getInitialDateRange())
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("cost")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const dateParams = dateRange?.from && dateRange?.to
    ? { date_from: format(dateRange.from, "yyyy-MM-dd"), date_to: format(dateRange.to, "yyyy-MM-dd") }
    : null

  const { data: response, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["ads", dateParams?.date_from, dateParams?.date_to, source, copy, playerId],
    queryFn: () => getAds({
      date_from: dateParams!.date_from,
      date_to: dateParams!.date_to,
      source,
      copy,
      player_id: playerId,
    }),
    enabled: dateParams !== null && !isDemoMode,
  })

  const resolvedResponse = isDemoMode ? DEMO_ADS_RESPONSE : response
  const ads = resolvedResponse?.items ?? []
  const totals = resolvedResponse?.totals ?? null

  const filteredAndSortedAds = useMemo(() => {
    let result = ads

    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter((ad) => ad.name.toLowerCase().includes(searchLower))
    }

    result = [...result].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      const aNum = aValue == null ? undefined : Number(aValue)
      const bNum = bValue == null ? undefined : Number(bValue)

      if (aNum === undefined && bNum === undefined) return 0
      if (aNum === undefined) return 1
      if (bNum === undefined) return -1

      return sortDirection === "asc" ? aNum - bNum : bNum - aNum
    })

    return result
  }, [ads, search, sortField, sortDirection])

  const displayTotals = useMemo<AdTotals | null>(() => {
    if (!totals) return null
    if (!search.trim()) return totals

    const items = filteredAndSortedAds
    if (items.length === 0) return null

    const purchases = items.reduce((s, a) => s + a.purchases, 0)
    const cost = items.reduce((s, a) => s + a.cost, 0)
    const revenue = items.reduce((s, a) => s + a.revenue, 0)
    const profit = items.reduce((s, a) => s + a.profit, 0)
    const ics = items.reduce((s, a) => s + a.ics, 0)
    const clicks = items.reduce((s, a) => s + a.clicks, 0)

    const computed: AdTotals = {
      purchases,
      purchaseCpa: purchases > 0 ? Math.round((cost / purchases) * 100) / 100 : 0,
      cost: Math.round(cost * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      roas: cost > 0 ? Math.round((revenue / cost) * 100) / 100 : 0,
      ics,
      costPerIc: ics > 0 ? Math.round((cost / ics) * 100) / 100 : 0,
      clicks,
      cpc: clicks > 0 ? Math.round((cost / clicks) * 100) / 100 : 0,
    }

    const vturbItems = items.filter((a) => a.vturbViews !== undefined)
    if (vturbItems.length > 0) {
      const totalViews = vturbItems.reduce((s, a) => s + (a.vturbViews ?? 0), 0)
      const totalPlays = vturbItems.reduce((s, a) => s + (a.vturbPlays ?? 0), 0)
      computed.vturbViews = totalViews
      computed.vturbPlays = totalPlays
      computed.vturbPlayRate = totalViews > 0 ? (totalPlays / totalViews) * 100 : 0
      computed.vturbPitchAudience = vturbItems.reduce((s, a) => s + (a.vturbPitchAudience ?? 0), 0)
      const wPitchRet = vturbItems.reduce((s, a) => s + (a.vturbPitchRetention ?? 0) * (a.vturbPlays ?? 0), 0)
      computed.vturbPitchRetention = totalPlays > 0 ? wPitchRet / totalPlays : 0
      const wConvRate = vturbItems.reduce((s, a) => s + (a.vturbConversionRate ?? 0) * (a.vturbViews ?? 0), 0)
      computed.vturbConversionRate = totalViews > 0 ? wConvRate / totalViews : 0
    }

    const metaItems = items.filter((a) => a.hookRate !== undefined)
    if (metaItems.length > 0) {
      const sumHook = metaItems.reduce((s, a) => s + (a.hookRate ?? 0), 0)
      const sumHold = metaItems.reduce((s, a) => s + (a.holdRate ?? 0), 0)
      computed.hookRate = Math.round((sumHook / metaItems.length) * 100) / 100
      computed.holdRate = Math.round((sumHold / metaItems.length) * 100) / 100
    }

    return computed
  }, [totals, search, filteredAndSortedAds])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return {
    source, setSource,
    copy, setCopy,
    playerId, setPlayerId,
    dateRange, setDateRange,
    search, setSearch,
    sortField, sortDirection, handleSort,
    filteredAndSortedAds,
    displayTotals,
    loading: isDemoMode ? false : loading,
    error: isDemoMode ? null : (queryError ? "Erro ao carregar ads" : null),
  }
}
