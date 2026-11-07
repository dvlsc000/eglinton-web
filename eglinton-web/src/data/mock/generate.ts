/**
 * Builds the complete demo dataset relative to today's date, so the demo
 * never looks stale. Output is deterministic for a given day.
 *
 * Internal consistency guarantees (checked by `npm run check:data`):
 * - Results exist only for tournaments that finished before today began.
 * - Tournament League standings are aggregated from those results.
 * - Cash League standings are aggregated from generated session logs.
 * - previousRank is the real rank at the comparison snapshot.
 */
import type { League, Payout, Season, StandingsEntry, Tournament, TournamentResult } from "@/domain/schemas";
import {
  civilAddDays,
  civilAddMonths,
  civilDiffDays,
  civilMonthEnd,
  civilMonthStart,
  civilWeekStart,
  clubDayStart,
  clubLocalToInstant,
  clubToday,
  type CivilDate,
} from "@/domain/civil";
import { formatMonthYear } from "@/domain/format";
import { buildPlayers, CANCELLATIONS, SATELLITES, SERIES, WEEKLY_TEMPLATES, type EventTemplate, type MockPlayer } from "./fixtures";
import { between, rng, weightedSample } from "./random";
import { estimatedHours } from "./structures";

export const WEEKS_BACK = 31;
export const WEEKS_AHEAD = 6;

export type BaseTournament = Omit<Tournament, "status" | "statusNote"> & {
  cancelledNote: string | null;
  baseEntries: number;
};

export type MockSession = { playerId: string; day: CivilDate; hours: number };

export type Dataset = {
  today: CivilDate;
  dayStart: Date;
  players: MockPlayer[];
  tournaments: BaseTournament[];
  results: Map<string, Omit<TournamentResult, "tournament">>;
  leagues: League[];
  seasons: Season[];
  standings: Map<string, { entries: StandingsEntry[]; comparisonLabel: string }>;
};

/* ------------------------------------------------------------------ */
/* Leagues                                                             */
/* ------------------------------------------------------------------ */

export const LEAGUES: League[] = [
  {
    id: "tournament-league",
    kind: "tournament",
    name: "Tournament League",
    tagline: "Points for every cash in the weekly tournaments.",
    description:
      "Every in-the-money finish in a weekly league tournament earns points, weighted by the size of the field. Twelve-week seasons, with the league fund paid to the top finishers.",
    rankingRule: "Ranked by total points. Ties are split by wins, then by number of cashes.",
    rules: [
      "Points are awarded to every player who finishes in the money in a league event.",
      "Points = 10 × √(entries) ÷ √(finishing position), rounded to the nearest whole point.",
      "All weekly tournaments count. Festival and satellite events do not.",
      "€2 from each league-event entry goes to the season's league fund.",
      "The fund is shared by the top eight players at the end of the season.",
    ],
    metrics: [
      { key: "points", label: "Points", shortLabel: "Pts", format: "points" },
      { key: "cashes", label: "Cashes", shortLabel: "Cashes", format: "integer" },
      { key: "wins", label: "Wins", shortLabel: "Wins", format: "integer" },
      { key: "finalTables", label: "Top-three finishes", shortLabel: "Top 3", format: "integer" },
      { key: "winningsCents", label: "Prize money", shortLabel: "Prizes", format: "euro" },
    ],
  },
  {
    id: "cash-league",
    kind: "cash",
    name: "Cash League",
    tagline: "Hours at the cash tables, ranked every month.",
    description:
      "A monthly league for cash-game regulars. Every hour at a live cash table counts toward your total, and the month's leaders share a prize fund.",
    rankingRule: "Ranked by total hours played in the calendar month. Ties are split by number of sessions.",
    rules: [
      "Hours are logged by the floor from table seating to leaving the table.",
      "Any cash game at any stake counts equally.",
      "Seasons run for one calendar month.",
      "The month's top five share the league prize fund.",
    ],
    metrics: [
      { key: "hours", label: "Hours played", shortLabel: "Hours", format: "hours" },
      { key: "sessions", label: "Sessions", shortLabel: "Sessions", format: "integer" },
      { key: "avgSession", label: "Average session (hours)", shortLabel: "Avg h", format: "hours" },
    ],
  },
];

const TL_SEASON_WEEKS = 12;
const TL_CURRENT_SEASON_WEEK = 8; // current week is week 8 of 12
const TL_FUND_PER_ENTRY = 200;
const TL_FUND_SPLIT = [0.25, 0.18, 0.14, 0.11, 0.1, 0.08, 0.07, 0.07];
const CL_FUND = [50000, 35000, 27500, 20000, 17500];
const CL_MONTHS_BACK = 4;

/* ------------------------------------------------------------------ */

const cache = new Map<string, Dataset>();

