export interface DateRangeParams {
  date_from: string; // YYYY-MM-DD
  date_to: string; // YYYY-MM-DD
  timezone?: string;
}

export interface DashboardParams extends DateRangeParams {
  source?: string; // alias: facebook, google, taboola, revcontent (ou "all" para todos)
}

export interface CampaignFilters extends DateRangeParams {
  status?: 1 | 2 | 3; // 1=active, 2=paused, 3=deleted
  campaign_ids?: string;
  page?: number;
  per?: number;
}

export interface DashboardData {
  revenue: number;
  cost: number;
  profit: number;
  conversions: number;
  cpa: number; // Purchase CPA médio (cost / conversions)
  roas: number;
}

export interface CampaignData {
  id: number;
  title: string;
  status: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  profit: number;
  roi: number;
  roas: number;
  cr: number;
  epc: number;
}

// RedTrack API response types
export interface RedTrackCampaignStat {
  clicks?: number;
  conversions?: number;
  cost?: number;
  revenue?: number;
  total_revenue?: number;
  profit?: number;
  roi?: number;
  roas?: number;
  lp_clicks?: number;
  lp_ctr?: number;
  convtype1?: number; // Purchase (quantidade)
  convtype2?: number;
  convtype3?: number;
  total_conversions?: number;
  cpa?: number;
  type1_cpa?: number; // Purchase CPA (custo por purchase)
}

export interface RedTrackCampaign {
  id: number;
  title: string;
  status: number;
  stat?: RedTrackCampaignStat;
  clicks?: number;
  conversions?: number;
  cost?: number;
  revenue?: number;
}

export interface RedTrackCampaignsV2Response {
  total: RedTrackCampaignStat;
  items: RedTrackCampaign[];
}

// Daily data types
export interface DailyData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  conversions: number;
}

export interface RedTrackConversion {
  id: string;
  clickid: string;
  campaign_id: string;
  offer_id: string;
  type: string;
  status: string;
  payout: number;
  payout_network: number;
  cost: number;
  country: string;
  conv_time: string;
  track_time: string;
}

export interface RedTrackConversionsResponse {
  items: RedTrackConversion[];
}

// Traffic Channel (Source) - resposta da API /sources
export interface RedTrackSource {
  id: string;
  title: string;
  alias: string;
  status: string;
  campaign_count: number;
  currency: string;
  [key: string]: unknown;
}

// Ad Data - dados de anúncios do endpoint /report com group=rt_ad
export interface AdData {
  name: string; // rt_ad field
  purchases: number; // convtype1 = Purchase
  purchaseCpa: number; // custo por purchase
  cost: number;
  revenue: number; // faturamento
  profit: number; // lucro
  roas: number;
  ics: number; // InitiateCheckout (convtype2)
  costPerIc: number; // custo por IC
  clicks: number;
  cpc: number; // custo por click
  // VTurb (opcionais - preenchidos quando player_id selecionado)
  vturbViews?: number;
  vturbPlays?: number;
  vturbPlayRate?: number;
  vturbPitchAudience?: number;
  vturbPitchRetention?: number;
  vturbConversionRate?: number;
  // Meta Ads (opcionais - preenchidos quando META_ACCESS_TOKEN configurado)
  hookRate?: number;
  holdRate?: number;
}

// Totais agregados para a tabela de ads
export interface AdTotals {
  purchases: number;
  purchaseCpa: number;
  cost: number;
  revenue: number;
  profit: number;
  roas: number;
  ics: number;
  costPerIc: number;
  clicks: number;
  cpc: number;
  // VTurb totais (opcionais)
  vturbViews?: number;
  vturbPlays?: number;
  vturbPlayRate?: number;
  vturbPitchAudience?: number;
  vturbPitchRetention?: number;
  vturbConversionRate?: number;
  // Meta Ads totais (opcionais)
  hookRate?: number;
  holdRate?: number;
}

// Resposta do endpoint de ads com totais
export interface AdsResponse {
  items: AdData[];
  totals: AdTotals;
}

// Dados de vendas por país
export interface CountryData {
  country: string; // código do país (ex: "US", "BR")
  countryName: string; // nome do país
  purchases: number;
  revenue: number;
  cost: number;
  profit: number;
}

// Dados de lucro por hora
export interface HourlyData {
  hour: number; // 0-23
  revenue: number;
  cost: number;
  profit: number;
  conversions: number;
}

// RedTrack Report response item (from /report endpoint)
export interface RedTrackReportItem {
  rt_ad?: string;
  country?: string; // código do país quando agrupado por country
  hour_of_day?: number; // hora do dia (0-23) quando agrupado por hour_of_day
  clicks?: number;
  total_conversions?: number;
  convtype1?: number; // Purchase
  convtype2?: number; // InitiateCheckout (IC)
  cost?: number;
  total_revenue?: number;
  profit?: number;
  roi?: number;
  roas?: number;
  cr?: number;
  [key: string]: unknown;
}

export interface RedTrackReportResponse {
  items?: RedTrackReportItem[];
  [key: string]: unknown;
}

// Dados de vendas/lucro por fonte de tráfego
export interface SourceData {
  source: string; // alias: "facebook", "taboola", etc.
  purchases: number;
  revenue: number;
  cost: number;
  profit: number;
}
