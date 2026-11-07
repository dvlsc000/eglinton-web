/**
 * Domain models for The Eglinton website.
 *
 * Every record that crosses the data boundary (mock or API) is validated with
 * these Zod schemas. Types are inferred from the schemas so there is exactly
 * one source of truth.
 *
 * Conventions
 * - Instants are ISO 8601 strings in UTC, e.g. "2026-11-09T19:30:00.000Z".
 *   They are displayed in the club's time zone (Europe/Dublin).
 * - Calendar dates without a time (season boundaries) are "YYYY-MM-DD",
 *   interpreted in Europe/Dublin.
 * - Money is an integer number of euro cents (minor units). €55 = 5500.
 */
import { z } from "zod";

const isoInstant = z.iso.datetime({ offset: true });
const isoDate = z.iso.date();
const cents = z.number().int().nonnegative();

/* ------------------------------------------------------------------ */
/* Tournaments                                                         */
/* ------------------------------------------------------------------ */

export const PokerVariant = z.enum(["NLHE", "PLO"]);
export type PokerVariant = z.infer<typeof PokerVariant>;

export const TournamentFormat = z.enum([
  "Deepstack",
  "Freezeout",
  "Re-entry",
  "Rebuy",
  "Turbo",
  "Bounty",
  "Satellite",
  "Multi-entry",
  "Festival",
]);
export type TournamentFormat = z.infer<typeof TournamentFormat>;

export const TournamentStatus = z.enum([
  "scheduled",
  "registration-open",
  "late-registration",
  "in-progress",
  "completed",
  "cancelled",
]);
export type TournamentStatus = z.infer<typeof TournamentStatus>;

export const BuyIn = z.object({
  /** Portion that goes to the prize pool. */
  entryCents: cents,
  /** House fee / rake. */
  feeCents: cents,
  /** Bounty component, if any (paid out per knockout, not in prize pool). */
  bountyCents: cents.default(0),
});
export type BuyIn = z.infer<typeof BuyIn>;

export const EntryRules = z.object({
  type: z.enum(["freezeout", "re-entry", "rebuy"]),
  /** Total entries allowed per player (null = unlimited). */
  maxEntries: z.number().int().positive().nullable(),
  /** Re-entry / rebuy available until the end of this level (null = n/a). */
  untilLevel: z.number().int().positive().nullable(),
  addOn: z
    .object({ costCents: cents, chips: z.number().int().positive() })
    .nullable(),
});
export type EntryRules = z.infer<typeof EntryRules>;

export const Tournament = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Links the tournament to an editorial featured event (festival, series). */
  seriesId: z.string().nullable(),
  startsAt: isoInstant,
  variant: PokerVariant,
  formats: z.array(TournamentFormat),
  buyIn: BuyIn,
  startingStack: z.number().int().positive(),
  guaranteeCents: cents.nullable(),
  entryRules: EntryRules,
  structureId: z.string(),
  /** Late registration closes at the end of this level. */
  lateRegLevel: z.number().int().positive(),
  status: TournamentStatus,
  statusNote: z.string().nullable(),
  leagueIds: z.array(z.string()),
  description: z.string().nullable(),
});
export type Tournament = z.infer<typeof Tournament>;

export const BlindLevel = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("level"),
    level: z.number().int().positive(),
    smallBlind: z.number().int().nonnegative(),
    bigBlind: z.number().int().positive(),
    ante: z.number().int().nonnegative(),
    minutes: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("break"),
    minutes: z.number().int().positive(),
    label: z.string(),
  }),
]);
export type BlindLevel = z.infer<typeof BlindLevel>;

export const TournamentStructure = z.object({
  id: z.string(),
  name: z.string(),
  levelMinutes: z.number().int().positive(),
  levels: z.array(BlindLevel).min(1),
});
export type TournamentStructure = z.infer<typeof TournamentStructure>;

/* ------------------------------------------------------------------ */
/* Players, results                                                    */
/* ------------------------------------------------------------------ */

export const Player = z.object({
  id: z.string(),
  /** Public display name as the club publishes it (e.g. "Aoife M."). */
  displayName: z.string(),
});
export type Player = z.infer<typeof Player>;

export const Payout = z.object({
  position: z.number().int().positive(),
  player: Player,
  prizeCents: cents,
  /** Tournament League points earned (0 if the event is not a league event). */
  leaguePoints: z.number().int().nonnegative(),
});
export type Payout = z.infer<typeof Payout>;

export const TournamentResult = z.object({
  tournament: Tournament,
  entries: z.number().int().nonnegative(),
  rebuys: z.number().int().nonnegative(),
  addOns: z.number().int().nonnegative(),
  prizePoolCents: cents,
  /** True when the guarantee exceeded collected entries (an overlay). */
  overlay: z.boolean(),
  payouts: z.array(Payout),
});
export type TournamentResult = z.infer<typeof TournamentResult>;

/* ------------------------------------------------------------------ */
/* Leagues                                                             */
/* ------------------------------------------------------------------ */

export const MetricFormat = z.enum(["integer", "points", "hours", "euro"]);
export type MetricFormat = z.infer<typeof MetricFormat>;

export const LeagueMetric = z.object({
  key: z.string(),
  label: z.string(),
  shortLabel: z.string(),
  format: MetricFormat,
  description: z.string().optional(),
});
export type LeagueMetric = z.infer<typeof LeagueMetric>;

export const League = z.object({
  id: z.string(),
  kind: z.enum(["cash", "tournament"]),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  /** How standings are ordered — shown to players verbatim. */
  rankingRule: z.string(),
  rules: z.array(z.string()),
  /** Ordered metric columns; the first is the primary ranking metric. */
  metrics: z.array(LeagueMetric).min(1),
});
export type League = z.infer<typeof League>;

export const PrizePool = z.object({
  totalCents: cents,
  places: z.array(z.object({ position: z.number().int().positive(), amountCents: cents })),
  note: z.string().nullable(),
});
export type PrizePool = z.infer<typeof PrizePool>;

export const Season = z.object({
  id: z.string(),
  leagueId: z.string(),
  name: z.string(),
  startsOn: isoDate,
  endsOn: isoDate,
  status: z.enum(["upcoming", "active", "completed"]),
  prizePool: PrizePool.nullable(),
});
export type Season = z.infer<typeof Season>;

export const StandingsEntry = z.object({
  rank: z.number().int().positive(),
  /** Rank at the previous snapshot (null = new entry this period). */
  previousRank: z.number().int().positive().nullable(),
  player: Player,
  /** Values keyed by League.metrics[].key. */
  values: z.record(z.string(), z.number()),
});
export type StandingsEntry = z.infer<typeof StandingsEntry>;

export const Standings = z.object({
  league: League,
  season: Season,
  /** When this snapshot was produced (ISO instant). */
  updatedAt: isoInstant,
  /** Label for the comparison used in previousRank, e.g. "since last week". */
  comparisonLabel: z.string(),
  entries: z.array(StandingsEntry),
});
export type Standings = z.infer<typeof Standings>;

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

export type ScheduleFilters = {
  /** Inclusive lower bound (ISO instant). */
  from?: string;
  /** Exclusive upper bound (ISO instant). */
  to?: string;
  variants?: PokerVariant[];
  formats?: TournamentFormat[];
  statuses?: TournamentStatus[];
  search?: string;
};

export type ArchiveFilters = {
  from?: string;
  to?: string;
  variants?: PokerVariant[];
  /** Matches tournament name or a player's display name. */
  search?: string;
  limit?: number;
};

export { isoDate, isoInstant };
