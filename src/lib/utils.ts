import type { City, FavoriteCity } from "./types";

/** URL de la page de détail d'une ville (le nom seul est ambigu, on passe lat/lon). */
export function cityPath(city: City | FavoriteCity): string {
  const params = new URLSearchParams({
    lat: city.latitude.toString(),
    lon: city.longitude.toString(),
  });
  if (city.country) params.set("pays", city.country);
  return `/ville/${encodeURIComponent(city.name)}?${params.toString()}`;
}

/** Identifiant stable d'une ville pour les favoris (deux villes homonymes restent distinctes). */
export function cityKey(city: { latitude: number; longitude: number }): string {
  return `${city.latitude.toFixed(3)},${city.longitude.toFixed(3)}`;
}

/** Drapeau emoji à partir d'un code pays ISO ("FR" -> 🇫🇷). */
export function countryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)),
  );
}

/** "2026-07-18" -> "sam. 18 juil." (les dates Open-Meteo sont déjà dans le fuseau de la ville). */
export function formatDay(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Extrait "HH:MM" d'une date ISO locale ("2026-07-18T06:12" -> "06:12"). */
export function formatHour(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

const CARDINALS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] as const;

/** Direction du vent en point cardinal (270° -> "O"). */
export function windCardinal(degrees: number): string {
  return CARDINALS[Math.round(degrees / 45) % 8];
}
