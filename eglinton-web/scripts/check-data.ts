/**
 * Consistency checks for the demo dataset. Run with `npm run check:data`.
 * Also useful later as a smoke test against the real API provider
 * (set NEXT_PUBLIC_DATA_MODE=api and CASINO_API_URL).
 */
import { MockCasinoDataProvider } from "../src/data/mock/mock-provider";
import { ApiCasinoDataProvider } from "../src/data/api/api-provider";
import type { CasinoDataProvider } from "../src/data/provider";

let failures = 0;
const ok = (cond: unknown, msg: string) => {
  if (!cond) {
    failures++;
    console.error("  ✗", msg);
  }
};

async function check(p: CasinoDataProvider, now: Date) {
  console.log(`Checking provider "${p.name}" at ${now.toISOString()}`);

  const upcoming = await p.getUpcomingTournaments();
  ok(upcoming.length >= 20, `expected a full upcoming schedule, got ${upcoming.length}`);
  for (const t of upcoming) {
    ok(["scheduled", "registration-open", "late-registration"].includes(t.status), `${t.id} upcoming but status ${t.status}`);
    if (t.status === "scheduled" || t.status === "registration-open") ok(new Date(t.startsAt) > now, `${t.id} upcoming but starts in the past`);
  }
  ok(upcoming.every((t, i) => i === 0 || upcoming[i - 1].startsAt <= t.startsAt), "upcoming not sorted by start");

  for (const t of upcoming.slice(0, 10)) {
    const byId = await p.getTournamentById(t.id);
    ok(byId?.id === t.id, `detail link for ${t.id} does not resolve`);
    ok(await p.getTournamentStructure(t.structureId), `structure ${t.structureId} missing`);
  }

  const archive = await p.getArchivedResults({});
  ok(archive.length >= 50, `expected archive results, got ${archive.length}`);
  for (const r of archive) {
    ok(new Date(r.tournament.startsAt) < now, `${r.tournament.id} has results but is in the future`);
    ok(r.tournament.status === "completed", `${r.tournament.id} has results but status ${r.tournament.status}`);
    const paid = r.payouts.reduce((s, x) => s + x.prizeCents, 0);
    ok(paid === r.prizePoolCents, `${r.tournament.id} payouts ${paid} ≠ pool ${r.prizePoolCents}`);
    ok(r.payouts.every((x, i) => i === 0 || x.prizeCents <= r.payouts[i - 1].prizeCents), `${r.tournament.id} payouts not descending`);
    ok(r.payouts.every((x) => x.prizeCents % 100 === 0), `${r.tournament.id} has fractional euro payouts`);
    if (r.tournament.guaranteeCents) ok(r.prizePoolCents >= r.tournament.guaranteeCents, `${r.tournament.id} pool below guarantee`);
    ok(new Set(r.payouts.map((x) => x.player.id)).size === r.payouts.length, `${r.tournament.id} has duplicate finishers`);
  }

  const plo = await p.getArchivedResults({ variants: ["PLO"] });
  ok(plo.length > 0 && plo.every((r) => r.tournament.variant === "PLO"), "variant filter returns wrong subset");
  const search = await p.getArchivedResults({ search: "megastack" });
  ok(search.length > 0 && search.every((r) => r.tournament.name.toLowerCase().includes("megastack")), "archive search returns wrong subset");

  for (const league of await p.getLeagues()) {
    const seasons = await p.getSeasons(league.id);
    ok(seasons.length >= 2, `${league.id} needs multiple seasons`);
    ok(seasons.filter((s) => s.status === "active").length === 1, `${league.id} must have exactly one active season`);
    for (const s of seasons) {
      const st = await p.getLeagueStandings(league.id, s.id);
      ok(st, `${league.id}/${s.id} standings missing`);
      if (!st) continue;
      const primary = league.metrics[0].key;
      ok(st.entries.every((e, i) => e.rank === i + 1), `${s.id} ranks not sequential`);
      ok(
        st.entries.every((e, i) => i === 0 || st.entries[i - 1].values[primary] >= e.values[primary]),
        `${s.id} not sorted by ${primary}`
      );
      if (s.status === "active" && league.kind === "tournament") ok(st.entries.length >= 30, `${s.id} has only ${st.entries.length} entries (need ≥ 30)`);
      if (s.prizePool) {
        const sum = s.prizePool.places.reduce((a, b) => a + b.amountCents, 0);
        ok(sum <= s.prizePool.totalCents + 100 * s.prizePool.places.length, `${s.id} prize split exceeds pool`);
      }
    }
  }
}

async function main() {
  const now = new Date();
  const provider: CasinoDataProvider =
    process.env.NEXT_PUBLIC_DATA_MODE === "api" ? new ApiCasinoDataProvider() : new MockCasinoDataProvider(() => now);
  await check(provider, now);
  if (provider.name === "mock") {
    // Re-run at several points in the week/year to catch date-boundary bugs.
    for (const offsetDays of [3, 17, 45, 120, 200]) {
      const t = new Date(now.getTime() + offsetDays * 86_400_000 + 13 * 3_600_000);
      await check(new MockCasinoDataProvider(() => t), t);
    }
  }
  if (failures) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
  }
  console.log("\nAll data checks passed.");
}

main();
