import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeagueView, getLeagues, isDemoData } from "@/data/queries";
import { LeaguePage } from "@/components/leagues/league-page";
import { ErrorState } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Cash League",
  description: "Cash League standings at The Eglinton, Galway: hours at the cash tables, ranked every month.",
};

export default async function CashLeaguePage({ searchParams }: PageProps<"/leagues/cash">) {
  const sp = await searchParams;
  const season = typeof sp.season === "string" ? sp.season : undefined;
  const [leagues, view] = await Promise.all([getLeagues(), getLeagueView("cash-league", season)]);
  if (!leagues.ok) return <section className="surface-ink py-24"><div className="container-site"><ErrorState detail={leagues.error.message} /></div></section>;
  const league = leagues.data.find((l) => l.id === "cash-league");
  if (!league) notFound();
  return (
    <LeaguePage
      league={league}
      view={view}
      isDemo={isDemoData()}
      basePath="/leagues/cash"
      title={[{ text: "Every hour" }, { text: "counts.", outline: true }]}
    />
  );
}
