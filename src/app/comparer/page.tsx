"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { getForecast } from "@/lib/api";
import type { City, ForecastResponse } from "@/lib/types";
import { getWeatherInfo } from "@/lib/weather-codes";
import { cityPath, windCardinal } from "@/lib/utils";

interface Slot {
  city: City | null;
  forecast: ForecastResponse | null;
  error: boolean;
}

const EMPTY_SLOT: Slot = { city: null, forecast: null, error: false };

export default function ComparePage() {
  const [slots, setSlots] = useState<[Slot, Slot]>([EMPTY_SLOT, EMPTY_SLOT]);

  function selectCity(index: 0 | 1, city: City) {
    setSlots((prev) => {
      const next: [Slot, Slot] = [...prev];
      next[index] = { city, forecast: null, error: false };
      return next;
    });
  }

  // Charge la météo dès qu'une ville est choisie dans un des deux emplacements
  useEffect(() => {
    slots.forEach((slot, index) => {
      if (slot.city && !slot.forecast && !slot.error) {
        getForecast(slot.city.latitude, slot.city.longitude)
          .then((forecast) =>
            setSlots((prev) => {
              const next: [Slot, Slot] = [...prev];
              next[index] = { ...prev[index], forecast };
              return next;
            }),
          )
          .catch(() =>
            setSlots((prev) => {
              const next: [Slot, Slot] = [...prev];
              next[index] = { ...prev[index], error: true };
              return next;
            }),
          );
      }
    });
  }, [slots]);

  const [left, right] = slots;
  const bothReady = left.forecast && right.forecast;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Comparer deux villes
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Choisissez deux villes pour comparer leurs conditions météo actuelles
          côte à côte.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {([0, 1] as const).map((index) => {
          const slot = slots[index];
          return (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <SearchBar
                placeholder={`Ville ${index + 1}…`}
                onSelect={(city) => selectCity(index, city)}
              />
              {slot.city && (
                <CityPreview slot={slot} />
              )}
            </div>
          );
        })}
      </div>

      {bothReady && left.city && right.city && (
        <ComparisonTable
          leftName={left.city.name}
          rightName={right.city.name}
          left={left.forecast!}
          right={right.forecast!}
        />
      )}
    </div>
  );
}

function CityPreview({ slot }: { slot: Slot }) {
  if (!slot.city) return null;
  if (slot.error) {
    return <p className="text-sm text-red-500">Météo indisponible.</p>;
  }
  if (!slot.forecast) {
    return <p className="text-sm text-zinc-400">Chargement…</p>;
  }
  const { current } = slot.forecast;
  const info = getWeatherInfo(current.weather_code, current.is_day);
  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl" aria-hidden>
        {info.icon}
      </span>
      <div>
        <Link
          href={cityPath(slot.city)}
          className="font-semibold hover:text-sky-600"
        >
          {slot.city.name}
          {slot.city.country ? `, ${slot.city.country}` : ""}
        </Link>
        <p className="text-2xl font-bold">
          {Math.round(current.temperature_2m)}°C{" "}
          <span className="text-sm font-normal text-zinc-500">{info.label}</span>
        </p>
      </div>
    </div>
  );
}

function ComparisonTable({
  leftName,
  rightName,
  left,
  right,
}: {
  leftName: string;
  rightName: string;
  left: ForecastResponse;
  right: ForecastResponse;
}) {
  const rows: { label: string; format: (f: ForecastResponse) => string; value: (f: ForecastResponse) => number }[] = [
    {
      label: "Température",
      value: (f) => f.current.temperature_2m,
      format: (f) => `${Math.round(f.current.temperature_2m)}°C`,
    },
    {
      label: "Ressenti",
      value: (f) => f.current.apparent_temperature,
      format: (f) => `${Math.round(f.current.apparent_temperature)}°C`,
    },
    {
      label: "Humidité",
      value: (f) => f.current.relative_humidity_2m,
      format: (f) => `${f.current.relative_humidity_2m}%`,
    },
    {
      label: "Vent",
      value: (f) => f.current.wind_speed_10m,
      format: (f) =>
        `${Math.round(f.current.wind_speed_10m)} km/h ${windCardinal(f.current.wind_direction_10m)}`,
    },
    {
      label: "Indice UV max",
      value: (f) => f.daily.uv_index_max[0] ?? 0,
      format: (f) => `${Math.round(f.daily.uv_index_max[0] ?? 0)}`,
    },
    {
      label: "Max / min aujourd'hui",
      value: (f) => f.daily.temperature_2m_max[0],
      format: (f) =>
        `${Math.round(f.daily.temperature_2m_max[0])}° / ${Math.round(f.daily.temperature_2m_min[0])}°`,
    },
  ];

  return (
    <section className="overflow-x-auto">
      <table className="w-full min-w-105 border-collapse overflow-hidden rounded-2xl text-sm">
        <thead>
          <tr className="bg-sky-600 text-white">
            <th className="px-4 py-3 text-left font-semibold">Critère</th>
            <th className="px-4 py-3 text-left font-semibold">{leftName}</th>
            <th className="px-4 py-3 text-left font-semibold">{rightName}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const leftValue = row.value(left);
            const rightValue = row.value(right);
            const highlight = "font-semibold text-sky-700 dark:text-sky-400";
            return (
              <tr
                key={row.label}
                className="border-b border-zinc-200 bg-white last:border-0 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <td className="px-4 py-3 text-zinc-500">{row.label}</td>
                <td className={`px-4 py-3 ${leftValue > rightValue ? highlight : ""}`}>
                  {row.format(left)}
                </td>
                <td className={`px-4 py-3 ${rightValue > leftValue ? highlight : ""}`}>
                  {row.format(right)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
