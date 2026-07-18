import SearchBar from "@/components/SearchBar";
import FavoritesList from "@/components/FavoritesList";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-4 pt-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Quel temps fait-il&nbsp;?
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Recherchez une ville pour consulter les conditions actuelles et les
          prévisions sur 7 jours.
        </p>
        <SearchBar autoFocus />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Mes villes favorites</h2>
        <FavoritesList />
      </section>
    </div>
  );
}
