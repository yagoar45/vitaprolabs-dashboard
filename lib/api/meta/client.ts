import type { MetaAdInsight, MetaInsightsResponse, MetaAdVideoMetrics, MetaAdAccountsResponse } from "./types";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

interface CacheEntry {
  data: MetaAdVideoMetrics[];
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export class MetaAdsClient {
  private accessToken: string;
  private cachedAccountIds: string[] | null = null;
  private metricsCache = new Map<string, CacheEntry>();
  private inflightRequests = new Map<string, Promise<MetaAdVideoMetrics[]>>();

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(url: string, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new Error(`Meta API Error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    throw new Error("Meta API request failed after retries");
  }

  // Busca todas as contas de anúncio paginadas
  private async fetchAllAdAccountIds(): Promise<string[]> {
    if (this.cachedAccountIds) return this.cachedAccountIds;

    const accountIds: string[] = [];
    let url: string = `${META_GRAPH_URL}/me/adaccounts?fields=id&limit=100&access_token=${this.accessToken}`;

    while (url) {
      const response = await this.request<MetaAdAccountsResponse>(url);
      for (const account of response.data) {
        accountIds.push(account.id);
      }
      url = response.paging?.next ?? "";
    }

    this.cachedAccountIds = accountIds;
    console.log(`Meta: found ${accountIds.length} ad accounts`);
    return accountIds;
  }

  // Busca todos os insights paginados de uma conta
  private async fetchAllInsights(accountId: string, params: { date_from: string; date_to: string }): Promise<MetaAdInsight[]> {
    const fields = "ad_name,impressions,actions,video_p75_watched_actions";
    const timeRange = JSON.stringify({ since: params.date_from, until: params.date_to });

    let url = `${META_GRAPH_URL}/${accountId}/insights?level=ad&fields=${fields}&time_range=${encodeURIComponent(timeRange)}&limit=500&access_token=${this.accessToken}`;

    const allInsights: MetaAdInsight[] = [];

    while (url) {
      const response = await this.request<MetaInsightsResponse>(url);
      allInsights.push(...response.data);
      url = response.paging?.next ?? "";
    }

    return allInsights;
  }

  // Extrai o valor numérico de um campo de actions do Meta
  private extractActionValue(actions: { action_type: string; value: string }[] | undefined, actionType: string): number {
    if (!actions || actions.length === 0) return 0;
    const entry = actions.find((a) => a.action_type === actionType);
    return entry ? parseInt(entry.value, 10) || 0 : 0;
  }

  // Busca métricas de vídeo de todas as contas e agrupa por nome do ad
  async getAdVideoMetrics(params: { date_from: string; date_to: string }): Promise<MetaAdVideoMetrics[]> {
    const cacheKey = `${params.date_from}_${params.date_to}`;

    // Verificar cache
    const cached = this.metricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Meta: returning cached results (${cached.data.length} ads)`);
      return cached.data;
    }

    // Deduplicar chamadas simultâneas (evita 4x requests paralelos)
    const inflight = this.inflightRequests.get(cacheKey);
    if (inflight) {
      console.log("Meta: reusing inflight request");
      return inflight;
    }

    const promise = this.fetchAndProcessMetrics(params, cacheKey);
    this.inflightRequests.set(cacheKey, promise);

    try {
      return await promise;
    } finally {
      this.inflightRequests.delete(cacheKey);
    }
  }

  private async fetchAndProcessMetrics(params: { date_from: string; date_to: string }, cacheKey: string): Promise<MetaAdVideoMetrics[]> {
    const start = Date.now();
    const accountIds = await this.fetchAllAdAccountIds();

    // Buscar insights de todas as contas em paralelo
    const allInsights = await Promise.all(
      accountIds.map((accountId) =>
        this.fetchAllInsights(accountId, params).catch((err) => {
          console.error(`Meta API error for account ${accountId}:`, err.message);
          return [] as MetaAdInsight[];
        }),
      ),
    );

    console.log(`Meta: fetched insights from ${accountIds.length} accounts in ${Date.now() - start}ms`);

    // Agregar por ad_name (mesmo ad pode estar em múltiplas contas)
    const adMap = new Map<string, { impressions: number; video3SecViews: number; videoP75Views: number }>();

    let debugLogged = false;
    for (const insights of allInsights) {
      for (const insight of insights) {
        if (!debugLogged && (insight.actions?.length || insight.video_p75_watched_actions?.length)) {
          console.log("Meta API debug - sample insight:", JSON.stringify({
            ad_name: insight.ad_name,
            impressions: insight.impressions,
            actions_video_view: insight.actions?.find((a) => a.action_type === "video_view"),
            video_p75_watched_actions: insight.video_p75_watched_actions,
          }, null, 2));
          debugLogged = true;
        }

        const adName = insight.ad_name;
        const existing = adMap.get(adName) ?? { impressions: 0, video3SecViews: 0, videoP75Views: 0 };

        existing.impressions += parseInt(insight.impressions, 10) || 0;
        // 3-second video views (hook) vem dentro de actions com action_type "video_view"
        existing.video3SecViews += this.extractActionValue(insight.actions, "video_view");
        // 75% do vídeo assistido (hold)
        existing.videoP75Views += this.extractActionValue(insight.video_p75_watched_actions, "video_view");

        adMap.set(adName, existing);
      }
    }

    // Calcular rates e retornar
    const results: MetaAdVideoMetrics[] = [];
    for (const [adName, data] of adMap) {
      const hookRate = data.impressions > 0 ? (data.video3SecViews / data.impressions) * 100 : 0;
      const holdRate = data.video3SecViews > 0 ? (data.videoP75Views / data.video3SecViews) * 100 : 0;

      results.push({
        adName,
        impressions: data.impressions,
        video3SecViews: data.video3SecViews,
        videoP75Views: data.videoP75Views,
        hookRate: Math.round(hookRate * 100) / 100,
        holdRate: Math.round(holdRate * 100) / 100,
      });
    }

    // Salvar no cache
    this.metricsCache.set(cacheKey, { data: results, timestamp: Date.now() });

    return results;
  }
}
