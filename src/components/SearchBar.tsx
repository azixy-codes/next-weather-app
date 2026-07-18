"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchCities } from "@/lib/api";
import type { City } from "@/lib/types";
import { cityPath, countryFlag } from "@/lib/utils";

interface SearchBarProps {
  /** Par défaut la sélection navigue vers la page de détail ; surchargé sur la page de comparaison. */
  onSelect?: (city: City) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  onSelect,
  placeholder = "Rechercher une ville…",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Recherche avec debounce pour ne pas appeler l'API à chaque frappe
  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setIsOpen(true);
        setError(null);
      } catch {
        setError("Recherche indisponible, réessayez plus tard.");
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Ferme la liste de suggestions au clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(city: City) {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    if (onSelect) {
      onSelect(city);
    } else {
      router.push(cityPath(city));
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (value.trim().length < 2) {
              setResults([]);
              setIsOpen(false);
            }
          }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Rechercher une ville"
          className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-zinc-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sky-500 dark:focus:ring-sky-900"
        />
        {isLoading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-pulse text-sm text-zinc-400">
            …
          </span>
        )}
      </div>

      {isOpen && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {error && (
            <li className="px-4 py-3 text-sm text-red-500">{error}</li>
          )}
          {!error && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-zinc-500">
              Aucune ville trouvée.
            </li>
          )}
          {!error &&
            results.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(city)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-sky-50 dark:hover:bg-zinc-800"
                >
                  <span>{countryFlag(city.country_code)}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {city.name}
                  </span>
                  <span className="truncate text-sm text-zinc-500">
                    {[city.admin1, city.country].filter(Boolean).join(", ")}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
