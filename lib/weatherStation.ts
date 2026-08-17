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

export type WeatherStation = {
  updated_utc: string;
  asof_utc?: string;
  gauges: WeatherGauge[];
  sensors: WeatherSensor[];
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
