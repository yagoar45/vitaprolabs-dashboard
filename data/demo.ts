import type { DashboardData, DailyData, HourlyData, CountryData, SourceData } from "@/integration/api/services/dashboardService"
import type { AdsResponse } from "@/integration/api/services/adService"

export const DEMO_DASHBOARD_DATA: DashboardData = {
  revenue: 48750.00,
  cost: 12340.50,
  profit: 36409.50,
  conversions: 312,
  cpa: 39.55,
  roas: 3.95,
}

export const DEMO_DAILY_DATA: DailyData[] = [
  { date: "2026-03-01", revenue: 4200, cost: 1100, profit: 3100, conversions: 28 },
  { date: "2026-03-02", revenue: 5100, cost: 1250, profit: 3850, conversions: 35 },
  { date: "2026-03-03", revenue: 3800, cost: 980, profit: 2820, conversions: 22 },
  { date: "2026-03-04", revenue: 6200, cost: 1450, profit: 4750, conversions: 41 },
  { date: "2026-03-05", revenue: 4900, cost: 1300, profit: 3600, conversions: 33 },
  { date: "2026-03-06", revenue: 5500, cost: 1180, profit: 4320, conversions: 37 },
  { date: "2026-03-07", revenue: 4100, cost: 1050, profit: 3050, conversions: 26 },
  { date: "2026-03-08", revenue: 5800, cost: 1400, profit: 4400, conversions: 39 },
  { date: "2026-03-09", revenue: 4650, cost: 1230, profit: 3420, conversions: 30 },
  { date: "2026-03-10", revenue: 4500, cost: 1400, profit: 3100, conversions: 21 },
]

export const DEMO_HOURLY_DATA: HourlyData[] = Array.from({ length: 24 }, (_, hour) => {
  const base = hour >= 8 && hour <= 22 ? 1 : 0.3
  const peak = hour >= 19 && hour <= 21 ? 1.8 : 1
  const mult = base * peak
  return {
    hour,
    revenue: Math.round(1800 * mult + Math.random() * 400),
    cost: Math.round(500 * mult + Math.random() * 100),
    profit: Math.round(1300 * mult + Math.random() * 300),
    conversions: Math.round(12 * mult + Math.random() * 5),
  }
})

export const DEMO_COUNTRY_DATA: CountryData[] = [
  { country: "BR", countryName: "Brasil", purchases: 185, revenue: 28500, cost: 7200, profit: 21300 },
  { country: "PT", countryName: "Portugal", purchases: 52, revenue: 8100, cost: 2100, profit: 6000 },
  { country: "US", countryName: "Estados Unidos", purchases: 38, revenue: 5900, cost: 1500, profit: 4400 },
  { country: "ES", countryName: "Espanha", purchases: 22, revenue: 3600, cost: 900, profit: 2700 },
  { country: "MX", countryName: "México", purchases: 15, revenue: 2650, cost: 640, profit: 2010 },
]

export const DEMO_SOURCE_DATA: SourceData[] = [
  { source: "Facebook", purchases: 198, revenue: 30200, cost: 7800, profit: 22400 },
  { source: "Google", purchases: 74, revenue: 11500, cost: 2900, profit: 8600 },
  { source: "TikTok", purchases: 40, revenue: 7050, cost: 1640, profit: 5410 },
]

const demoAds = [
  { name: "ANA-VSL-PRINCIPAL-HOOK1-AD01", purchases: 45, cost: 2100, revenue: 8500, hookRate: 62.14, holdRate: 9.11 },
  { name: "ANA-VSL-PRINCIPAL-HOOK1-AD02", purchases: 38, cost: 1850, revenue: 7200, hookRate: 67.13, holdRate: 8.00 },
  { name: "ANA-VSL-PRINCIPAL-HOOK2-AD01", purchases: 52, cost: 2400, revenue: 10100, hookRate: 55.09, holdRate: 5.78 },
  { name: "LUCAS-VSL-DEPOIMENTO-HOOK1-AD01", purchases: 28, cost: 1300, revenue: 5400, hookRate: 57.64, holdRate: 5.55 },
  { name: "LUCAS-VSL-DEPOIMENTO-HOOK2-AD01", purchases: 22, cost: 980, revenue: 4200, hookRate: 69.25, holdRate: 5.86 },
  { name: "CARLOS-VSL-URGENCIA-HOOK1-AD01", purchases: 15, cost: 710, revenue: 2800, hookRate: 69.51, holdRate: 11.52 },
]

