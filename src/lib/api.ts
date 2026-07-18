import type {
  AirQualityResponse,
  City,
  ForecastResponse,
  GeocodingResponse,
} from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

const CURRENT_PARAMS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "surface_pressure",
  "weather_code",
  "wind_speed_10m",
  "wind_direction_10m",
  "is_day",
].join(",");

const DAILY_PARAMS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "uv_index_max",
  "precipitation_probability_max",
].join(",");

async function fetchJson<T>(url: string, revalidate: number): Promise<T> {
  // `next.revalidate` met la réponse en cache côté serveur : deux rendus
  // successifs pour la même ville ne déclenchent qu'un seul appel réseau.
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Open-Meteo a répondu ${res.status} pour ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Convertit un nom de ville en liste de résultats géocodés (lat/lon). */
export async function searchCities(query: string, count = 8): Promise<City[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmed)}&count=${count}&language=fr&format=json`;
  const data = await fetchJson<GeocodingResponse>(url, 86400);
  return data.results ?? [];
}

/** Conditions actuelles + prévisions sur 7 jours pour des coordonnées données. */
export async function getForecast(
  latitude: number,
  longitude: number,
): Promise<ForecastResponse> {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=${CURRENT_PARAMS}&daily=${DAILY_PARAMS}` +
    `&timezone=auto&forecast_days=7`;
  return fetchJson<ForecastResponse>(url, 900);
}

/** Qualité de l'air actuelle (indice européen + principaux polluants). */
export async function getAirQuality(
  latitude: number,
  longitude: number,
): Promise<AirQualityResponse | null> {
  const url =
    `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone&timezone=auto`;
  try {
    return await fetchJson<AirQualityResponse>(url, 1800);
  } catch {
    // La qualité de l'air est un bonus : son absence ne doit pas casser la page.
    return null;
  }
}
