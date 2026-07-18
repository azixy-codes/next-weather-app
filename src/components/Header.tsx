import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
          <span aria-hidden>🌤️</span> Météo Next
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-zinc-600 transition hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400"
          >
            Accueil
          </Link>
          <Link
            href="/comparer"
            className="text-zinc-600 transition hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400"
          >
            Comparer
          </Link>
        </div>
      </nav>
    </header>
  );
}
