/**
 * Field mapping between the backend's JSON and the domain model.
 *
 * These are identity mappings today because the proposed API contract uses
 * the domain field names. When the real backend arrives with different names
 * (e.g. `start_time`, `buyin_eur`), adapt ONLY these functions. Keep them
 * pure and forgiving: convert, don't validate — validation happens next, with
 * the domain Zod schemas.
 *
 * Example adaptation for a backend that sends euros as decimals and snake_case:
 *
 *   export function mapTournament(raw: any) {
 *     return {
 *       id: String(raw.tournament_id),
 *       name: raw.title,
 *       startsAt: new Date(raw.start_time).toISOString(),
 *       buyIn: {
 *         entryCents: eurosToCents(raw.buyin_eur),
 *         feeCents: eurosToCents(raw.fee_eur),
 *         bountyCents: eurosToCents(raw.bounty_eur ?? 0),
 *       },
 *       ...
 *     };
 *   }
 */

type Raw = Record<string, unknown>;
const obj = (r: unknown): Raw => (r && typeof r === "object" ? (r as Raw) : {});

/** €12.50 → 1250. Avoids floating-point drift. */
export function eurosToCents(value: unknown): number {
  const n = typeof value === "string" ? Number(value.replace(/[^\d.-]/g, "")) : Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

/** Normalise any parseable date to an ISO instant. */
export function toIsoInstant(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function mapTournament(raw: unknown) {
  const r = obj(raw);
  return {
    ...r,
    startsAt: toIsoInstant(r.startsAt) ?? r.startsAt,
    seriesId: r.seriesId ?? null,
    guaranteeCents: r.guaranteeCents ?? null,
    statusNote: r.statusNote ?? null,
    description: r.description ?? null,
    leagueIds: r.leagueIds ?? [],
  };
}

export const mapStructure = (raw: unknown) => obj(raw);
export const mapLeague = (raw: unknown) => obj(raw);
export const mapSeason = (raw: unknown) => ({ prizePool: null, ...obj(raw) });

export function mapStandings(raw: unknown) {
  const r = obj(raw);
  return {
    ...r,
    updatedAt: toIsoInstant(r.updatedAt) ?? r.updatedAt,
    comparisonLabel: r.comparisonLabel ?? "Movement since last update",
  };
}

export function mapTournamentResult(raw: unknown) {
  const r = obj(raw);
  return { ...r, tournament: mapTournament(r.tournament), overlay: r.overlay ?? false };
}
