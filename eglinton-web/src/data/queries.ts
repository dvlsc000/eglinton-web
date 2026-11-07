/**
 * Server-side data access for pages. Pages import from here — never from a
 * provider directly. Each function:
 *  - opts into request-time rendering (connection()), so schedules are fresh;
 *  - is deduplicated per request with React cache();
 *  - returns a Result so pages can render a designed error state.
 */
import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getDataProvider } from "./index";
import { isDataError } from "./errors";
import type { ArchiveFilters, Season, Standings, Tournament } from "@/domain/schemas";
import { civilAddDays, civilWeekStart, clubDayStart, clubToday } from "@/domain/civil";
import { formatMetric } from "@/domain/format";

export type Result<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (isDataError(e)) {
      console.error(`[data] ${e.code}: ${e.message}`);
      return { ok: false, error: { code: e.code, message: e.message } };
    }
    throw e;
  }
}

export const isDemoData = () => getDataProvider().isDemo;

export const getUpcoming = cache(async (limit = 8) => {
  await connection();
  return attempt(() => getDataProvider().getUpcomingTournaments({ limit }));
});

export const SCHEDULE_WEEKS_BACK = 1;
export const SCHEDULE_WEEKS_AHEAD = 6;

/** Window the schedule page can navigate: last week → six weeks ahead. */
export const getScheduleWindow = cache(async () => {
  await connection();
  const now = new Date();
  const today = clubToday(now);
  const firstWeek = civilAddDays(civilWeekStart(today), -7 * SCHEDULE_WEEKS_BACK);
  const lastDayExclusive = civilAddDays(civilWeekStart(today), 7 * (SCHEDULE_WEEKS_AHEAD + 1));
  const res = await attempt(() =>
    getDataProvider().getTournamentSchedule({
      from: clubDayStart(firstWeek).toISOString(),
      to: clubDayStart(lastDayExclusive).toISOString(),
    })
  );
  return { today, firstWeek, lastDayExclusive, res };
});

export const getTournament = cache(async (id: string) => {
  await connection();
  return attempt(async () => {
    const p = getDataProvider();
    const tournament = await p.getTournamentById(id);
    if (!tournament) return null;
    const [structure, result, upcoming, leagues] = await Promise.all([
      p.getTournamentStructure(tournament.structureId),
      tournament.status === "completed" ? p.getTournamentResult(id) : Promise.resolve(null),
      p.getUpcomingTournaments({ limit: 40 }),
      p.getLeagues(),
    ]);
    const related = pickRelated(tournament, upcoming);
    return { tournament, structure, result, related, leagues: leagues.filter((l) => tournament.leagueIds.includes(l.id)) };
  });
});

function pickRelated(t: Tournament, upcoming: Tournament[]): Tournament[] {
  // Next running of the same event, then series siblings, then the soonest games of the same variant.
  const others = upcoming.filter((u) => u.id !== t.id);
  const out: Tournament[] = [];
  const add = (u?: Tournament) => u && !out.includes(u) && out.length < 3 && out.push(u);
  add(others.find((u) => u.name === t.name));
  if (t.seriesId) others.filter((u) => u.seriesId === t.seriesId).forEach(add);
  others.filter((u) => u.variant === t.variant && u.name !== t.name).forEach(add);
  others.forEach(add);
  return out;
}

export type LeagueView = {
  standings: Standings | null;
  seasons: Season[];
  selected: Season | null;
};

export const getLeagueView = cache(async (leagueId: string, seasonId?: string) => {
  await connection();
  return attempt(async (): Promise<LeagueView | null> => {
    const p = getDataProvider();
    const [league, seasons] = await Promise.all([p.getLeague(leagueId), p.getSeasons(leagueId)]);
    if (!league) return null;
    const selected = seasons.find((s) => s.id === seasonId) ?? seasons.find((s) => s.status === "active") ?? seasons[0] ?? null;
    const standings = selected ? await p.getLeagueStandings(leagueId, selected.id) : null;
    return { standings, seasons, selected };
  });
});

export const getLeagues = cache(async () => {
  await connection();
  return attempt(() => getDataProvider().getLeagues());
});

export const getArchive = cache(async (filters: ArchiveFilters) => {
  await connection();
  return attempt(() => getDataProvider().getArchivedResults(filters));
});

/** Tournaments belonging to an editorial series (featured event). */
export const getSeriesTournaments = cache(async (seriesId: string) => {
  await connection();
  return attempt(async () => {
    const p = getDataProvider();
    const all = await p.getUpcomingTournaments();
    return all.filter((t) => t.seriesId === seriesId);
  });
});

export type SeasonSummary = {
  leagueId: string;
  leagueName: string;
  seasonId: string;
  seasonName: string;
  startsOn: string;
  endsOn: string;
  status: Season["status"];
  leader: { name: string; value: string } | null;
  players: number;
};

/** Completed and current seasons for every league, with each season's leader. */
export const getSeasonSummaries = cache(async () => {
  await connection();
  return attempt(async (): Promise<SeasonSummary[]> => {
    const p = getDataProvider();
    const leagues = await p.getLeagues();
    const out: SeasonSummary[] = [];
    for (const league of leagues) {
      const seasons = await p.getSeasons(league.id);
      const standings = await Promise.all(seasons.map((s) => p.getLeagueStandings(league.id, s.id)));
      seasons.forEach((s, i) => {
        const top = standings[i]?.entries[0];
        const m = league.metrics[0];
        out.push({
          leagueId: league.id,
          leagueName: league.name,
          seasonId: s.id,
          seasonName: s.name,
          startsOn: s.startsOn,
          endsOn: s.endsOn,
          status: s.status,
          leader: top ? { name: top.player.displayName, value: `${formatMetric(top.values[m.key] ?? 0, m.format)} ${m.shortLabel.toLowerCase()}` } : null,
          players: standings[i]?.entries.length ?? 0,
        });
      });
    }
    return out;
  });
});
