export interface VTurbPlayer {
  id: string;
  name: string;
  pitch_time?: number;
  duration?: number;
  created_at?: string;
}

// Dados normalizados para uso interno
export interface VTurbTrafficOriginStats {
  grouped_field: string;      // valor do utm_content (= nome do ad)
  views: number;              // views únicas (total_viewed_session_uniq)
  plays: number;              // plays únicos (total_started_session_uniq)
  play_rate: number;          // taxa de play (play_rate) - já em percentual
  pitch: number;              // audiência no pitch (total_over_pitch) - absoluto
  pitchRetention: number;     // retenção ao pitch (over_pitch_rate) - já em percentual
  conversion_rate: number;    // taxa de conversão (overall_conversion_rate) - já em percentual
}

// Resposta crua da API VTurb /traffic_origin/stats
export interface VTurbTrafficOriginRaw {
  grouped_field: string;
  query_key: string;
  total_viewed: number;
  total_viewed_session_uniq: number;
  total_viewed_device_uniq: number;
  total_started: number;
  total_started_session_uniq: number;
  total_started_device_uniq: number;
  total_finished: number;
  total_finished_session_uniq: number;
  total_finished_device_uniq: number;
  total_clicked: number;
  total_clicked_session_uniq: number;
  total_clicked_device_uniq: number;
  engagement_rate: number;
  total_over_pitch: number;
  total_under_pitch: number;
  over_pitch_rate: number;
  total_conversions: number;
  overall_conversion_rate: number | string;
  play_rate: number | string;
  total_amount_usd: number;
  total_amount_brl: number;
  total_amount_eur: number;
}