const demoAdItems = demoAds.map((ad) => {
  const profit = ad.revenue - ad.cost
  const clicks = Math.round(ad.cost / 0.85)
  const ics = Math.round(ad.purchases * 1.4)
  const vturbViews = Math.round(clicks * 0.7)
  const vturbPlays = Math.round(vturbViews * 0.85)
  return {
    name: ad.name,
    purchases: ad.purchases,
    purchaseCpa: Math.round((ad.cost / ad.purchases) * 100) / 100,
    cost: ad.cost,
    revenue: ad.revenue,
    profit,
    roas: Math.round((ad.revenue / ad.cost) * 100) / 100,
    ics,
    costPerIc: Math.round((ad.cost / ics) * 100) / 100,
    clicks,
    cpc: Math.round((ad.cost / clicks) * 100) / 100,
    hookRate: ad.hookRate,
    holdRate: ad.holdRate,
    vturbViews,
    vturbPlays,
    vturbPlayRate: Math.round((vturbPlays / vturbViews) * 10000) / 100,
    vturbPitchAudience: Math.round(vturbPlays * 0.35),
    vturbPitchRetention: Math.round((30 + Math.random() * 15) * 100) / 100,
    vturbConversionRate: Math.round((ad.purchases / vturbViews) * 10000) / 100,
  }
})

const totals = demoAdItems.reduce(
  (acc, ad) => {
    acc.purchases += ad.purchases
    acc.cost += ad.cost
    acc.revenue += ad.revenue
    acc.profit += ad.profit
    acc.ics += ad.ics
    acc.clicks += ad.clicks
    acc.vturbViews += ad.vturbViews
    acc.vturbPlays += ad.vturbPlays
    acc.vturbPitchAudience += ad.vturbPitchAudience
    return acc
  },
  { purchases: 0, cost: 0, revenue: 0, profit: 0, ics: 0, clicks: 0, vturbViews: 0, vturbPlays: 0, vturbPitchAudience: 0 },
)

const wPitchRet = demoAdItems.reduce((s, a) => s + a.vturbPitchRetention * a.vturbPlays, 0)
const wConvRate = demoAdItems.reduce((s, a) => s + a.vturbConversionRate * a.vturbViews, 0)

export const DEMO_ADS_RESPONSE: AdsResponse = {
  items: demoAdItems,
  totals: {
    purchases: totals.purchases,
    purchaseCpa: Math.round((totals.cost / totals.purchases) * 100) / 100,
    cost: totals.cost,
    revenue: totals.revenue,
    profit: totals.profit,
    roas: Math.round((totals.revenue / totals.cost) * 100) / 100,
    ics: totals.ics,
    costPerIc: Math.round((totals.cost / totals.ics) * 100) / 100,
    clicks: totals.clicks,
    cpc: Math.round((totals.cost / totals.clicks) * 100) / 100,
    hookRate: Math.round(demoAdItems.reduce((s, a) => s + a.hookRate, 0) / demoAdItems.length * 100) / 100,
    holdRate: Math.round(demoAdItems.reduce((s, a) => s + a.holdRate, 0) / demoAdItems.length * 100) / 100,
    vturbViews: totals.vturbViews,
    vturbPlays: totals.vturbPlays,
    vturbPlayRate: Math.round((totals.vturbPlays / totals.vturbViews) * 10000) / 100,
    vturbPitchAudience: totals.vturbPitchAudience,
    vturbPitchRetention: Math.round(wPitchRet / totals.vturbPlays * 100) / 100,
    vturbConversionRate: Math.round(wConvRate / totals.vturbViews * 100) / 100,
  },
}
