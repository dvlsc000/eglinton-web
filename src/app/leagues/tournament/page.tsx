import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeagueView, getLeagues, isDemoData } from "@/data/queries";
import { LeaguePage } from "@/components/leagues/league-page";
import { ErrorState } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Tournament League",
  description: "Tournament League standings at The Eglinton, Galway: points for every cash in the weekly tournaments.",
};

export default async function TournamentLeaguePage({ searchParams }: PageProps<"/leagues/tournament">) {
  const sp = await searchParams;
  const season = typeof sp.season === "string" ? sp.season : undefined;
  const [leagues, view] = await Promise.all([getLeagues(), getLeagueView("tournament-league", season)]);
  if (!leagues.ok) return <section className="surface-ink py-24"><div className="container-site"><ErrorState detail={leagues.error.message} /></div></section>;
  const league = leagues.data.find((l) => l.id === "tournament-league");
  if (!league) notFound();
  return (
    <LeaguePage
      league={league}
      view={view}
      isDemo={isDemoData()}
      basePath="/leagues/tournament"
      title={[{ text: "Every cash" }, { text: "scores.", outline: true }]}
    />
  );
}
