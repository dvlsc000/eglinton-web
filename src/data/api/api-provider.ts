/**
 * ApiCasinoDataProvider — SCAFFOLD.
 *
 * Ready to connect to the club's real backend once endpoints exist. Nothing
 * here talks to a live service yet: the endpoint paths below are a proposed
 * contract (see DATA_INTEGRATION.md) and must be confirmed with whoever
 * builds or owns the club's system.
 *
 * Responsibilities:
 *  1. Build requests (base URL, auth header, timeout).
 *  2. Map the backend's field names to domain fields (./mappers.ts).
 *  3. Validate every record with the domain Zod schemas.
 *  4. Throw DataError for every failure so pages can render error states.
 */
import { z } from "zod";
import type { CasinoDataProvider } from "../provider";
import { DataError } from "../errors";
import {
  League,
  Season,
  Standings,
  Tournament,
  TournamentResult,
  TournamentStructure,
  type ArchiveFilters,
  type ScheduleFilters,
} from "@/domain/schemas";
import { mapLeague, mapSeason, mapStandings, mapStructure, mapTournament, mapTournamentResult } from "./mappers";

type ApiConfig = {
  baseUrl: string;
  apiKey?: string;
  /** Seconds that responses may be cached by Next.js (0 = always fresh). */
  revalidateSeconds: number;
  timeoutMs: number;
};

export function readApiConfig(): ApiConfig {
  const baseUrl = process.env.CASINO_API_URL;
  if (!baseUrl) {
    throw new DataError("NOT_CONFIGURED", "NEXT_PUBLIC_DATA_MODE is 'api' but CASINO_API_URL is not set.");
  }
  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey: process.env.CASINO_API_KEY || undefined,
    revalidateSeconds: Number(process.env.CASINO_API_REVALIDATE_SECONDS ?? 60),
    timeoutMs: Number(process.env.CASINO_API_TIMEOUT_MS ?? 8000),
  };
}

export class ApiCasinoDataProvider implements CasinoDataProvider {
  readonly name = "api";
  readonly isDemo = false;

  private cfg: ApiConfig | null;

  /** Config is read lazily so a missing URL surfaces as a DataError on first use (rendered as an error state), not a crash. */
  constructor(config?: ApiConfig) {
    this.cfg = config ?? null;
  }

  private get config(): ApiConfig {
    return (this.cfg ??= readApiConfig());
  }

  /** GET + JSON + error normalisation. Returns `null` on 404. */
  private async get(path: string, params?: Record<string, string | string[] | number | undefined>): Promise<unknown | null> {
    const url = new URL(this.config.baseUrl + path);
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v === undefined || v === "") continue;
      if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x));
      else url.searchParams.set(k, String(v));
    }
    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
        signal: AbortSignal.timeout(this.config.timeoutMs),
        next: { revalidate: this.config.revalidateSeconds },
      });
    } catch (cause) {
      throw new DataError("NETWORK", `Request to ${url.pathname} failed`, { cause });
    }
    if (res.status === 404) return null;
    if (!res.ok) throw new DataError("HTTP", `${url.pathname} responded ${res.status}`, { status: res.status });
    try {
      return await res.json();
    } catch (cause) {
      throw new DataError("VALIDATION", `${url.pathname} did not return JSON`, { cause });
    }
  }

  /** Map + validate a list, collecting every invalid record before failing. */
  private parseList<T>(raw: unknown, map: (r: unknown) => unknown, schema: z.ZodType<T>, what: string): T[] {
    if (!Array.isArray(raw)) throw new DataError("VALIDATION", `${what}: expected an array`);
    const out: T[] = [];
    const problems: unknown[] = [];
    raw.forEach((item, index) => {
      const parsed = schema.safeParse(map(item));
      if (parsed.success) out.push(parsed.data);
      else problems.push({ index, issues: z.treeifyError(parsed.error) });
    });
    if (problems.length) {
      // Policy: skip bad rows but report them. Change to `throw` if partial data is unacceptable.
      console.warn(`[api] ${what}: ${problems.length} invalid record(s) skipped`, problems);
    }
    return out;
  }

  private parseOne<T>(raw: unknown, map: (r: unknown) => unknown, schema: z.ZodType<T>, what: string): T {
    const parsed = schema.safeParse(map(raw));
    if (!parsed.success) throw new DataError("VALIDATION", `${what}: invalid record`, { details: z.treeifyError(parsed.error) });
    return parsed.data;
  }

  async getUpcomingTournaments(options?: { limit?: number }) {
    const raw = await this.get("/tournaments/upcoming", { limit: options?.limit });
    return this.parseList(raw ?? [], mapTournament, Tournament, "upcoming tournaments");
  }

  async getTournamentById(id: string) {
    const raw = await this.get(`/tournaments/${encodeURIComponent(id)}`);
    return raw ? this.parseOne(raw, mapTournament, Tournament, `tournament ${id}`) : null;
  }

  async getTournamentSchedule(f: ScheduleFilters) {
    const raw = await this.get("/tournaments", {
      from: f.from,
      to: f.to,
      variant: f.variants,
      format: f.formats,
      status: f.statuses,
      q: f.search,
    });
    return this.parseList(raw ?? [], mapTournament, Tournament, "schedule");
  }

  async getTournamentStructure(structureId: string) {
    const raw = await this.get(`/structures/${encodeURIComponent(structureId)}`);
    return raw ? this.parseOne(raw, mapStructure, TournamentStructure, `structure ${structureId}`) : null;
  }

  async getTournamentResult(tournamentId: string) {
    const raw = await this.get(`/tournaments/${encodeURIComponent(tournamentId)}/result`);
    return raw ? this.parseOne(raw, mapTournamentResult, TournamentResult, `result ${tournamentId}`) : null;
  }

  async getLeagues() {
    const raw = await this.get("/leagues");
    return this.parseList(raw ?? [], mapLeague, League, "leagues");
  }

  async getLeague(leagueId: string) {
    const raw = await this.get(`/leagues/${encodeURIComponent(leagueId)}`);
    return raw ? this.parseOne(raw, mapLeague, League, `league ${leagueId}`) : null;
  }

  async getSeasons(leagueId: string) {
    const raw = await this.get(`/leagues/${encodeURIComponent(leagueId)}/seasons`);
    return this.parseList(raw ?? [], mapSeason, Season, "seasons");
  }

  async getLeagueStandings(leagueId: string, seasonId: string) {
    const raw = await this.get(`/leagues/${encodeURIComponent(leagueId)}/seasons/${encodeURIComponent(seasonId)}/standings`);
    return raw ? this.parseOne(raw, mapStandings, Standings, `standings ${seasonId}`) : null;
  }

  async getArchivedResults(f: ArchiveFilters) {
    const raw = await this.get("/results", { from: f.from, to: f.to, variant: f.variants, q: f.search, limit: f.limit });
    return this.parseList(raw ?? [], mapTournamentResult, TournamentResult, "archive");
  }
}
