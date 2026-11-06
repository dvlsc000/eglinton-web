import type { CasinoDataProvider } from "../provider";
import {
  League,
  Season,
  Standings,
  Tournament,
  TournamentResult,
  TournamentStructure,
  type ArchiveFilters,
  type ScheduleFilters,
  type TournamentStatus,
} from "@/domain/schemas";
import { getDataset, type BaseTournament } from "./generate";
import { matchesSearch } from "../search";
import { estimatedHours, minutesUntilEndOfLevel, STRUCTURE_BY_ID } from "./structures";

/** Simulated latency so loading states are exercised in development. */
const LATENCY_MS = Number(process.env.MOCK_LATENCY_MS ?? 0);
const wait = () => (LATENCY_MS > 0 ? new Promise((r) => setTimeout(r, LATENCY_MS)) : Promise.resolve());

export function deriveStatus(t: BaseTournament, now: Date): { status: TournamentStatus; note: string | null } {
  if (t.cancelledNote) return { status: "cancelled", note: t.cancelledNote };
  const start = new Date(t.startsAt).getTime();
  const n = now.getTime();
  const regOpens = start - 5 * 3_600_000;
  const lateRegEnds = start + minutesUntilEndOfLevel(t.structureId, t.lateRegLevel) * 60_000;
  const ends = start + estimatedHours(t.structureId) * 3_600_000;
  if (n < regOpens) return { status: "scheduled", note: null };
  if (n < start) return { status: "registration-open", note: null };
  if (n < lateRegEnds) return { status: "late-registration", note: null };
  if (n < ends) return { status: "in-progress", note: null };
  return { status: "completed", note: null };
}

function toTournament(t: BaseTournament, now: Date): Tournament {
  const { status, note } = deriveStatus(t, now);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cancelledNote, baseEntries, ...rest } = t;
  // Validate at the boundary exactly as the API provider would.
  return Tournament.parse({ ...rest, status, statusNote: note });
}

export class MockCasinoDataProvider implements CasinoDataProvider {
  readonly name = "mock";
  readonly isDemo = true;

  constructor(private readonly clock: () => Date = () => new Date()) {}

  private ds() {
    return getDataset(this.clock());
  }

  async getUpcomingTournaments(options?: { limit?: number }) {
    await wait();
    const now = this.clock();
    const out = this.ds()
      .tournaments.map((t) => toTournament(t, now))
      .filter((t) => t.status === "scheduled" || t.status === "registration-open" || t.status === "late-registration");
    return options?.limit ? out.slice(0, options.limit) : out;
  }

  async getTournamentById(id: string) {
    await wait();
    const t = this.ds().tournaments.find((x) => x.id === id);
    return t ? toTournament(t, this.clock()) : null;
  }

  async getTournamentSchedule(filters: ScheduleFilters) {
    await wait();
    const now = this.clock();
    return this.ds()
      .tournaments.filter((t) => (!filters.from || t.startsAt >= filters.from) && (!filters.to || t.startsAt < filters.to))
      .map((t) => toTournament(t, now))
      .filter(
        (t) =>
          (!filters.variants?.length || filters.variants.includes(t.variant)) &&
          (!filters.formats?.length || filters.formats.some((f) => t.formats.includes(f))) &&
          (!filters.statuses?.length || filters.statuses.includes(t.status)) &&
          matchesSearch([t.name, t.variant, ...t.formats], filters.search)
      );
  }

  async getTournamentStructure(structureId: string) {
    await wait();
    const s = STRUCTURE_BY_ID.get(structureId);
    return s ? TournamentStructure.parse(s) : null;
  }

  async getTournamentResult(tournamentId: string) {
    await wait();
    const ds = this.ds();
    const res = ds.results.get(tournamentId);
    const t = ds.tournaments.find((x) => x.id === tournamentId);
    if (!res || !t) return null;
    return TournamentResult.parse({ ...res, tournament: toTournament(t, this.clock()) });
  }

  async getLeagues() {
    await wait();
    return this.ds().leagues.map((l) => League.parse(l));
  }

  async getLeague(leagueId: string) {
    await wait();
    const l = this.ds().leagues.find((x) => x.id === leagueId);
    return l ? League.parse(l) : null;
  }

  async getSeasons(leagueId: string) {
    await wait();
    return this.ds()
      .seasons.filter((s) => s.leagueId === leagueId)
      .sort((a, b) => b.startsOn.localeCompare(a.startsOn))
      .map((s) => Season.parse(s));
  }

  async getLeagueStandings(leagueId: string, seasonId: string) {
    await wait();
    const ds = this.ds();
    const league = ds.leagues.find((l) => l.id === leagueId);
    const season = ds.seasons.find((s) => s.id === seasonId && s.leagueId === leagueId);
    const st = ds.standings.get(seasonId);
    if (!league || !season || !st) return null;
    return Standings.parse({
      league,
      season,
      updatedAt: ds.dayStart.toISOString(),
      comparisonLabel: st.comparisonLabel,
      entries: st.entries,
    });
  }

  async getArchivedResults(filters: ArchiveFilters) {
    await wait();
    const ds = this.ds();
    const now = this.clock();
    const out: TournamentResult[] = [];
    for (let i = ds.tournaments.length - 1; i >= 0; i--) {
      const t = ds.tournaments[i];
      const res = ds.results.get(t.id);
      if (!res) continue;
      if (filters.from && t.startsAt < filters.from) continue;
      if (filters.to && t.startsAt >= filters.to) continue;
      if (filters.variants?.length && !filters.variants.includes(t.variant)) continue;
      if (!matchesSearch([t.name, ...res.payouts.map((p) => p.player.displayName)], filters.search)) continue;
      out.push(TournamentResult.parse({ ...res, tournament: toTournament(t, now) }));
      if (filters.limit && out.length >= filters.limit) break;
    }
    return out;
  }
}
