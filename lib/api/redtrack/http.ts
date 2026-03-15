import { TTLCache } from "@isaacs/ttlcache";
import type { RedTrackSource } from "./types";

const REDTRACK_API_URL = "https://api.redtrack.io";
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

export class RedTrackHttp {
  private apiKey: string;
  private sourcesCache: RedTrackSource[] | null = null;
  private queryCache = new TTLCache<string, unknown>({ ttl: CACHE_TTL });

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildUrl(endpoint: string, params: Record<string, unknown> = {}): string {
    const url = new URL(`${REDTRACK_API_URL}${endpoint}`);
    url.searchParams.append("api_key", this.apiKey);

    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .forEach(([key, value]) => url.searchParams.append(key, String(value)));

    return url.toString();
  }

  private getCacheKey(endpoint: string, params: Record<string, unknown>): string {
    const serialized = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return `${endpoint}:${serialized}`;
  }

  async request<T>(endpoint: string, params: Record<string, unknown> = {}, retries = 3): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey) as T;
    }

    const url = this.buildUrl(endpoint, params);

    const attemptRequest = async (currentAttempt: number): Promise<T> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`RedTrack API Error: ${response.status}`);

        const data = (await response.json()) as T;
        this.queryCache.set(cacheKey, data);
        return data;
      } catch (error) {
        if (currentAttempt >= retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * currentAttempt));
        return attemptRequest(currentAttempt + 1);
      }
    };

    return attemptRequest(1);
  }

  async fetchSources(): Promise<RedTrackSource[]> {
    if (this.sourcesCache) return this.sourcesCache;
    this.sourcesCache = await this.request<RedTrackSource[]>("/sources", {});
    return this.sourcesCache;
  }

  async resolveSourceIds(source?: string): Promise<string | undefined> {
    if (!source || source === "all") return undefined;
    const sources = await this.fetchSources();
    const matchingIds = sources.filter((src) => src.alias === source).map((src) => src.id);
    return matchingIds.length > 0 ? matchingIds.join(",") : undefined;
  }
}

/** Arredonda para 2 casas decimais */
export const round2 = (value: number): number => Math.round(value * 100) / 100;
