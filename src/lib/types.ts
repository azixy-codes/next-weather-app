/** Ville renvoyée par l'API de géocodage Open-Meteo */
export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

export interface GeocodingResponse {
  results?: City[];
}

/** Ville sauvegardée dans les favoris (localStorage) */
export interface FavoriteCity {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  surface_pressure: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  is_day: number;
}

export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_probability_max: (number | null)[];
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast;
}

export interface CurrentAirQuality {
  time: string;
  european_aqi: number | null;
  pm10: number | null;
  pm2_5: number | null;
  nitrogen_dioxide: number | null;
  ozone: number | null;
}

export interface AirQualityResponse {
  current: CurrentAirQuality;
}
