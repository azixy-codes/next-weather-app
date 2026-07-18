"use client";

import { useFavorites } from "@/hooks/useFavorites";
import type { FavoriteCity } from "@/lib/types";

interface FavoriteButtonProps {
  city: FavoriteCity;
  /** Affiche aussi un libellé à côté de l'étoile (page de détail) */
  withLabel?: boolean;
}

export default function FavoriteButton({ city, withLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(city);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(city)}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400"
          : "border-zinc-200 bg-white text-zinc-500 hover:border-amber-300 hover:text-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      }`}
    >
      <span aria-hidden>{active ? "★" : "☆"}</span>
      {withLabel && (active ? "Dans les favoris" : "Ajouter aux favoris")}
    </button>
  );
}
