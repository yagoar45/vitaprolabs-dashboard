import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HourlyData } from "@/integration/api/services/dashboardService"
import { formatCurrency } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface HourlyProfitChartProps {
  data: HourlyData[]
  loading?: boolean
}

export function HourlyProfitChart({ data, loading }: HourlyProfitChartProps) {
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 220 : 300

  const chartData = data.map((item) => ({
    ...item,
    hourLabel: `${item.hour}h`,
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Lucro por Hora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] md:h-[300px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Lucro por Hora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] md:h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Lucro por Hora</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="hourLabel"
              stroke="#71717a"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              interval={isMobile ? 2 : 0}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#a1a1aa" }}
              itemStyle={{ color: "#ffffff" }}
              formatter={(value) => [formatCurrency(typeof value === "number" ? value : 0), "Lucro"]}
            />
            <ReferenceLine y={0} stroke="#71717a" strokeDasharray="3 3" />
            <Bar dataKey="profit" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit >= 0 ? "#22c55e" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
