export type WeatherGauge = {
  id: string;
  label_zh: string;
  label_en: string;
  value: string;
  detail?: string;
  tier: 'verified-2' | 'verified-1' | 'sensor';
  note_zh?: string;
  note_en?: string;
};

export type WeatherSensor = {
  id: string;
  label_zh: string;
  label_en: string;
  value: string;
};

// Reefing (縮帆, 2026-08-20) — the station's response arm. Two
// PRE-REGISTERED de-sizing rules (§0.52 ADX / §0.53 vol targeting) whose
// forward verdicts have not landed; the card must render this as
// 預註冊·forward累積中, never as an active rule.
export type ReefingClock = {
  id: string;
  label_zh: string;
  due: string;
  days_left: number;
};

export type Reefing = {
  status: string; // 'preregistered'
  label_zh: string;
  label_en: string;
  note_zh: string;
  note_en: string;
  vol_target_w_btc: number | null;
  vol_target_w_core9: number | null;
  adx_desize_now: string; // 'x0.5' | 'x1.0'
  mr_family_corr_60d: number | null;
  clocks: ReefingClock[];
};

export type WeatherStation = {
  updated_utc: string;
  asof_utc?: string;
  gauges: WeatherGauge[];
  sensors: WeatherSensor[];
  reefing?: Reefing;
  cadence: string;
  disclaimer: string;
};

const WEATHER_STATION_URL =
  process.env.WEATHER_STATION_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/weather-station';

/**
 * Crowd-strategy weather station (survival layer, 2026-08-17). Which
 * popular-strategy crowds the market has been feeding over the trailing
 * 30 days — the operational regime definition each strategy's survival
 * card conditions on. Same degrade contract as every /public consumer:
 * outage returns null, the card renders dashes, the page never throws.
 */
export async function getWeatherStation(): Promise<WeatherStation | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(WEATHER_STATION_URL, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error || !Array.isArray(data?.gauges)) return null;
    return data as WeatherStation;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
