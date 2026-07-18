interface WeatherInfo {
  label: string;
  icon: string;
}

/** Correspondance des codes météo WMO utilisés par Open-Meteo. */
const WEATHER_CODES: Record<number, WeatherInfo> = {
  0: { label: "Ciel dégagé", icon: "☀️" },
  1: { label: "Plutôt dégagé", icon: "🌤️" },
  2: { label: "Partiellement nuageux", icon: "⛅" },
  3: { label: "Couvert", icon: "☁️" },
  45: { label: "Brouillard", icon: "🌫️" },
  48: { label: "Brouillard givrant", icon: "🌫️" },
  51: { label: "Bruine légère", icon: "🌦️" },
  53: { label: "Bruine modérée", icon: "🌦️" },
  55: { label: "Bruine dense", icon: "🌧️" },
  56: { label: "Bruine verglaçante", icon: "🌧️" },
  57: { label: "Bruine verglaçante dense", icon: "🌧️" },
  61: { label: "Pluie légère", icon: "🌧️" },
  63: { label: "Pluie modérée", icon: "🌧️" },
  65: { label: "Pluie forte", icon: "🌧️" },
  66: { label: "Pluie verglaçante", icon: "🌧️" },
  67: { label: "Pluie verglaçante forte", icon: "🌧️" },
  71: { label: "Neige légère", icon: "🌨️" },
  73: { label: "Neige modérée", icon: "🌨️" },
  75: { label: "Neige forte", icon: "❄️" },
  77: { label: "Grains de neige", icon: "❄️" },
  80: { label: "Averses légères", icon: "🌦️" },
  81: { label: "Averses modérées", icon: "🌧️" },
  82: { label: "Averses violentes", icon: "⛈️" },
  85: { label: "Averses de neige", icon: "🌨️" },
  86: { label: "Fortes averses de neige", icon: "❄️" },
  95: { label: "Orage", icon: "⛈️" },
  96: { label: "Orage avec grêle", icon: "⛈️" },
  99: { label: "Orage avec forte grêle", icon: "⛈️" },
};

export function getWeatherInfo(code: number, isDay = 1): WeatherInfo {
  const info = WEATHER_CODES[code] ?? { label: "Conditions inconnues", icon: "❓" };
  if (code === 0 && isDay === 0) return { label: info.label, icon: "🌙" };
  if (code === 1 && isDay === 0) return { label: info.label, icon: "🌙" };
  return info;
}
