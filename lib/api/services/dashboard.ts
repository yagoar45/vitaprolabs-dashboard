import {
  getRedTrackClient,
  DashboardData,
  CampaignData,
  CampaignFilters,
  DailyData,
  HourlyData,
  DashboardParams,
  AdsResponse,
  CountryData,
  SourceData,
} from "@/lib/api/redtrack";
import { getVTurbClient, VTurbPlayer } from "@/lib/api/vturb";
import { getMetaAdsClient } from "@/lib/api/meta";

interface DateRange {
  date_from: string;
  date_to: string;
}

export async function getDashboardData(params: DashboardParams): Promise<DashboardData> {
  const client = getRedTrackClient();
  return client.getDashboardData(params);
}

export async function getAvailableSources(): Promise<string[]> {
  const client = getRedTrackClient();
  return client.getAvailableSources();
}

export async function getCampaigns(filters: CampaignFilters): Promise<CampaignData[]> {
  const client = getRedTrackClient();
  return client.getCampaigns(filters);
}

export async function getDailyData(dateRange: DateRange): Promise<DailyData[]> {
  const client = getRedTrackClient();
  return client.getDailyData(dateRange);
}

export async function getVTurbPlayers(): Promise<VTurbPlayer[]> {
  const client = getVTurbClient();
  if (!client) return [];
  return client.getPlayers();
}

export async function getAds(params: DateRange & { source?: string; copy?: string; player_id?: string }): Promise<AdsResponse> {
  const redtrack = getRedTrackClient();

  // Buscar RedTrack ads + VTurb player info + Meta metrics em PARALELO
  const vturb = params.player_id ? getVTurbClient() : null;
  const meta = getMetaAdsClient();

  const [result, vturbPlayerAndStats, metaMetrics] = await Promise.all([
    redtrack.getAds(params),

    // VTurb: buscar player + stats (precisa do player para ter duration)
    (async () => {
      if (!vturb || !params.player_id) return null;
      try {
        const player = await vturb.getPlayerById(params.player_id);
        if (!player?.duration) return null;
        const stats = await vturb.getTrafficOriginStats({
          player_id: params.player_id,
          start_date: params.date_from,
          end_date: params.date_to,
          video_duration: player.duration,
          pitch_time: player.pitch_time,
        });
        return stats;
      } catch (error) {
        console.error("VTurb enrichment error:", error);
        return null;
      }
    })(),

    // Meta: buscar hook/hold rate (totalmente independente)
    (async () => {
      if (!meta) return null;
      try {
        return await meta.getAdVideoMetrics({
          date_from: params.date_from,
          date_to: params.date_to,
        });
      } catch (error) {
        console.error("Meta enrichment error:", error);
        return null;
      }
    })(),
  ]);

  // Enriquecer com VTurb
  if (vturbPlayerAndStats) {
    const statsMap = new Map(vturbPlayerAndStats.map((s) => [s.grouped_field, s]));
    for (const ad of result.items) {
      const vt = statsMap.get(ad.name);
      if (vt) {
        ad.vturbViews = vt.views;
        ad.vturbPlays = vt.plays;
        ad.vturbPlayRate = vt.play_rate;
        ad.vturbPitchAudience = vt.pitch;
        ad.vturbPitchRetention = vt.pitchRetention;
        ad.vturbConversionRate = vt.conversion_rate;
      }
    }

    const adsWithVturb = result.items.filter((ad) => ad.vturbViews !== undefined);
    if (adsWithVturb.length > 0) {
      const totalViews = adsWithVturb.reduce((sum, ad) => sum + (ad.vturbViews ?? 0), 0);
      const totalPlays = adsWithVturb.reduce((sum, ad) => sum + (ad.vturbPlays ?? 0), 0);
      result.totals.vturbViews = totalViews;
      result.totals.vturbPlays = totalPlays;
      result.totals.vturbPlayRate = totalViews > 0 ? (totalPlays / totalViews) * 100 : 0;
      result.totals.vturbPitchAudience = adsWithVturb.reduce((sum, ad) => sum + (ad.vturbPitchAudience ?? 0), 0);
      const weightedPitchRetention = adsWithVturb.reduce(
        (sum, ad) => sum + (ad.vturbPitchRetention ?? 0) * (ad.vturbPlays ?? 0),
        0,
      );
      result.totals.vturbPitchRetention = totalPlays > 0 ? weightedPitchRetention / totalPlays : 0;
      const weightedConvRate = adsWithVturb.reduce(
        (sum, ad) => sum + (ad.vturbConversionRate ?? 0) * (ad.vturbViews ?? 0),
        0,
      );
      result.totals.vturbConversionRate = totalViews > 0 ? weightedConvRate / totalViews : 0;
    }
  }

  // Enriquecer com Meta
  if (metaMetrics) {
    const metaMap = new Map(metaMetrics.map((m) => [m.adName, m]));
    for (const ad of result.items) {
      const m = metaMap.get(ad.name);
      if (m) {
        ad.hookRate = m.hookRate;
        ad.holdRate = m.holdRate;
      }
    }

    const adsWithMeta = result.items.filter((ad) => ad.hookRate !== undefined);
    if (adsWithMeta.length > 0) {
      const adNameSet = new Set(adsWithMeta.map((ad) => ad.name));
      const matched = metaMetrics.filter((m) => adNameSet.has(m.adName));
      const totalImpressions = matched.reduce((sum, m) => sum + m.impressions, 0);
      const total3Sec = matched.reduce((sum, m) => sum + m.video3SecViews, 0);
      const totalP75Views = matched.reduce((sum, m) => sum + m.videoP75Views, 0);

      result.totals.hookRate = totalImpressions > 0 ? Math.round((total3Sec / totalImpressions) * 10000) / 100 : 0;
      result.totals.holdRate = total3Sec > 0 ? Math.round((totalP75Views / total3Sec) * 10000) / 100 : 0;
    }
  }

  return result;
}

export async function getSalesByCountry(params: DateRange): Promise<CountryData[]> {
  const client = getRedTrackClient();
  return client.getSalesByCountry(params);
}

export async function getHourlyProfit(params: DateRange): Promise<HourlyData[]> {
  const client = getRedTrackClient();
  return client.getHourlyProfit(params);
}

export async function getSalesBySource(params: DateRange): Promise<SourceData[]> {
  const client = getRedTrackClient();
  return client.getSalesBySource(params);
}
