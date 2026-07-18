"use client";

export default function CityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        ⛈️
      </span>
      <h1 className="text-2xl font-semibold">
        Impossible de charger la météo
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Le service météo n&apos;a pas répondu correctement. Vérifiez votre
        connexion puis réessayez.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-sky-600 px-5 py-2 text-white transition hover:bg-sky-700"
      >
        Réessayer
      </button>
      {error.digest && (
        <p className="text-xs text-zinc-400">Référence : {error.digest}</p>
      )}
    </div>
  );
}
