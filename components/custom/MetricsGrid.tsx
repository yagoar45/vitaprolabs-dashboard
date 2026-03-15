import { useMemo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoneyBag02Icon,
  ChartIncreaseIcon,
  MoneyNotFoundIcon,
  Analytics01Icon,
  Target01Icon,
  DollarCircleIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardData } from "@/integration/api/services/dashboardService"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface MetricsGridProps {
  data: DashboardData | null
  loading: boolean
  error: string | null
}

export function MetricsGrid({ data, loading, error }: MetricsGridProps) {
  const metrics = useMemo(() => {
    if (!data) return []
    return [
      {
        title: "Receita",
        value: formatCurrency(data.revenue),
        icon: MoneyBag02Icon,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      },
      {
        title: "Lucro",
        value: formatCurrency(data.profit),
        icon: ChartIncreaseIcon,
        color: data.profit >= 0 ? "text-emerald-500" : "text-red-500",
        bgColor: data.profit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      },
      {
        title: "Custo",
        value: formatCurrency(data.cost),
        icon: MoneyNotFoundIcon,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
      },
      {
        title: "CPA Médio",
        value: formatCurrency(data.cpa),
        icon: DollarCircleIcon,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        title: "ROAS",
        value: `${data.roas.toFixed(2)}x`,
        icon: Analytics01Icon,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
      {
        title: "Conversões",
        value: formatNumber(data.conversions),
        icon: Target01Icon,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      },
    ]
  }, [data])

  if (loading) {
    return (
      <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-10 w-10 rounded-xl bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`rounded-xl p-2.5 ${metric.bgColor}`}>
              <HugeiconsIcon
                icon={metric.icon}
                strokeWidth={2}
                className={`h-5 w-5 ${metric.color}`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-xl md:text-2xl font-bold ${metric.color}`}>{metric.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
