import { getContent } from "@/content/provider";
import { getLeagueView, getSeriesTournaments, getUpcoming, isDemoData } from "@/data/queries";
import { Hero } from "@/components/home/hero";
import {
  AnnouncementStrip,
  FeaturedSeries,
  FirstVisit,
  GamesSection,
  LeaderboardPreview,
  LeagueEntryPoints,
  TonightTicker,
  UpcomingSection,
} from "@/components/home/sections";
import { InviteBand } from "@/components/layout/invite-band";

export default async function HomePage() {
  const content = await getContent();
  const featured = content.featuredEvents[0];
  const [upcoming, ticker, tl, cl, series] = await Promise.all([
    getUpcoming(6),
    getUpcoming(10),
    getLeagueView("tournament-league"),
    getLeagueView("cash-league"),
    featured ? getSeriesTournaments(featured.id) : Promise.resolve(null),
  ]);
  const isDemo = isDemoData();
  const next = upcoming.ok ? (upcoming.data[0] ?? null) : null;

  return (
    <>
      <Hero hero={content.hero} next={next} isDemo={isDemo} />
      <TonightTicker items={ticker.ok ? ticker.data : []} />
      <AnnouncementStrip items={content.announcements} isDemo={isDemo} />
      <UpcomingSection result={upcoming} isDemo={isDemo} />
      <FirstVisit visit={content.visit} />
      {featured && <FeaturedSeries event={featured} tournaments={series?.ok ? series.data : []} isDemo={isDemo} />}
      <LeaderboardPreview standings={tl.ok ? (tl.data?.standings ?? null) : null} isDemo={isDemo} />
      <LeagueEntryPoints
        tournamentSeason={tl.ok ? (tl.data?.selected ?? null) : null}
        cashSeason={cl.ok ? (cl.data?.selected ?? null) : null}
        isDemo={isDemo}
      />
      <GamesSection club={content.club} />
      <InviteBand phoneHref={content.visit.phoneHref} phoneDisplay={content.visit.phoneDisplay} />
    </>
  );
}