export function getDataset(now: Date = new Date()): Dataset {
  const today = clubToday(now);
  const hit = cache.get(today);
  if (hit) return hit;
  const ds = build(today);
  cache.clear();
  cache.set(today, ds);
  return ds;
}

function ymdCompact(ymd: CivilDate) {
  return ymd.replaceAll("-", "");
}

function makeTournament(t: EventTemplate, day: CivilDate, seriesId: string | null): BaseTournament {
  return {
    id: `${t.key}-${ymdCompact(day)}`,
    name: t.name,
    seriesId,
    startsAt: clubLocalToInstant(day, t.time).toISOString(),
    variant: t.variant,
    formats: t.formats,
    buyIn: t.buyIn,
    startingStack: t.startingStack,
    guaranteeCents: t.guaranteeCents,
    entryRules: t.entryRules,
    structureId: t.structureId,
    lateRegLevel: t.lateRegLevel,
    leagueIds: t.league ? ["tournament-league"] : [],
    description: t.description,
    cancelledNote: null,
    baseEntries: t.baseEntries,
  };
}

function build(today: CivilDate): Dataset {
  const dayStart = clubDayStart(today);
  const players = buildPlayers(rng("eglinton-players-v1"));
  const thisWeek = civilWeekStart(today);

  /* ---------------- tournaments ---------------- */
  const tournaments: BaseTournament[] = [];
  for (let w = -WEEKS_BACK; w <= WEEKS_AHEAD; w++) {
    const weekStart = civilAddDays(thisWeek, w * 7);
    const series = SERIES.find((s) => s.weekOffset === w);
    for (const tpl of WEEKLY_TEMPLATES) {
      if (series?.replacesWeekdays.includes(tpl.weekday)) continue;
      const day = civilAddDays(weekStart, tpl.weekday - 1);
      const t = makeTournament(tpl, day, null);
      const cancel = CANCELLATIONS.find((c) => c.templateKey === tpl.key && c.weekOffset === w);
      if (cancel) t.cancelledNote = cancel.note;
      tournaments.push(t);
    }
    if (series) {
      for (const ev of series.events) {
        const day = civilAddDays(weekStart, ev.weekday - 1);
        tournaments.push(makeTournament({ ...ev, league: false }, day, series.seriesId));
      }
    }
    for (const sat of SATELLITES.filter((s) => s.weekOffset === w)) {
      const day = civilAddDays(weekStart, sat.weekday - 1);
      tournaments.push(
        makeTournament(
          {
            key: "main-event-satellite",
            name: "Winter Series · Main Event Satellite",
            weekday: sat.weekday,
            time: sat.time,
            variant: "NLHE",
            formats: ["Satellite", "Turbo", "Re-entry"],
            buyIn: { entryCents: 4000, feeCents: 1000, bountyCents: 0 },
            startingStack: 15000,
            guaranteeCents: null,
            entryRules: { type: "re-entry", maxEntries: 3, untilLevel: 6, addOn: null },
            structureId: "turbo-10",
            lateRegLevel: 6,
            baseEntries: 22,
            league: false,
            description:
              "One Main Event seat (€225 value) for every €225 in the prize pool. Remaining funds paid in cash to the next finisher.",
          },
          day,
          "winter-series"
        )
      );
    }
  }
  tournaments.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  /* ---------------- results ---------------- */
  const results = new Map<string, Omit<TournamentResult, "tournament">>();
  for (const t of tournaments) {
    if (t.cancelledNote) continue;
    const end = new Date(t.startsAt).getTime() + estimatedHours(t.structureId) * 3_600_000;
    if (end >= dayStart.getTime()) continue;
    results.set(t.id, buildResult(t, players));
  }

  /* ---------------- seasons & standings ---------------- */
  const seasons: Season[] = [];
  const standings = new Map<string, { entries: StandingsEntry[]; comparisonLabel: string }>();

  // Tournament League — twelve-week seasons
  const currentTlStart = civilAddDays(thisWeek, -(TL_CURRENT_SEASON_WEEK - 1) * 7);
  for (let s = 0; s >= -2; s--) {
    const startsOn = civilAddDays(currentTlStart, s * TL_SEASON_WEEKS * 7);
    const endsOn = civilAddDays(startsOn, TL_SEASON_WEEKS * 7 - 1);
    const status: Season["status"] = s === 0 ? "active" : "completed";
    const inSeason = (iso: string, cutoff: Date) => {
      const ms = new Date(iso).getTime();
      return ms >= clubDayStart(startsOn).getTime() && ms < Math.min(clubDayStart(civilAddDays(endsOn, 1)).getTime(), cutoff.getTime());
    };
    const seasonEnd = clubDayStart(civilAddDays(endsOn, 1));
    const cutoffNow = status === "active" ? dayStart : seasonEnd;
    const cutoffPrev = new Date(cutoffNow.getTime() - 7 * 86_400_000);

    const leagueResults = (cutoff: Date) =>
      tournaments.filter((t) => t.leagueIds.includes("tournament-league") && results.has(t.id) && inSeason(t.startsAt, cutoff)).map((t) => results.get(t.id)!);

    const current = aggregateTournamentLeague(leagueResults(cutoffNow));
    const previous = aggregateTournamentLeague(leagueResults(cutoffPrev));
    const fundCents = leagueResults(cutoffNow).reduce((sum, r) => sum + r.entries * TL_FUND_PER_ENTRY, 0);

    const id = `tl-${ymdCompact(startsOn)}`;
    seasons.push({
      id,
      leagueId: "tournament-league",
      name: `${seasonName(startsOn)} Season`,
      startsOn,
      endsOn,
      status,
      prizePool: {
        totalCents: fundCents,
        places: TL_FUND_SPLIT.map((pct, i) => ({ position: i + 1, amountCents: Math.round((fundCents * pct) / 100) * 100 })),
        note: status === "active" ? "The fund grows with every league entry until the season ends." : null,
      },
    });
    const seasonAge = civilDiffDays(today, startsOn);
    standings.set(id, {
      entries: withPreviousRank(current, previous, status === "active" && seasonAge < 7),
      comparisonLabel: status === "active" ? (seasonAge < 7 ? "New season" : "Movement since last week") : "Movement in the final week",
    });
  }

  // Cash League — calendar months
  const sessions = buildSessions(players, civilAddMonths(civilMonthStart(today), -CL_MONTHS_BACK), today);
  for (let m = 0; m >= -CL_MONTHS_BACK; m--) {
    const startsOn = civilAddMonths(civilMonthStart(today), m);
    const endsOn = civilMonthEnd(startsOn);
    const status: Season["status"] = m === 0 ? "active" : "completed";
    const lastDay = status === "active" ? civilAddDays(today, -1) : endsOn;
    const prevLastDay = civilAddDays(lastDay, -7);
    const current = aggregateCashLeague(sessions, startsOn, lastDay);
    const previous = aggregateCashLeague(sessions, startsOn, prevLastDay);
    const id = `cl-${startsOn.slice(0, 7)}`;
    const total = CL_FUND.reduce((a, b) => a + b, 0);
    seasons.push({
      id,
      leagueId: "cash-league",
      name: formatMonthYear(clubLocalToInstant(startsOn, "12:00")),
      startsOn,
      endsOn,
      status,
      prizePool: {
        totalCents: total,
        places: CL_FUND.map((amountCents, i) => ({ position: i + 1, amountCents })),
        note: "Fixed monthly fund.",
      },
    });
    const age = civilDiffDays(today, startsOn);
    standings.set(id, {
      entries: withPreviousRank(current, previous, status === "active" && age < 8),
      comparisonLabel: status === "active" ? (age < 8 ? "New month" : "Movement since last week") : "Movement in the final week",
    });
  }

  return { today, dayStart, players, tournaments, results, leagues: LEAGUES, seasons, standings };
}

