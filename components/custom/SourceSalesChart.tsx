import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SourceData } from "@/integration/api/services/dashboardService"
import { formatNumber } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const COLORS = [
  "#8b5cf6", // violet
  "#22c55e", // green
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
  "#ef4444", // red
]

interface SourceSalesChartProps {
  data: SourceData[]
  loading?: boolean
}

export function SourceSalesChart({ data, loading }: SourceSalesChartProps) {
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 220 : 300
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Vendas por Fonte</CardTitle>
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
          <CardTitle className="text-base font-medium">Vendas por Fonte</CardTitle>
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
        <CardTitle className="text-base font-medium">Vendas por Fonte</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: isMobile ? 10 : 30, left: isMobile ? 10 : 80, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis
              type="number"
              stroke="#71717a"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="source"
              stroke="#71717a"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 55 : 75}
              tickFormatter={(value: string) => {
                const capitalized = value.charAt(0).toUpperCase() + value.slice(1)
                return isMobile && capitalized.length > 7 ? `${capitalized.slice(0, 7)}…` : capitalized
              }}
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
              labelFormatter={(label) => String(label).charAt(0).toUpperCase() + String(label).slice(1)}
              formatter={(value) => [formatNumber(typeof value === "number" ? value : 0), "Vendas"]}
            />
            <Bar dataKey="purchases" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
