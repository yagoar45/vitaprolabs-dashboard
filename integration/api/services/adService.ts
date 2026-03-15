import { api } from "@/integration/api"

export interface AdData {
  name: string
  purchases: number
  purchaseCpa: number
  cost: number
  revenue: number
  profit: number
  roas: number
  ics: number
  costPerIc: number
  clicks: number
  cpc: number
  // VTurb (opcionais)
  vturbViews?: number
  vturbPlays?: number
  vturbPlayRate?: number
  vturbPitchAudience?: number
  vturbPitchRetention?: number
  vturbConversionRate?: number
  // Meta Ads (opcionais)
  hookRate?: number
  holdRate?: number
}

export interface AdTotals {
  purchases: number
  purchaseCpa: number
  cost: number
  revenue: number
  profit: number
  roas: number
  ics: number
  costPerIc: number
  clicks: number
  cpc: number
  // VTurb totais (opcionais)
  vturbViews?: number
  vturbPlays?: number
  vturbPlayRate?: number
  vturbPitchAudience?: number
  vturbPitchRetention?: number
  vturbConversionRate?: number
  // Meta Ads totais (opcionais)
  hookRate?: number
  holdRate?: number
}

export interface AdsResponse {
  items: AdData[]
  totals: AdTotals
}

export interface AdFilters {
  date_from: string
  date_to: string
  source?: string
  copy?: string
  player_id?: string
}

export interface VTurbPlayer {
  id: string
  name: string
  pitch_time?: number
  duration?: number
}

export async function getAds(params: AdFilters): Promise<AdsResponse> {
  const response = await api.get<AdsResponse>("/ads", { params })
  return response.data
}

export async function getVTurbPlayers(): Promise<VTurbPlayer[]> {
  const response = await api.get<VTurbPlayer[]>("/vturb/players")
  return response.data
}
