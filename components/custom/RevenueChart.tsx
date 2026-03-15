import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
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
import type { DailyData } from "@/integration/api/services/dashboardService"
import { formatCurrency } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface RevenueChartProps {
  data: DailyData[]
  loading?: boolean
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 220 : 300

  const chartData = data.map((item) => ({
    ...item,
    dateFormatted: format(parseISO(item.date), "dd MMM", { locale: ptBR }),
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Lucro por Dia</CardTitle>
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
          <CardTitle className="text-base font-medium">Lucro por Dia</CardTitle>
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
        <CardTitle className="text-base font-medium">Lucro por Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="dateFormatted"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
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
