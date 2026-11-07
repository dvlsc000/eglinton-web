/**
 * The contract between the website and any source of competitive data.
 *
 * Pages never talk to a data source directly. They call the query functions
 * in src/data/queries.ts, which call the active CasinoDataProvider. Swapping
 * the mock for a real backend means implementing this interface — nothing in
 * src/app or src/components changes.
 *
 * Every method returns validated domain objects (see src/domain/schemas.ts).
 */
import type {
  ArchiveFilters,
  League,
  ScheduleFilters,
  Season,
  Standings,
  Tournament,
  TournamentResult,
  TournamentStructure,
} from "@/domain/schemas";

export interface CasinoDataProvider {
  /** Human-readable name, shown in diagnostics only. */
  readonly name: string;
  /** True when the data is sample data and must be labelled as such. */
  readonly isDemo: boolean;

  /** Next tournaments that have not finished, soonest first. */
  getUpcomingTournaments(options?: { limit?: number }): Promise<Tournament[]>;
  getTournamentById(id: string): Promise<Tournament | null>;
  /** Tournaments within a window, soonest first. */
  getTournamentSchedule(filters: ScheduleFilters): Promise<Tournament[]>;
  getTournamentStructure(structureId: string): Promise<TournamentStructure | null>;
  /** Published result for a completed tournament (null if not yet published). */
  getTournamentResult(tournamentId: string): Promise<TournamentResult | null>;

  getLeagues(): Promise<League[]>;
  getLeague(leagueId: string): Promise<League | null>;
  /** Seasons for a league, most recent first. */
  getSeasons(leagueId: string): Promise<Season[]>;
  getLeagueStandings(leagueId: string, seasonId: string): Promise<Standings | null>;

  /** Completed tournaments with results, most recent first. */
  getArchivedResults(filters: ArchiveFilters): Promise<TournamentResult[]>;
}
