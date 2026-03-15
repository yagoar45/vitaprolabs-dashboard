import { api } from "@/integration/api"

export interface DashboardData {
  revenue: number
  cost: number
  profit: number
  conversions: number
  cpa: number // Purchase CPA médio
  roas: number
}

export interface DailyData {
  date: string
  revenue: number
  cost: number
  profit: number
  conversions: number
}

export interface CountryData {
  country: string
  countryName: string
  purchases: number
  revenue: number
  cost: number
  profit: number
}

interface DashboardParams {
  date_from: string
  date_to: string
  source?: string
}

export async function getDashboardData(params: DashboardParams): Promise<DashboardData> {
  const response = await api.get<DashboardData>("/dashboard", { params })
  return response.data
}

export async function getAvailableSources(): Promise<string[]> {
  const response = await api.get<string[]>("/sources")
  return response.data
}

interface DateRange {
  date_from: string
  date_to: string
}

export async function getDailyData(params: DateRange): Promise<DailyData[]> {
  const response = await api.get<DailyData[]>("/daily", { params })
  return response.data
}

export async function getSalesByCountry(params: DateRange): Promise<CountryData[]> {
  const response = await api.get<CountryData[]>("/sales-by-country", { params })
  return response.data
}

export interface HourlyData {
  hour: number
  revenue: number
  cost: number
  profit: number
  conversions: number
}

export async function getHourlyData(params: DateRange): Promise<HourlyData[]> {
  const response = await api.get<HourlyData[]>("/hourly", { params })
  return response.data
}

export interface SourceData {
  source: string
  purchases: number
  revenue: number
  cost: number
  profit: number
}

export async function getSalesBySource(params: DateRange): Promise<SourceData[]> {
  const response = await api.get<SourceData[]>("/sales-by-source", { params })
  return response.data
}
