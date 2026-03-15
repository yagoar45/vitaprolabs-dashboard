// Resposta crua da API do Meta/Facebook (Graph API /insights)
export interface MetaAdInsight {
  ad_name: string;
  impressions: string; // Meta retorna números como strings
  actions?: { action_type: string; value: string }[];
  video_p75_watched_actions?: { action_type: string; value: string }[];
}

export interface MetaInsightsResponse {
  data: MetaAdInsight[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}

// Resposta de /me/adaccounts
export interface MetaAdAccountsResponse {
  data: { account_id: string; id: string }[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}

// Dados normalizados por ad
export interface MetaAdVideoMetrics {
  adName: string;
  impressions: number;
  video3SecViews: number;
  videoP75Views: number;
  hookRate: number; // já em %
  holdRate: number; // já em %
}
