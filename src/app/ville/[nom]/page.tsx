import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAirQuality, getForecast, searchCities } from "@/lib/api";
import { getWeatherInfo } from "@/lib/weather-codes";
import { formatDay, formatHour, windCardinal } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";
import AirQualityCard from "@/components/AirQualityCard";

interface CityPageProps {
  params: Promise<{ nom: string }>;
  searchParams: Promise<{ lat?: string; lon?: string; pays?: string }>;
}

interface ResolvedCity {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

/**
 * La ville vient normalement de la recherche (lat/lon dans l'URL). Si on
 * arrive avec /ville/paris sans coordonnées, on géocode le nom côté serveur.
 */
async function resolveCity(props: CityPageProps): Promise<ResolvedCity | null> {
  const { nom } = await props.params;
  const { lat, lon, pays } = await props.searchParams;
  const name = decodeURIComponent(nom);

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (Number.isFinite(latitude) && Number.isFinite(longitude) && lat && lon) {
    return { name, latitude, longitude, country: pays };
  }

  const results = await searchCities(name, 1);
  const city = results[0];
  if (!city) return null;
  return {
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    country: city.country,
  };
}

export async function generateMetadata(props: CityPageProps): Promise<Metadata> {
  const { nom } = await props.params;
  return { title: `Météo à ${decodeURIComponent(nom)}` };
}

export default async function CityPage(props: CityPageProps) {
  const city = await resolveCity(props);
  if (!city) notFound();

  // Les deux appels API sont indépendants : on les lance en parallèle
  const [forecast, airQuality] = await Promise.all([
    getForecast(city.latitude, city.longitude),
    getAirQuality(city.latitude, city.longitude),
  ]);

  const { current, daily } = forecast;
  const info = getWeatherInfo(current.weather_code, current.is_day);

  const details: { label: string; value: string; icon: string }[] = [
    {
      label: "Ressenti",
      value: `${Math.round(current.apparent_temperature)}°C`,
      icon: "🌡️",
    },
    {
      label: "Humidité",
      value: `${current.relative_humidity_2m}%`,
      icon: "💧",
    },
    {
      label: "Pression",
      value: `${Math.round(current.surface_pressure)} hPa`,
      icon: "🧭",
    },
    {
      label: "Vent",
      value: `${Math.round(current.wind_speed_10m)} km/h ${windCardinal(current.wind_direction_10m)}`,
      icon: "💨",
    },
    {
      label: "Indice UV max",
      value: `${Math.round(daily.uv_index_max[0] ?? 0)}`,
      icon: "🕶️",
    },
    {
      label: "Lever / coucher",
      value: `${formatHour(daily.sunrise[0])} / ${formatHour(daily.sunset[0])}`,
      icon: "🌅",
    },
  ];

  const mapBbox = [
    city.longitude - 0.12,
    city.latitude - 0.06,
    city.longitude + 0.12,
    city.latitude + 0.06,
  ].join(",");

  return (
    <div className="flex flex-col gap-8">
      {/* En-tête : ville + conditions actuelles */}
      <section className="rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{city.name}</h1>
            {city.country && <p className="text-sky-100">{city.country}</p>}
          </div>
          <FavoriteButton city={city} withLabel />
        </div>
        <div className="mt-6 flex items-center gap-4">
          <span className="text-6xl" aria-hidden>
            {info.icon}
          </span>
          <div>
            <p className="text-5xl font-bold">
              {Math.round(current.temperature_2m)}°C
            </p>
            <p className="text-sky-100">{info.label}</p>
          </div>
        </div>
      </section>

      {/* Détails des conditions actuelles */}
      <section aria-label="Détails des conditions actuelles">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {details.map((d) => (
            <li
              key={d.label}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500">
                <span aria-hidden>{d.icon}</span> {d.label}
              </p>
              <p className="mt-1 text-lg font-semibold">{d.value}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Prévisions sur 7 jours */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Prévisions sur 7 jours</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {daily.time.map((day, i) => {
            const dayInfo = getWeatherInfo(daily.weather_code[i]);
            return (
              <li
                key={day}
                className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-3 text-center dark:border-zinc-700 dark:bg-zinc-900"
              >
                <p className="text-sm font-medium capitalize text-zinc-600 dark:text-zinc-400">
                  {formatDay(day)}
                </p>
                <span className="text-3xl" aria-hidden title={dayInfo.label}>
                  {dayInfo.icon}
                </span>
                <p className="text-sm">
                  <span className="font-semibold">
                    {Math.round(daily.temperature_2m_max[i])}°
                  </span>{" "}
                  <span className="text-zinc-500">
                    {Math.round(daily.temperature_2m_min[i])}°
                  </span>
                </p>
                {daily.precipitation_probability_max[i] != null && (
                  <p className="text-xs text-sky-600 dark:text-sky-400">
                    💧 {daily.precipitation_probability_max[i]}%
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Fonctionnalité originale : qualité de l'air */}
      {airQuality && <AirQualityCard airQuality={airQuality.current} />}

      {/* Localisation */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Localisation</h2>
        <iframe
          title={`Carte de ${city.name}`}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${city.latitude},${city.longitude}`}
          className="h-72 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700"
          loading="lazy"
        />
      </section>
    </div>
  );
}
