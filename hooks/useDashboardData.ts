import { useState } from "react"
import { format, startOfMonth } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useQuery } from "@tanstack/react-query"
import {
  getDashboardData,
  getDailyData,
  getSalesByCountry,
  getHourlyData,
  getSalesBySource,
} from "@/integration/api/services/dashboardService"

function getInitialDateRange(): DateRange {
  return { from: startOfMonth(new Date()), to: new Date() }
}

export function useDashboardData() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getInitialDateRange)
  const [source, setSource] = useState<string | undefined>(undefined)

  const hasValidDates = !!dateRange?.from && !!dateRange?.to
  const dateFrom = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
  const dateTo = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""

  const metrics = useQuery({
    queryKey: ["dashboard-metrics", dateFrom, dateTo, source],
    queryFn: () => getDashboardData({ date_from: dateFrom, date_to: dateTo, source }),
    enabled: hasValidDates,
  })

  const charts = useQuery({
    queryKey: ["dashboard-charts", dateFrom, dateTo],
    queryFn: () => {
      const dateParams = { date_from: dateFrom, date_to: dateTo }
      return Promise.all([
        getHourlyData(dateParams),
        getDailyData(dateParams),
        getSalesByCountry(dateParams),
        getSalesBySource(dateParams),
      ])
    },
    enabled: hasValidDates,
  })

  const [hourlyData, dailyData, countryData, sourceData] = charts.data ?? [[], [], [], []]

  return {
    dateRange,
    setDateRange,
    source,
    setSource,
    data: metrics.data ?? null,
    metricsLoading: metrics.isLoading,
    metricsError: metrics.error ? "Erro ao carregar métricas" : null,
    hourlyData,
    dailyData,
    countryData,
    sourceData,
    chartsLoading: charts.isLoading,
  }
}
