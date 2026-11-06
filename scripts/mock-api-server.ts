/**
 * A local stand-in for the club's future API, serving the mock dataset over
 * HTTP at the endpoint paths ApiCasinoDataProvider expects.
 *
 *   npm run mock:api            # serves http://localhost:4010
 *   NEXT_PUBLIC_DATA_MODE=api CASINO_API_URL=http://localhost:4010 npm run dev
 *
 * Use it to test the API path end to end, and as a reference for the
 * response shapes the real backend must return (see DATA_INTEGRATION.md).
 */
import { createServer } from "node:http";
import { MockCasinoDataProvider } from "../src/data/mock/mock-provider";

const p = new MockCasinoDataProvider();
const PORT = Number(process.env.PORT ?? 4010);

const routes: [RegExp, (m: RegExpMatchArray, q: URLSearchParams) => Promise<unknown>][] = [
  [/^\/tournaments\/upcoming$/, (_m, q) => p.getUpcomingTournaments({ limit: Number(q.get("limit")) || undefined })],
  [/^\/tournaments\/([^/]+)\/result$/, (m) => p.getTournamentResult(decodeURIComponent(m[1]))],
  [/^\/tournaments\/([^/]+)$/, (m) => p.getTournamentById(decodeURIComponent(m[1]))],
  [
    /^\/tournaments$/,
    (_m, q) =>
      p.getTournamentSchedule({
        from: q.get("from") ?? undefined,
        to: q.get("to") ?? undefined,
        variants: q.getAll("variant") as never,
        formats: q.getAll("format") as never,
        statuses: q.getAll("status") as never,
        search: q.get("q") ?? undefined,
      }),
  ],
  [/^\/structures\/([^/]+)$/, (m) => p.getTournamentStructure(decodeURIComponent(m[1]))],
  [/^\/leagues$/, () => p.getLeagues()],
  [/^\/leagues\/([^/]+)\/seasons\/([^/]+)\/standings$/, (m) => p.getLeagueStandings(decodeURIComponent(m[1]), decodeURIComponent(m[2]))],
  [/^\/leagues\/([^/]+)\/seasons$/, (m) => p.getSeasons(decodeURIComponent(m[1]))],
  [/^\/leagues\/([^/]+)$/, (m) => p.getLeague(decodeURIComponent(m[1]))],
  [
    /^\/results$/,
    (_m, q) =>
      p.getArchivedResults({
        from: q.get("from") ?? undefined,
        to: q.get("to") ?? undefined,
        variants: q.getAll("variant") as never,
        search: q.get("q") ?? undefined,
        limit: Number(q.get("limit")) || undefined,
      }),
  ],
];

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  for (const [re, handler] of routes) {
    const m = url.pathname.match(re);
    if (!m) continue;
    const body = await handler(m, url.searchParams);
    res.writeHead(body == null ? 404 : 200, { "content-type": "application/json" });
    res.end(JSON.stringify(body ?? { error: "Not found" }));
    return;
  }
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "Unknown endpoint" }));
}).listen(PORT, () => console.log(`Mock casino API on http://localhost:${PORT}`));
