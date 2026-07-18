import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        🧭
      </span>
      <h1 className="text-2xl font-semibold">Page ou ville introuvable</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Cette page n&apos;existe pas, ou la ville demandée n&apos;a pas été
        trouvée par le service de géocodage.
      </p>
      <Link
        href="/"
        className="rounded-full bg-sky-600 px-5 py-2 text-white transition hover:bg-sky-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
