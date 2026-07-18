"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FavoriteCity } from "@/lib/types";
import { cityKey } from "@/lib/utils";

const STORAGE_KEY = "meteo-next:favorites";
const CHANGE_EVENT = "meteo-next:favorites-change";

const EMPTY: FavoriteCity[] = [];

// Snapshot mis en cache : getSnapshot doit renvoyer la même référence tant que
// le localStorage n'a pas changé, sinon useSyncExternalStore boucle à l'infini.
let cachedRaw: string | null = null;
let cachedFavorites: FavoriteCity[] = EMPTY;

function readFavorites(): FavoriteCity[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedFavorites = raw ? (JSON.parse(raw) as FavoriteCity[]) : EMPTY;
    } catch {
      cachedFavorites = EMPTY;
    }
  }
  return cachedFavorites;
}

function subscribe(onChange: () => void): () => void {
  // "storage" couvre les autres onglets, l'évènement custom couvre l'onglet courant
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * Favoris persistés en localStorage et partagés entre tous les composants
 * (et même entre onglets) via useSyncExternalStore.
 */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, readFavorites, () => EMPTY);

  const isFavorite = useCallback(
    (city: FavoriteCity) => favorites.some((f) => cityKey(f) === cityKey(city)),
    [favorites],
  );

  const toggleFavorite = useCallback((city: FavoriteCity) => {
    const current = readFavorites();
    const next = current.some((f) => cityKey(f) === cityKey(city))
      ? current.filter((f) => cityKey(f) !== cityKey(city))
      : [...current, city];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // stockage indisponible (navigation privée…) : le favori ne sera pas persisté
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
