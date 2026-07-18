import type { CurrentAirQuality } from "@/lib/types";

/** Paliers de l'indice européen de qualité de l'air (EAQI). */
function aqiLevel(aqi: number): { label: string; className: string } {
  if (aqi <= 20) return { label: "Bonne", className: "bg-emerald-500" };
  if (aqi <= 40) return { label: "Correcte", className: "bg-lime-500" };
  if (aqi <= 60) return { label: "Moyenne", className: "bg-amber-500" };
  if (aqi <= 80) return { label: "Mauvaise", className: "bg-orange-500" };
  if (aqi <= 100) return { label: "Très mauvaise", className: "bg-red-500" };
  return { label: "Extrêmement mauvaise", className: "bg-purple-600" };
}

export default function AirQualityCard({
  airQuality,
}: {
  airQuality: CurrentAirQuality;
}) {
  const { european_aqi } = airQuality;

  const pollutants: { label: string; value: number | null; unit: string }[] = [
    { label: "PM2.5", value: airQuality.pm2_5, unit: "µg/m³" },
    { label: "PM10", value: airQuality.pm10, unit: "µg/m³" },
    { label: "NO₂", value: airQuality.nitrogen_dioxide, unit: "µg/m³" },
    { label: "O₃", value: airQuality.ozone, unit: "µg/m³" },
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Qualité de l&apos;air</h2>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {european_aqi != null ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block h-4 w-4 rounded-full ${aqiLevel(european_aqi).className}`}
                aria-hidden
              />
              <p>
                <span className="text-2xl font-bold">{Math.round(european_aqi)}</span>{" "}
                <span className="text-sm text-zinc-500">EAQI</span> —{" "}
                <span className="font-medium">{aqiLevel(european_aqi).label}</span>
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {pollutants.map(
                (p) =>
                  p.value != null && (
                    <li key={p.label}>
                      <span className="font-medium">{p.label}</span> :{" "}
                      {Math.round(p.value)} {p.unit}
                    </li>
                  ),
              )}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Données de qualité de l&apos;air indisponibles pour cette zone.
          </p>
        )}
      </div>
    </section>
  );
}
