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
import type { SourceData } from "@/integration/api/services/dashboardService"
import { formatCurrency } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface SourceProfitChartProps {
  data: SourceData[]
  loading?: boolean
}

export function SourceProfitChart({ data, loading }: SourceProfitChartProps) {
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 220 : 300
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Lucro por Fonte</CardTitle>
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
          <CardTitle className="text-base font-medium">Lucro por Fonte</CardTitle>
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
        <CardTitle className="text-base font-medium">Lucro por Fonte</CardTitle>
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
              tickFormatter={(value: number) => {
                if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`
                return `$${value}`
              }}
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
            <ReferenceLine x={0} stroke="#71717a" strokeDasharray="3 3" />
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
              formatter={(value) => [formatCurrency(typeof value === "number" ? value : 0), "Lucro"]}
            />
            <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
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
