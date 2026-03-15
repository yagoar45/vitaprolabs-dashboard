import type {
  DateRangeParams,
  DashboardParams,
  DashboardData,
  CampaignFilters,
  CampaignData,
  RedTrackCampaignsV2Response,
  RedTrackCampaignStat,
  RedTrackCampaign,
  DailyData,
  HourlyData,
  RedTrackReportResponse,
  RedTrackReportItem,
  AdTotals,
  AdsResponse,
  CountryData,
  SourceData,
} from "./types";
import { RedTrackHttp, round2 } from "./http";
import { COUNTRY_NAMES } from "./constants";

const DEFAULT_PARAMS = { timezone: "America/Sao_Paulo" };

/** Extrai campos financeiros padronizados de qualquer objeto RedTrack com campos de stat */
const extractFinancials = (total: RedTrackCampaignStat | RedTrackReportItem) => {
  const revenue = total.total_revenue ?? 0;
  const cost = total.cost ?? 0;
  const profit = total.profit ?? (revenue - cost);
  const purchases = total.convtype1 ?? 0;
  return { revenue, cost, profit, purchases };
};

/** Normaliza resposta do /report (pode ser array ou { items }) */
const parseReportItems = (response: RedTrackReportResponse | RedTrackReportItem[]): RedTrackReportItem[] =>
  Array.isArray(response) ? response : (response.items ?? []);

export class RedTrackClient {
  private http: RedTrackHttp;

  constructor(apiKey: string) {
    this.http = new RedTrackHttp(apiKey);
  }

  async getDashboardData(params: DashboardParams): Promise<DashboardData> {
    const sourceIds = await this.http.resolveSourceIds(params.source);

    const response = await this.http.request<RedTrackCampaignsV2Response>("/campaigns/v2", {
      ...DEFAULT_PARAMS,
      date_from: params.date_from,
      date_to: params.date_to,
      time_interval: "day",
      total_stat: true,
      status: 1,
      ...(sourceIds && { sources: sourceIds }),
    });

    const { revenue, cost, profit, purchases } = extractFinancials(response.total ?? {});
    const total = response.total ?? {};

    return {
      revenue: round2(revenue),
      cost: round2(cost),
      profit: round2(profit),
      conversions: purchases,
      cpa: round2((total.type1_cpa as number) ?? 0),
      roas: round2((total.roas as number) ?? 0),
    };
  }

  async getCampaigns(filters: CampaignFilters): Promise<CampaignData[]> {
    const response = await this.http.request<RedTrackCampaignsV2Response>("/campaigns/v2", {
      ...filters,
      ...DEFAULT_PARAMS,
      time_interval: "day",
      total_stat: true,
      status: filters.status ?? 1,
    });

    return (response.items ?? [])
      .sort((campaignA, campaignB) => {
        const hasDataA = (campaignA.stat?.cost ?? 0) > 0 || (campaignA.stat?.total_revenue ?? 0) > 0;
        const hasDataB = (campaignB.stat?.cost ?? 0) > 0 || (campaignB.stat?.total_revenue ?? 0) > 0;
        if (hasDataA !== hasDataB) return hasDataA ? -1 : 1;
        return (campaignB.stat?.total_revenue ?? 0) - (campaignA.stat?.total_revenue ?? 0);
      })
      .map((campaign: RedTrackCampaign) => {
        const stat = campaign.stat ?? {};
        const revenue = stat.total_revenue ?? 0;
        const cost = stat.cost ?? 0;
        const clicks = stat.clicks ?? 0;
        const conversions = stat.convtype1 ?? 0;

        return {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          clicks,
          conversions,
          cost: round2(cost),
          revenue: round2(revenue),
          profit: round2(stat.profit ?? (revenue - cost)),
          roi: round2((stat.roi ?? 0) * 100),
          roas: round2(stat.roas ?? 0),
          cr: round2(clicks > 0 ? (conversions / clicks) * 100 : 0),
          epc: round2(clicks > 0 ? revenue / clicks : 0),
        };
      });
  }

