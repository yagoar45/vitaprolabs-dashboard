import type { VTurbPlayer, VTurbTrafficOriginStats, VTurbTrafficOriginRaw } from "./types";

const VTURB_API_URL = "https://analytics.vturb.net";

export class VTurbClient {
  private token: string;
  private playersCache: VTurbPlayer[] | null = null;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: { method?: "GET" | "POST"; body?: Record<string, unknown>; params?: Record<string, string> } = {},
    retries = 3,
  ): Promise<T> {
    const { method = options.body ? "POST" : "GET", body, params } = options;

    let url = `${VTURB_API_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-Api-Token": this.token,
            "X-Api-Version": "v1",
          },
          ...(body && { body: JSON.stringify(body) }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new Error(`VTurb API Error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    throw new Error("VTurb request failed after retries");
  }

  async getPlayers(): Promise<VTurbPlayer[]> {
    if (this.playersCache) {
      return this.playersCache;
    }
    const players = await this.request<VTurbPlayer[]>("/players/list");
    this.playersCache = players;
    return players;
  }

  async getPlayerById(playerId: string): Promise<VTurbPlayer | undefined> {
    const players = await this.getPlayers();
    return players.find((p) => p.id === playerId);
  }

  async getTrafficOriginStats(params: {
    player_id: string;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    video_duration: number;
    pitch_time?: number;
  }): Promise<VTurbTrafficOriginStats[]> {
    // VTurb exige datas com horário completo
    const startDate = `${params.start_date} 00:00:00`;
    const endDate = `${params.end_date} 23:59:59`;

    const rawResponse = await this.request<VTurbTrafficOriginRaw[]>("/traffic_origin/stats", {
      body: {
        player_id: params.player_id,
        start_date: startDate,
        end_date: endDate,
        query_key: "utm_content",
        video_duration: params.video_duration,
        timezone: "America/Sao_Paulo",
        ...(params.pitch_time && { pitch_time: params.pitch_time }),
      },
    });

    // Mapear resposta crua para formato normalizado
    return rawResponse.map((raw) => ({
      grouped_field: raw.grouped_field,
      views: raw.total_viewed_session_uniq ?? 0,
      plays: raw.total_started_session_uniq ?? 0,
      play_rate: parseFloat(String(raw.play_rate)) || 0,
      pitch: raw.total_over_pitch ?? 0,
      pitchRetention: parseFloat(String(raw.over_pitch_rate)) || 0,
      conversion_rate: parseFloat(String(raw.overall_conversion_rate)) || 0,
    }));
  }
}
