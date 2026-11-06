import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getArchive, getSeasonSummaries, isDemoData } from "@/data/queries";
import { PageHeader } from "@/components/layout/page-header";
import { InviteBand } from "@/components/layout/invite-band";
import { getContent } from "@/content/provider";
import { ArchiveFilters } from "@/components/archive/archive-filters";
import { ButtonLink, DemoTag, EmptyState, ErrorState, Eyebrow } from "@/components/ui/primitives";
import { clubDayStart, civilAddDays, clubToday } from "@/domain/civil";
import { formatCalendarDate, formatEuro, formatMonthYear, formatWeekdayShort, formatDayMonth, clubDayKey, VARIANT_SHORT } from "@/domain/format";
import type { PokerVariant, TournamentResult } from "@/domain/schemas";

export const metadata: Metadata = {
  title: "Results archive",
  description: "Past tournament results and league seasons at The Eglinton, Galway.",
};

const PAGE = 40;

export default async function ArchivePage({ searchParams }: PageProps<"/archive">) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const [summaries, { visit }] = await Promise.all([getSeasonSummaries(), getContent()]);
  const isDemo = isDemoData();

  const tlSeasons = summaries.ok ? summaries.data.filter((s) => s.leagueId === "tournament-league") : [];
  const periods = [
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    ...tlSeasons.map((s) => ({ value: s.seasonId, label: `${s.seasonName}` })),
    { value: "all", label: "Everything" },
  ];

  const period = get("period") ?? "90d";
  const today = clubToday();
  let from: string | undefined;
  let to: string | undefined;
  if (period === "30d" || period === "90d") {
    from = clubDayStart(civilAddDays(today, period === "30d" ? -30 : -90)).toISOString();
  } else if (period !== "all") {
    const s = tlSeasons.find((x) => x.seasonId === period);
    if (s) {
      from = clubDayStart(s.startsOn).toISOString();
      to = clubDayStart(civilAddDays(s.endsOn, 1)).toISOString();
    }
  }
  const game = get("game");
  const limit = Math.min(400, Number(get("limit")) || PAGE);
  const res = await getArchive({
    from,
    to,
    variants: game === "NLHE" || game === "PLO" ? [game as PokerVariant] : undefined,
    search: get("q"),
    limit: limit + 1,
  });

  return (
    <>
      <PageHeader
        eyebrow="Results archive"
        title={[{ text: "Hall of" }, { text: "results.", outline: true }]}
        lede="Past seasons and published results. Search for an event — or for your own name."
        aside={isDemo ? <DemoTag>Sample results · fictional players</DemoTag> : undefined}
      />

      {summaries.ok && summaries.data.length > 0 && (
        <section className="surface-ink pb-20" aria-labelledby="seasons-title">
          <div className="container-site">
            <h2 id="seasons-title" className="type-display-m">
              Seasons
            </h2>
            {[
              { id: "tournament-league", label: "Tournament League", cols: "lg:grid-cols-3" },
              { id: "cash-league", label: "Cash League · past months", cols: "lg:grid-cols-4", completedOnly: true },
            ].map((group) => {
              const items = summaries.data.filter((s) => s.leagueId === group.id && (!group.completedOnly || s.status === "completed"));
              if (!items.length) return null;
              return (
                <div key={group.id} className="mt-10">
                  <Eyebrow rule>{group.label}</Eyebrow>
                  <ul className={`mt-5 grid border-l border-t border-line sm:grid-cols-2 ${group.cols}`}>
                    {items.map((s) => (
                      <li key={s.seasonId} className="border-b border-r border-line">
                        <Link
                          href={`/leaderboard?league=${s.leagueId}&season=${s.seasonId}`}
                          className="group flex h-full flex-col justify-between gap-6 p-6 transition-colors hover:bg-fg/[0.03]"
                        >
                          <div>
                            {s.status === "active" && <p className="mb-2 text-[0.75rem] font-semibold text-positive">In progress</p>}
                            <p className="font-display text-[1.5rem] leading-tight">{s.seasonName}</p>
                            <p className="mt-1 text-[0.8125rem] text-fg-muted">
                              {formatCalendarDate(s.startsOn)} – {formatCalendarDate(s.endsOn)}
                            </p>
                          </div>
                          <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
                            <p className="text-[0.875rem]">
                              <span className="block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-faint">
                                {s.status === "active" ? "Leading" : "Champion"}
                              </span>
                              <span className="font-semibold">{s.leader?.name ?? "—"}</span>
                              {s.leader && <span className="nums ml-2 text-fg-muted">{s.leader.value}</span>}
                            </p>
                            <ArrowUpRight aria-hidden className="size-4 shrink-0 text-fg-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="surface-ink pb-28" aria-labelledby="results-title">
        <div className="container-site">
          <h2 id="results-title" className="type-display-m mb-8">
            Tournament results
          </h2>
          <Suspense>
            <ArchiveFilters periods={periods}>
              {!res.ok ? (
                <ErrorState title="Results couldn't be loaded" detail={res.error.message} />
              ) : res.data.length === 0 ? (
                <EmptyState title="No results found" body="Try a longer period, a different game, or another name." />
              ) : (
                <ResultsList results={res.data.slice(0, limit)} hasMore={res.data.length > limit} sp={sp} limit={limit} />
              )}
            </ArchiveFilters>
          </Suspense>
        </div>
      </section>
      <InviteBand
        title={[{ text: "Write the" }, { text: "next result.", outline: true }]}
        lede="Every week brings new winners. Check the schedule and come and take a seat."
        phoneHref={visit.phoneHref}
        phoneDisplay={visit.phoneDisplay}
      />
    </>
  );
}

function ResultsList({
  results,
  hasMore,
  sp,
  limit,
}: {
  results: TournamentResult[];
  hasMore: boolean;
  sp: Record<string, string | string[] | undefined>;
  limit: number;
}) {
  // Group by month for scanability.
  const groups: { key: string; label: string; items: TournamentResult[] }[] = [];
  for (const r of results) {
    const key = clubDayKey(r.tournament.startsAt).slice(0, 7);
    let g = groups.find((x) => x.key === key);
    if (!g) groups.push((g = { key, label: formatMonthYear(r.tournament.startsAt), items: [] }));
    g.items.push(r);
  }
  const more = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]);
  more.set("limit", String(limit + PAGE));

  return (
    <div>
      {groups.map((g) => (
        <section key={g.key} className="mt-10 first:mt-6" aria-label={g.label}>
          <h3 className="type-eyebrow border-b border-line-strong pb-3 text-detail">{g.label}</h3>
          <div className="type-eyebrow hidden grid-cols-[6rem_minmax(0,1fr)_5rem_8rem_12rem_1.5rem] gap-6 border-b border-line py-3 text-fg-faint md:grid">
            <span>Date</span>
            <span>Tournament</span>
            <span className="text-right">Entries</span>
            <span className="text-right">Prize pool</span>
            <span>Winner</span>
            <span />
          </div>
          <ul>
            {g.items.map((r) => {
              const t = r.tournament;
              const winner = r.payouts[0];
              return (
                <li key={t.id}>
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="group grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-line py-4 transition-colors hover:bg-fg/[0.025] md:grid-cols-[6rem_minmax(0,1fr)_5rem_8rem_12rem_1.5rem] md:items-center md:gap-6"
                  >
                    <span className="nums text-[0.8125rem] text-fg-muted md:text-[0.9375rem]">
                      {formatWeekdayShort(t.startsAt)} {formatDayMonth(t.startsAt)}
                    </span>
                    <span className="col-start-1 row-start-2 min-w-0 md:col-auto md:row-auto">
                      <span className="block truncate font-semibold group-hover:text-accent-text">{t.name}</span>
                      <span className="text-[0.8125rem] text-fg-faint">{VARIANT_SHORT[t.variant]}</span>
                    </span>
                    <span className="nums hidden text-right text-fg-muted md:block">{r.entries}</span>
                    <span className="nums col-start-2 row-start-1 row-span-2 self-center text-right font-semibold md:col-auto md:row-auto">
                      {formatEuro(r.prizePoolCents)}
                      <span className="block text-[0.75rem] font-normal text-fg-faint md:hidden">{r.entries} entries</span>
                    </span>
                    <span className="col-span-2 text-[0.8125rem] text-fg-muted md:col-auto md:text-[0.9375rem]">
                      <span className="md:hidden">Won by </span>
                      <span className="text-fg">{winner?.player.displayName ?? "—"}</span>
                      {winner && <span className="nums ml-2 text-fg-faint">{formatEuro(winner.prizeCents)}</span>}
                    </span>
                    <ArrowUpRight aria-hidden className="hidden size-4 text-fg-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg md:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <ButtonLink href={`/archive?${more}`} variant="secondary" scroll={false}>
            Show more results
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