  async getDailyData(params: DateRangeParams): Promise<DailyData[]> {
    const [yearStr, monthStr] = params.date_from.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Gerar todos os dias do mês
    const allDays = Array.from({ length: lastDay }, (_, index) => {
      const date = new Date(year, month, index + 1);
      return date.toISOString().split("T")[0];
    });

    const dailyData: DailyData[] = allDays.map((date) => ({
      date,
      revenue: 0,
      cost: 0,
      profit: 0,
      conversions: 0,
    }));

    // Buscar em batches de 5 para evitar rate limit
    const BATCH_SIZE = 5;
    const batches = Array.from(
      { length: Math.ceil(dailyData.length / BATCH_SIZE) },
      (_, batchIndex) => dailyData.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE),
    );

    await batches.reduce(async (previousBatch, batch, batchIndex) => {
      await previousBatch;

      await Promise.all(
        batch.map(async (dayData) => {
          const dayDate = new Date(dayData.date + "T12:00:00");
          if (dayDate > today) return;

          try {
            const response = await this.http.request<RedTrackCampaignsV2Response>("/campaigns/v2", {
              ...DEFAULT_PARAMS,
              date_from: dayData.date,
              date_to: dayData.date,
              time_interval: "day",
              total_stat: true,
              status: 1,
            });

            const { revenue, cost, profit, purchases } = extractFinancials(response.total ?? {});
            dayData.revenue = round2(revenue);
            dayData.cost = round2(cost);
            dayData.profit = round2(profit);
            dayData.conversions = purchases;
          } catch {
            // Mantém zeros em caso de erro
          }
        }),
      );

      // Delay entre batches (exceto o último)
      if (batchIndex < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }, Promise.resolve());

    return dailyData;
  }

  async getAvailableSources(): Promise<string[]> {
    const sources = await this.http.fetchSources();
    return [...new Set(sources.map((source) => source.alias))].sort();
  }

  async getAds(params: DateRangeParams & { source?: string; copy?: string }): Promise<AdsResponse> {
    const sourceIds = await this.http.resolveSourceIds(params.source);

    const response = await this.http.request<RedTrackReportResponse | RedTrackReportItem[]>("/report", {
      group: "rt_ad",
      date_from: params.date_from,
      date_to: params.date_to,
      ...DEFAULT_PARAMS,
      ...(sourceIds && { source_id: sourceIds }),
    });

    const items = parseReportItems(response)
      .filter((item) => {
        if (!item.rt_ad?.trim() || (item.cost ?? 0) <= 0) return false;
        if (params.copy) {
          return item.rt_ad.toLowerCase().includes(params.copy.toLowerCase());
        }
        return true;
      })
      .map((item) => {
        const cost = item.cost ?? 0;
        const revenue = item.total_revenue ?? 0;
        const clicks = item.clicks ?? 0;
        const purchases = item.convtype1 ?? 0;
        const ics = typeof item.convtype2 === "number" ? item.convtype2 : 0;

        return {
          name: item.rt_ad!,
          purchases,
          purchaseCpa: round2(purchases > 0 ? cost / purchases : 0),
          cost: round2(cost),
          revenue: round2(revenue),
          profit: round2(item.profit ?? revenue - cost),
          roas: round2(item.roas ?? 0),
          ics,
          costPerIc: round2(ics > 0 ? cost / ics : 0),
          clicks,
          cpc: round2(clicks > 0 ? cost / clicks : 0),
        };
      })
      .sort((adA, adB) => adB.cost - adA.cost);

    // Calcular totais em um único passo
    const totalsAcc = items.reduce(
      (acc, ad) => ({
        purchases: acc.purchases + ad.purchases,
        cost: acc.cost + ad.cost,
        revenue: acc.revenue + ad.revenue,
        profit: acc.profit + ad.profit,
        ics: acc.ics + ad.ics,
        clicks: acc.clicks + ad.clicks,
      }),
      { purchases: 0, cost: 0, revenue: 0, profit: 0, ics: 0, clicks: 0 },
    );

    const totals: AdTotals = {
      purchases: totalsAcc.purchases,
      purchaseCpa: round2(totalsAcc.purchases > 0 ? totalsAcc.cost / totalsAcc.purchases : 0),
      cost: round2(totalsAcc.cost),
      revenue: round2(totalsAcc.revenue),
      profit: round2(totalsAcc.profit),
      roas: round2(totalsAcc.cost > 0 ? totalsAcc.revenue / totalsAcc.cost : 0),
      ics: totalsAcc.ics,
      costPerIc: round2(totalsAcc.ics > 0 ? totalsAcc.cost / totalsAcc.ics : 0),
      clicks: totalsAcc.clicks,
      cpc: round2(totalsAcc.clicks > 0 ? totalsAcc.cost / totalsAcc.clicks : 0),
    };

    return { items, totals };
  }