function seasonName(startsOn: CivilDate) {
  const month = Number(startsOn.slice(5, 7));
  const year = startsOn.slice(0, 4);
  const name = month === 12 || month <= 2 ? "Winter" : month <= 5 ? "Spring" : month <= 8 ? "Summer" : "Autumn";
  return `${name} ${year}`;
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

function buildResult(t: BaseTournament, players: MockPlayer[]): Omit<TournamentResult, "tournament"> {
  const r = rng(`result-${t.id}`);
  const entries = Math.max(8, Math.round(t.baseEntries * between(r, 0.78, 1.22)));
  const isRebuy = t.entryRules.type === "rebuy";
  const rebuys = isRebuy ? Math.round(entries * between(r, 0.6, 1.2)) : 0;
  const addOns = t.entryRules.addOn ? Math.round(entries * between(r, 0.55, 0.85)) : 0;
  const collected = entries * t.buyIn.entryCents + rebuys * t.buyIn.entryCents + addOns * (t.entryRules.addOn?.costCents ?? 0);
  const overlay = t.guaranteeCents != null && t.guaranteeCents > collected;
  const prizePoolCents = overlay ? t.guaranteeCents! : collected;

  const isSatellite = t.formats.includes("Satellite");
  const placesPaid = isSatellite
    ? Math.max(1, Math.floor(prizePoolCents / 22500)) + 1
    : Math.min(15, Math.max(3, Math.round(entries * 0.13)));

  const amounts = isSatellite ? satellitePayouts(prizePoolCents, placesPaid) : payoutLadder(prizePoolCents, placesPaid);

  const pool = players.filter((p) => (t.variant === "PLO" ? p.skill > 0.5 : true));
  const finishers = weightedSample(r, pool, (p) => Math.pow(p.skill, 1.5) * p.activity, placesPaid);
  const isLeague = t.leagueIds.includes("tournament-league");

  const payouts: Payout[] = finishers.map((p, i) => ({
    position: i + 1,
    player: { id: p.id, displayName: p.displayName },
    prizeCents: amounts[i] ?? 0,
    leaguePoints: isLeague ? Math.round((10 * Math.sqrt(entries)) / Math.sqrt(i + 1)) : 0,
  }));
  return { entries, rebuys, addOns, prizePoolCents, overlay, payouts };
}

/** Descending payouts, rounded to €5, remainder to first place. */
function payoutLadder(pool: number, places: number): number[] {
  const weights = Array.from({ length: places }, (_, i) => 1 / Math.pow(i + 1, 0.95) + (i === 0 ? 0.25 : 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  const out = weights.map((w) => Math.floor((pool * w) / sum / 500) * 500);
  out[0] += pool - out.reduce((a, b) => a + b, 0);
  for (let i = 1; i < out.length; i++) if (out[i] > out[i - 1]) out[i] = out[i - 1];
  out[0] += pool - out.reduce((a, b) => a + b, 0);
  return out;
}

function satellitePayouts(pool: number, places: number): number[] {
  const seats = places - 1;
  const out = Array.from({ length: seats }, () => 22500);
  out.push(pool - seats * 22500);
  return out;
}

/* ------------------------------------------------------------------ */
/* League aggregation                                                  */
/* ------------------------------------------------------------------ */

type Ranked = { player: { id: string; displayName: string }; values: Record<string, number> };

function aggregateTournamentLeague(results: Omit<TournamentResult, "tournament">[]): Ranked[] {
  const byPlayer = new Map<string, Ranked>();
  for (const res of results) {
    for (const p of res.payouts) {
      const row = byPlayer.get(p.player.id) ?? {
        player: p.player,
        values: { points: 0, cashes: 0, wins: 0, finalTables: 0, winningsCents: 0 },
      };
      row.values.points += p.leaguePoints;
      row.values.cashes += 1;
      row.values.wins += p.position === 1 ? 1 : 0;
      row.values.finalTables += p.position <= 3 ? 1 : 0;
      row.values.winningsCents += p.prizeCents;
      byPlayer.set(p.player.id, row);
    }
  }
  return [...byPlayer.values()].sort(
    (a, b) =>
      b.values.points - a.values.points ||
      b.values.wins - a.values.wins ||
      b.values.cashes - a.values.cashes ||
      a.player.displayName.localeCompare(b.player.displayName)
  );
}

function buildSessions(players: MockPlayer[], from: CivilDate, to: CivilDate): MockSession[] {
  const out: MockSession[] = [];
  const days = civilDiffDays(to, from);
  for (let d = 0; d < days; d++) {
    const day = civilAddDays(from, d);
    const r = rng(`sessions-${day}`);
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    const boost = weekday === 5 || weekday === 6 ? 1.35 : 1;
    for (const p of players) {
      if (!p.cashPlayer) continue;
      if (r() < p.activity * p.cashPlayer * 0.5 * boost) {
        out.push({ playerId: p.id, day, hours: Math.round(between(r, 1.5, 7.5) * 2) / 2 });
      }
    }
  }
  return out;
}

const playerCache = new Map<string, MockPlayer>();
function aggregateCashLeague(sessions: MockSession[], from: CivilDate, toInclusive: CivilDate): Ranked[] {
  if (!playerCache.size) for (const p of buildPlayers(rng("eglinton-players-v1"))) playerCache.set(p.id, p);
  const byPlayer = new Map<string, { hours: number; sessions: number }>();
  for (const s of sessions) {
    if (s.day < from || s.day > toInclusive) continue;
    const row = byPlayer.get(s.playerId) ?? { hours: 0, sessions: 0 };
    row.hours += s.hours;
    row.sessions += 1;
    byPlayer.set(s.playerId, row);
  }
  return [...byPlayer.entries()]
    .map(([id, v]) => {
      const p = playerCache.get(id)!;
      return {
        player: { id, displayName: p.displayName },
        values: { hours: v.hours, sessions: v.sessions, avgSession: Math.round((v.hours / v.sessions) * 10) / 10 },
      };
    })
    .sort(
      (a, b) =>
        b.values.hours - a.values.hours ||
        b.values.sessions - a.values.sessions ||
        a.player.displayName.localeCompare(b.player.displayName)
    );
}

function withPreviousRank(current: Ranked[], previous: Ranked[], suppress: boolean): StandingsEntry[] {
  const prev = new Map(previous.map((r, i) => [r.player.id, i + 1]));
  return current.map((r, i) => ({
    rank: i + 1,
    previousRank: suppress ? null : (prev.get(r.player.id) ?? null),
    player: r.player,
    values: r.values,
  }));
}

