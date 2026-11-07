import type { Metadata } from "next";
import { getLeagueView, getLeagues, isDemoData } from "@/data/queries";
import { PageHeader } from "@/components/layout/page-header";
import { StandingsBoard } from "@/components/leagues/standings-board";
import { DemoTag, ErrorState, TextLink } from "@/components/ui/primitives";
import { InviteBand } from "@/components/layout/invite-band";
import { getContent } from "@/content/provider";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Live league standings at The Eglinton, Galway — Tournament League and Cash League, by season.",
};

export default async function LeaderboardPage({ searchParams }: PageProps<"/leaderboard">) {
  const sp = await searchParams;
  const leagueId = typeof sp.league === "string" ? sp.league : "tournament-league";
  const seasonId = typeof sp.season === "string" ? sp.season : undefined;
  const leagues = await getLeagues();
  const known = leagues.ok && leagues.data.some((l) => l.id === leagueId) ? leagueId : "tournament-league";
  const view = await getLeagueView(known, seasonId);
  const isDemo = isDemoData();
  const { visit } = await getContent();

  return (
    <>
      <PageHeader
        eyebrow="Leaderboard"
        title={[{ text: "League" }, { text: "table.", outline: true }]}
        lede="Every league, every season. Find your name, sort by any column — and if you're not on it yet, there's a game this week with your seat in it."
        aside={isDemo ? <DemoTag>Fictional players · demo seasons</DemoTag> : undefined}
      />
      <section className="surface-ink pb-28">
        <div className="container-site">
          {!leagues.ok || !view.ok ? (
            <ErrorState title="The leaderboard couldn't be loaded" detail={!leagues.ok ? leagues.error.message : !view.ok ? view.error.message : undefined} />
          ) : view.data?.standings ? (
            <>
              <StandingsBoard
                standings={view.data.standings}
                seasons={view.data.seasons}
                leagues={leagues.data}
                basePath="/leaderboard"
                showPodium
              />
              <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-8">
                <TextLink href={`/leagues/${view.data.standings.league.kind}`}>How the {view.data.standings.league.name} works</TextLink>
                <TextLink href="/archive">Tournament results</TextLink>
              </div>
            </>
          ) : (
            <ErrorState title="No standings available" />
          )}
        </div>
      </section>
      <InviteBand
        title={[{ text: "Get your" }, { text: "name up here.", outline: true }]}
        lede="Points come from every cash in a weekly tournament. The next one is on this week."
        phoneHref={visit.phoneHref}
        phoneDisplay={visit.phoneDisplay}
      />
    </>
  );
}
