"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { getForecast } from "@/lib/api";
import type { FavoriteCity } from "@/lib/types";
import { getWeatherInfo } from "@/lib/weather-codes";
import { cityKey, cityPath } from "@/lib/utils";
import FavoriteButton from "./FavoriteButton";

export default function FavoritesList() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Aucune ville favorite pour l&apos;instant. Recherchez une ville puis
        cliquez sur l&apos;étoile ☆ pour la retrouver ici.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((city) => (
        <FavoriteCard key={cityKey(city)} city={city} />
      ))}
    </ul>
  );
}

function FavoriteCard({ city }: { city: FavoriteCity }) {
  const [weather, setWeather] = useState<{
    temperature: number;
    code: number;
    isDay: number;
  } | null>(null);

  // Météo courante chargée côté client pour garder la carte à jour
  useEffect(() => {
    let cancelled = false;
    getForecast(city.latitude, city.longitude)
      .then((data) => {
        if (!cancelled) {
          setWeather({
            temperature: data.current.temperature_2m,
            code: data.current.weather_code,
            isDay: data.current.is_day,
          });
        }
      })
      .catch(() => {
        // la carte reste utilisable sans la température
      });
    return () => {
      cancelled = true;
    };
  }, [city.latitude, city.longitude]);

  const info = weather ? getWeatherInfo(weather.code, weather.isDay) : null;

  return (
    <li className="group relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <Link href={cityPath(city)} className="block">
        <div className="flex items-start justify-between gap-2 pr-10">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {city.name}
            </h3>
            {city.country && (
              <p className="text-sm text-zinc-500">{city.country}</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          {info ? (
            <>
              <span className="text-2xl" aria-hidden>
                {info.icon}
              </span>
              <span className="text-2xl font-semibold">
                {Math.round(weather!.temperature)}°
              </span>
              <span className="text-sm text-zinc-500">{info.label}</span>
            </>
          ) : (
            <span className="text-sm text-zinc-400">Chargement…</span>
          )}
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <FavoriteButton city={city} />
      </div>
    </li>
  );
}
