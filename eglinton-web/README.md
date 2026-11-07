# The Eglinton Casino & Card Club — website proposal

A working, multi-page redesign of [theeglinton.com](https://theeglinton.com) for The Eglinton Casino & Card Club, Eglinton Street, Galway. It runs on demonstration data today and is built to switch to the club's real tournament and league data without changes to any page.

> **Demonstration build.** Schedules, players, standings and results are generated sample data. The logo and venue photography are placeholders awaiting the club's originals. See [HANDOVER.md](./HANDOVER.md).

## Requirements

- Node.js 20.9 or newer (developed on Node 22)
- npm 10+

## Install and run

```bash
npm install
cp .env.example .env.local     # optional — defaults to mock data
npm run dev                    # http://localhost:3000
```

## Production build

```bash
npm run build
npm run start                  # http://localhost:3000
```

## Other commands

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript in strict mode, no emit |
| `npm run check:data` | Consistency checks on the active data source (sorting, payouts, dates, links, filters) |
| `npm run mock:api` | Serves the demo data over HTTP on :4010, in the shape the real API must use |

Try the API path end to end:

```bash
npm run mock:api
NEXT_PUBLIC_DATA_MODE=api CASINO_API_URL=http://localhost:4010 npm run dev
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/schedule` | Tournament schedule — list and calendar views, week/day navigation, game and format filters, search (`?view=calendar`, `?series=winter-series`, `?game=PLO`, `?format=Rebuy`, `?q=`) |
| `/tournaments/[id]` | Tournament detail — key facts, blind structure, results when completed, related events, add to calendar |
| `/leaderboard` | Leaderboard — podium, sortable/searchable standings, league and season selectors, pagination |
| `/leagues/tournament`, `/leagues/cash` | League pages — standings, league fund, rules |
| `/archive` | Seasons and past results, filterable by period, game and player |
| `/club` | About the club |
| `/visit` | Address, contact, map (loads on request), membership, FAQ, email composer |
| `/responsible-gaming`, `/privacy`, `/cookies` | Policy entry points, flagged for review |

## Project map

```
src/
  app/                 Routes (App Router). Pages read data only via src/data/queries.ts
  components/          UI: layout, home sections, tournaments, leagues, archive, visit, ui primitives
  content/             Editorial content (hero, featured events, club facts, FAQs) + content provider
  data/
    provider.ts        CasinoDataProvider interface — the contract with any data source
    index.ts           Provider switch (NEXT_PUBLIC_DATA_MODE)
    queries.ts         Server-side data access used by pages
    mock/              MockCasinoDataProvider + demo data generator
    api/               ApiCasinoDataProvider scaffold + field mappers
  domain/              Zod schemas (types), formatting, calendar helpers
  lib/                 Motion tokens, navigation, utilities
scripts/               check-data.ts, mock-api-server.ts
```

Further reading:

- [DATA_INTEGRATION.md](./DATA_INTEGRATION.md) — connecting the real data source
- [DESIGN.md](./DESIGN.md) — site audit, design direction, tokens and motion
- [HANDOVER.md](./HANDOVER.md) — what's done, what's demo, what's needed before launch
