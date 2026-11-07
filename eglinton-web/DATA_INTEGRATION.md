# Data integration guide

How the site gets its data, and how to replace the demonstration data with The Eglinton's real tournaments, results and league standings.

**Summary:** pages never touch a data source. They call `src/data/queries.ts`, which calls whichever `CasinoDataProvider` is active. Connecting real data means pointing `ApiCasinoDataProvider` at an API (and adjusting field mappings if needed) — no page or component changes.

```
Page (server component)
  └─ src/data/queries.ts          request-time access, dedupe, Result<T> for error states
       └─ getDataProvider()       src/data/index.ts — switch on NEXT_PUBLIC_DATA_MODE
            ├─ MockCasinoDataProvider   src/data/mock/   (default)
            └─ ApiCasinoDataProvider    src/data/api/    fetch → map → validate (Zod)
```

Editorial content (hero text, featured events, club facts, FAQs, support services) is separate: see [Editorial content](#editorial-content).

---

## 1. Where the mock data lives

| File | Contents |
| --- | --- |
| `src/data/mock/fixtures.ts` | Weekly event templates, festival series, satellites, a demo cancellation, fictional player names |
| `src/data/mock/structures.ts` | Blind structures |
| `src/data/mock/generate.ts` | Builds ~37 weeks of tournaments **relative to today**, results, league seasons and standings |
| `src/data/mock/mock-provider.ts` | Implements the provider interface over the generated dataset; derives statuses from the clock |

Demo data is deterministic for a given day and regenerates daily, so the demo never shows stale dates. Recurring event names marked `nameOnCurrentSite` (Monday MegaStack, Tuesday Rebuy, Friday MegaStack, Saturday Omaha Treble Chance, Sunday Rebuy Turbo) appear on the club's current website; every other detail is invented. All players are fictional.

## 2. Data models

Defined once as Zod schemas in `src/domain/schemas.ts`; TypeScript types are inferred from them.

| Model | Purpose | Notes |
| --- | --- | --- |
| `Tournament` | A scheduled event | `startsAt` ISO instant; `buyIn` in cents; `entryRules`; `status`; `seriesId` links to editorial featured events; `leagueIds` |
| `TournamentStructure` | Blind levels and breaks | Referenced by `Tournament.structureId` |
| `TournamentResult` | Published result | `entries`, `rebuys`, `addOns`, `prizePoolCents`, `overlay`, `payouts[]` |
| `Payout` | One finishing position | `player`, `prizeCents`, `leaguePoints` |
| `Player` | Public identity | `id`, `displayName` only — no personal data |
| `League` | Tournament League / Cash League | `kind`, `rankingRule`, `rules[]`, `metrics[]` (columns, first = primary ranking metric) |
| `Season` | A league period | `startsOn`/`endsOn` calendar dates, `status`, optional `prizePool` |
| `Standings` | A league table for one season | `entries[]` with `rank`, `previousRank`, `values` keyed by metric |

The two leagues deliberately do **not** share rules: the Tournament League ranks by points from results; the Cash League ranks by hours played. Standings are generic (`values` keyed by `League.metrics`), so a league with different columns needs no UI changes — the table, podium, mobile list and sorting all read the metric definitions.

### Conventions

- **Instants**: ISO 8601 with offset, stored in UTC (`2026-11-09T19:30:00.000Z`). Displayed in `Europe/Dublin` via `src/domain/format.ts`.
- **Calendar dates** (season boundaries): `YYYY-MM-DD`, interpreted in `Europe/Dublin`.
- **Money**: integer euro cents. `€55` → `5500`. Format only with `formatEuro()`.
- **Status**: `scheduled | registration-open | late-registration | in-progress | completed | cancelled`. In mock mode it is derived from the clock; a real API should return it (it knows about cancellations, delays and closures).

## 3. The provider interface

`src/data/provider.ts`:

```ts
interface CasinoDataProvider {
  readonly name: string;
  readonly isDemo: boolean;           // true → "Design proposal" notices + noindex
  getUpcomingTournaments(options?: { limit?: number }): Promise<Tournament[]>;
  getTournamentById(id: string): Promise<Tournament | null>;
  getTournamentSchedule(filters: ScheduleFilters): Promise<Tournament[]>;
  getTournamentStructure(structureId: string): Promise<TournamentStructure | null>;
  getTournamentResult(tournamentId: string): Promise<TournamentResult | null>;
  getLeagues(): Promise<League[]>;
  getLeague(leagueId: string): Promise<League | null>;
  getSeasons(leagueId: string): Promise<Season[]>;              // most recent first
  getLeagueStandings(leagueId: string, seasonId: string): Promise<Standings | null>;
  getArchivedResults(filters: ArchiveFilters): Promise<TournamentResult[]>; // most recent first
}
```

Ordering contracts: schedules ascending by `startsAt`; seasons and archive descending; standings ascending by `rank`.

## 4. Connecting a real API

### Proposed endpoints

`ApiCasinoDataProvider` (`src/data/api/api-provider.ts`) expects these GET endpoints. They are a **proposal** — agree them with whoever builds or owns the club's system, then adjust paths in one file if they differ. `npm run mock:api` serves exactly this contract and is the reference implementation.

| Endpoint | Returns | Query params |
| --- | --- | --- |
| `/tournaments/upcoming` | `Tournament[]` | `limit` |
| `/tournaments` | `Tournament[]` | `from`, `to` (ISO), `variant`*, `format`*, `status`*, `q` |
| `/tournaments/{id}` | `Tournament` or 404 | |
| `/tournaments/{id}/result` | `TournamentResult` or 404 | |
| `/structures/{id}` | `TournamentStructure` or 404 | |
| `/leagues` | `League[]` | |
| `/leagues/{id}` | `League` or 404 | |
| `/leagues/{id}/seasons` | `Season[]` | |
| `/leagues/{id}/seasons/{seasonId}/standings` | `Standings` or 404 | |
| `/results` | `TournamentResult[]` | `from`, `to`, `variant`*, `q`, `limit` |

\* repeatable.

### Steps

1. Set environment variables (see below) with `NEXT_PUBLIC_DATA_MODE=api`.
2. Compare a real response with the domain schema. If field names or units differ, edit **only** `src/data/api/mappers.ts` (examples are in the file: snake_case, euros as decimals, date strings).
3. Run `NEXT_PUBLIC_DATA_MODE=api CASINO_API_URL=… npm run check:data` — the same consistency checks used for the mock data run against the live API.
4. Run the site and review every route; error states render automatically if the API fails.
5. Rebuild — `NEXT_PUBLIC_*` values are inlined at build time.

If the club's data lives in a spreadsheet or a tournament-clock export rather than an API, write a small service (or a Next.js route handler) that exposes the endpoints above, or implement `CasinoDataProvider` directly over that source and add it to the switch in `src/data/index.ts`.

## 5. Authentication

- The provider sends `Authorization: Bearer ${CASINO_API_KEY}` when the key is set.
- All provider code runs on the server (`import "server-only"`), so keys never reach the browser. Do **not** prefix secrets with `NEXT_PUBLIC_`.
- For other schemes (API key header, OAuth client credentials, signed requests) change only `ApiCasinoDataProvider.get()`.

## 6. Mapping external fields

`mappers.ts` converts raw JSON into domain-shaped objects before validation. Keep mappers pure and forgiving (convert, don't validate). Helpers provided:

- `eurosToCents("€12.50")` → `1250`
- `toIsoInstant("2026-11-09 19:30")` → ISO instant

Player names: the site shows `displayName` exactly as supplied. Agree with the club how names are published (e.g. first name + initial) and how a player can opt out — see the privacy checklist on `/privacy`.

## 7. Validation and errors

- Every record is validated with the domain Zod schema at the boundary.
- Lists: invalid rows are **skipped and logged** with the exact issues (`parseList`). Change to throw if partial data is unacceptable.
- Single records: invalid → `DataError("VALIDATION")`.
- Network failures, timeouts, non-2xx → `DataError("NETWORK" | "HTTP")`; missing config → `DataError("NOT_CONFIGURED")`.
- `queries.ts` turns `DataError` into `{ ok: false }` and pages render a designed error state (with the club's phone number). Anything else is a bug and reaches the route error boundary.

Verified in this build: with the API unreachable, home, schedule and leaderboard render their error states instead of crashing.

## 8. Caching

Pages render at request time. In API mode, responses are cached by Next.js for `CASINO_API_REVALIDATE_SECONDS` (default 60). Use a lower value during live tournament nights if standings or statuses update frequently.

## 9. Testing the integration

```bash
npm run mock:api                                                     # reference API on :4010
NEXT_PUBLIC_DATA_MODE=api CASINO_API_URL=http://localhost:4010 npm run check:data
NEXT_PUBLIC_DATA_MODE=api CASINO_API_URL=http://localhost:4010 npm run dev
```

`check:data` verifies: upcoming events are in the future with valid statuses, detail links resolve, structures exist, results are in the past and marked completed, payouts sum to the prize pool and descend, guarantees are honoured, filters return correct subsets, each league has one active season, standings follow their declared ranking rule.

## 10. Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_DATA_MODE` | build | `mock` (default) or `api` |
| `NEXT_PUBLIC_SITE_URL` | build | Canonical base URL |
| `CASINO_API_URL` | server | API base URL |
| `CASINO_API_KEY` | server | Optional bearer token |
| `CASINO_API_REVALIDATE_SECONDS` | server | Response cache lifetime |
| `CASINO_API_TIMEOUT_MS` | server | Request timeout |
| `MOCK_LATENCY_MS` | server | Dev only: simulate latency in mock mode |

## 11. Information still needed from the club

- Where tournament, results and league data are kept today (software, spreadsheet, manual) and who maintains it.
- The real weekly schedule: times, buy-in/fee split, stacks, structures, late registration, re-entry/rebuy/add-on rules, guarantees.
- Tournament League and Cash League rules: scoring, season lengths, prize funds, tie-breaks.
- How results and player names may be published, and the opt-out process.
- How registration works on the night (in person only? phone reservations?).
- Opening hours, minimum age policy, dress code, parking guidance.
- The original logo files and brand colours (see HANDOVER.md).

## Editorial content

Separate from competitive data by design (`src/content/`):

- `types.ts` — content model, with a `verification` flag on facts (`confirmed`, `to-confirm`, `demo`) that drives the visible "To confirm"/"Demo" markers.
- `site.ts` — current content, with sources noted.
- `provider.ts` — `ContentProvider` interface. A CMS (Sanity, Payload, Contentful, a custom admin) plugs in by implementing `getSiteContent()`; nothing else changes.

Featured events link to tournaments through `Tournament.seriesId` — marketing copy lives in content, event facts live in the data source.
