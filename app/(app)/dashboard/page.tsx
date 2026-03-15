"use client"

import { AppLayout } from "@/components/custom/AppLayout"
import { DateRangePicker } from "@/components/custom/DateRangePicker"
import { SourceFilter } from "@/components/custom/SourceFilter"
import { RevenueChart } from "@/components/custom/RevenueChart"
import { CountryChart } from "@/components/custom/CountryChart"
import { HourlyProfitChart } from "@/components/custom/HourlyProfitChart"
import { SourceSalesChart } from "@/components/custom/SourceSalesChart"
import { SourceProfitChart } from "@/components/custom/SourceProfitChart"
import { MetricsGrid } from "@/components/custom/MetricsGrid"
import { useDashboardData } from "@/hooks/useDashboardData"

export default function DashboardPage() {
  const {
    dateRange, setDateRange,
    source, setSource,
    data, metricsLoading, metricsError,
    hourlyData, dailyData, countryData, sourceData, chartsLoading,
  } = useDashboardData()

  return (
    <AppLayout
      title="Dashboard"
      actions={
        <div className="flex items-center gap-2">
          <SourceFilter value={source} onChange={setSource} />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      }
    >
      <div className="space-y-6">
        <MetricsGrid data={data} loading={metricsLoading} error={metricsError} />
        <HourlyProfitChart data={hourlyData} loading={chartsLoading} />
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={dailyData} loading={chartsLoading} />
          <CountryChart data={countryData} loading={chartsLoading} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SourceSalesChart data={sourceData} loading={chartsLoading} />
          <SourceProfitChart data={sourceData} loading={chartsLoading} />
        </div>
      </div>
    </AppLayout>
  )
}