  async getSalesByCountry(params: DateRangeParams): Promise<CountryData[]> {
    const response = await this.http.request<RedTrackReportResponse | RedTrackReportItem[]>("/report", {
      group: "country",
      date_from: params.date_from,
      date_to: params.date_to,
      ...DEFAULT_PARAMS,
    });

    return parseReportItems(response)
      .filter((item) => item.country?.trim() && (item.convtype1 ?? 0) > 0)
      .map((item) => {
        const countryCode = item.country ?? "Unknown";
        const { revenue, cost, profit, purchases } = extractFinancials(item);

        return {
          country: countryCode,
          countryName: COUNTRY_NAMES[countryCode] || countryCode,
          purchases,
          revenue: round2(revenue),
          cost: round2(cost),
          profit: round2(profit),
        };
      })
      .sort((countryA, countryB) => countryB.purchases - countryA.purchases)
      .slice(0, 10);
  }

  async getHourlyProfit(params: DateRangeParams): Promise<HourlyData[]> {
    const response = await this.http.request<RedTrackReportResponse | RedTrackReportItem[]>("/report", {
      group: "hour_of_day",
      date_from: params.date_from,
      date_to: params.date_to,
      ...DEFAULT_PARAMS,
    });

    const items = parseReportItems(response);

    // Inicializar 24 horas e preencher com dados da API
    const itemsByHour = new Map(
      items
        .filter((item) => item.hour_of_day !== undefined && item.hour_of_day >= 0 && item.hour_of_day <= 23)
        .map((item) => [item.hour_of_day!, item]),
    );

    return Array.from({ length: 24 }, (_, hour) => {
      const item = itemsByHour.get(hour);
      if (!item) return { hour, revenue: 0, cost: 0, profit: 0, conversions: 0 };

      const revenue = item.total_revenue ?? 0;
      const cost = item.cost ?? 0;

      return {
        hour,
        revenue: round2(revenue),
        cost: round2(cost),
        profit: round2(item.profit ?? (revenue - cost)),
        conversions: item.convtype1 ?? 0,
      };
    });
  }

  async getSalesBySource(params: DateRangeParams): Promise<SourceData[]> {
    const sources = await this.http.fetchSources();

    // Agrupar IDs por alias
    const aliasMap = sources.reduce((acc, source) => {
      const existing = acc.get(source.alias) ?? [];
      existing.push(source.id);
      acc.set(source.alias, existing);
      return acc;
    }, new Map<string, string[]>());

    // Buscar todas as fontes em paralelo
    const results = await Promise.all(
      Array.from(aliasMap).map(async ([alias, ids]) => {
        try {
          const response = await this.http.request<RedTrackCampaignsV2Response>("/campaigns/v2", {
            ...DEFAULT_PARAMS,
            date_from: params.date_from,
            date_to: params.date_to,
            total_stat: true,
            status: 1,
            sources: ids.join(","),
          });

          const { revenue, cost, profit, purchases } = extractFinancials(response.total ?? {});

          return {
            source: alias,
            purchases,
            revenue: round2(revenue),
            cost: round2(cost),
            profit: round2(profit),
          };
        } catch {
          return null;
        }
      }),
    );

    return results
      .filter((source): source is SourceData => source !== null && (source.purchases > 0 || source.cost > 0))
      .sort((sourceA, sourceB) => sourceB.purchases - sourceA.purchases);
  }
}
