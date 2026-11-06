"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { League, Season, Standings, StandingsEntry } from "@/domain/schemas";
import { formatCalendarDate, formatMetric } from "@/domain/format";
import { matchesSearch } from "@/data/search";
import { SearchField, Segmented, SelectField } from "@/components/ui/controls";
import { EmptyState, Button } from "@/components/ui/primitives";
import { RankDelta } from "./bits";
import { cn } from "@/lib/cn";
import { transition } from "@/lib/motion";

const PAGE_SIZE = 15;

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const helper = createColumnHelper<typeof features, StandingsEntry>();

export function StandingsBoard({
  standings,
  seasons,
  leagues,
  basePath,
  showPodium = false,
}: {
  standings: Standings;
  seasons: Season[];
  /** When provided, a league switch is shown (leaderboard page). */
  leagues?: League[];
  basePath: string;
  showPodium?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const { league, season } = standings;
  const metrics = league.metrics;
  const primary = metrics[0];

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams(params);
    startTransition(() => router.push(`${basePath}?${sp.toString()}`, { scroll: false }));
  };

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("rank", { id: "rank", header: "Rank" }),
        helper.accessor((r) => r.player.displayName, { id: "player", header: "Player", sortFn: (a, b) => a.original.player.displayName.localeCompare(b.original.player.displayName) }),
        ...metrics.map((m) =>
          helper.accessor((r) => r.values[m.key] ?? 0, {
            id: m.key,
            header: m.shortLabel,
            sortDescFirst: true,
          })
        ),
      ]),
    [metrics]
  );

  const data = useMemo(
    () => standings.entries.filter((e) => matchesSearch([e.player.displayName], query)),
    [standings.entries, query]
  );

  const table = useTable({
    features,
    columns,
    data,
    getRowId: (r) => r.player.id,
    initialState: { sorting: [{ id: "rank", desc: false }], pagination: { pageIndex: 0, pageSize: PAGE_SIZE } },
    enableSortingRemoval: false,
  });

  const sorting = table.state.sorting;
  const pagination = table.state.pagination;
  const rows = table.getRowModel().rows;
  const total = table.getPrePaginatedRowModel().rows.length;
  const from = total ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const to = Math.min(total, (pagination.pageIndex + 1) * pagination.pageSize);
  const sortedBy = sorting[0];

  const podium = standings.entries.slice(0, 3);
  const leaderValue = standings.entries[0]?.values[primary.key] ?? 0;
  // At the start of a season there is nothing to compare against yet.
  const showDelta = standings.entries.some((e) => e.previousRank != null);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-4">
          {leagues && (
            <div className="flex flex-col gap-1.5">
              <span className="type-eyebrow text-fg-faint">League</span>
              <Segmented
                label="League"
                value={league.id}
                onChange={(id) => navigate({ league: id })}
                options={leagues.map((l) => ({ value: l.id, label: l.name }))}
              />
            </div>
          )}
          <SelectField
            label="Season"
            value={season.id}
            onChange={(id) => navigate(leagues ? { league: league.id, season: id } : { season: id })}
            options={seasons.map((s) => ({ value: s.id, label: `${s.name}${s.status === "active" ? " · current" : ""}` }))}
            className="min-w-[14rem]"
          />
        </div>
        <SearchField value={query} onChange={(v) => { setQuery(v); table.setPageIndex(0); }} placeholder="Find a player" label="Find a player" className="w-full lg:w-72" />
      </div>

      <div className={cn("transition-opacity duration-300", pending && "pointer-events-none opacity-40")} aria-busy={pending}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 text-[0.8125rem] text-fg-faint">
          <p className="font-semibold uppercase tracking-[0.06em]">
            <span className="text-fg">{season.name}</span> · {formatCalendarDate(season.startsOn)} – {formatCalendarDate(season.endsOn)}
            {season.status === "active" && <span className="ml-2 text-positive">In progress</span>}
          </p>
          <p>{league.rankingRule}</p>
        </div>

        {showPodium && podium.length === 3 && !query && (
          <Podium entries={podium} primary={primary} seasonKey={season.id} showDelta={showDelta} />
        )}

        {standings.entries.length === 0 ? (
          <EmptyState title="No results recorded yet" body="Standings appear here after the first league results of the season are published." />
        ) : total === 0 ? (
          <EmptyState
            title={`No player matching “${query}”`}
            body="Check the spelling, or search by first name."
            action={<Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>}
          />
        ) : (
          <>
            {/* Desktop / tablet table */}
            <table className="nums hidden w-full text-left md:table">
              <caption className="sr-only">
                {league.name} standings, {season.name}. {standings.comparisonLabel}.
              </caption>
              <thead>
                <tr className="border-b border-line-strong">
                  {table.getHeaderGroups()[0].headers.map((h) => {
                    const isSorted = sortedBy?.id === h.column.id;
                    const numeric = h.column.id !== "player" && h.column.id !== "rank";
                    return (
                      <th
                        key={h.id}
                        scope="col"
                        aria-sort={isSorted ? (sortedBy.desc ? "descending" : "ascending") : "none"}
                        className={cn("py-3 font-semibold", numeric ? "text-right" : "", h.column.id === "rank" && "w-28", h.column.id === "player" && "pl-2")}
                      >
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={cn(
                            "type-eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-fg",
                            isSorted ? "text-fg" : "text-fg-faint",
                            numeric && "flex-row-reverse"
                          )}
                          title={metrics.find((m) => m.key === h.column.id)?.label}
                        >
                          {String(h.column.columnDef.header)}
                          {isSorted ? (
                            sortedBy.desc ? <ArrowDown aria-hidden className="size-3" /> : <ArrowUp aria-hidden className="size-3" />
                          ) : (
                            <ArrowUpDown aria-hidden className="size-3 opacity-40" />
                          )}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((row) => {
                    const e = row.original;
                    return (
                      <motion.tr
                        key={`${season.id}-${row.id}`}
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={transition.layout}
                        className="group border-b border-line transition-colors hover:bg-fg/[0.04]"
                      >
                        <td className="py-4">
                          <span className="inline-flex w-24 items-center gap-3">
                            <span className={cn("w-12 font-display text-[2.25rem] leading-none", e.rank <= 3 ? "text-accent-text" : "text-fg")}>
                              {String(e.rank).padStart(2, "0")}
                            </span>
                            {showDelta && <RankDelta rank={e.rank} previousRank={e.previousRank} />}
                          </span>
                        </td>
                        <th scope="row" className="py-4 pl-2 text-left">
                          <span className="block text-[1.0625rem] font-bold">{e.player.displayName}</span>
                          <span aria-hidden className="mt-2 block h-1 w-full max-w-[16rem] bg-fg/10">
                            <motion.span
                              className={cn("block h-full origin-left", e.rank === 1 ? "bg-red-brand" : "bg-fg")}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: leaderValue ? (e.values[primary.key] ?? 0) / leaderValue : 0 }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </span>
                        </th>
                        {metrics.map((m, i) => (
                          <td key={m.key} className={cn("py-4 text-right", i === 0 ? "font-display text-[1.875rem] leading-none" : "text-[0.9375rem] text-fg-muted", sortedBy?.id === m.key && i !== 0 && "font-bold text-fg")}>
                            {formatMetric(e.values[m.key] ?? 0, m.format)}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Mobile list */}
            <div className="md:hidden">
              <div className="flex items-center justify-between border-b border-line-strong pb-3">
                <span className="type-eyebrow text-fg-faint">Sort by</span>
                <select
                  aria-label="Sort standings by"
                  value={`${sortedBy?.id}:${sortedBy?.desc ? "desc" : "asc"}`}
                  onChange={(ev) => {
                    const [id, dir] = ev.target.value.split(":");
                    table.setSorting([{ id, desc: dir === "desc" }]);
                  }}
                  className="select-reset h-9 border border-line-strong bg-bg pl-3 text-[0.8125rem] font-bold uppercase tracking-[0.06em]"
                >
                  <option value="rank:asc">Rank</option>
                  {metrics.map((m) => (
                    <option key={m.key} value={`${m.key}:desc`}>
                      {m.label}
                    </option>
                  ))}
                  <option value="player:asc">Name A–Z</option>
                </select>
              </div>
              <ol>
                {rows.map((row) => {
                  const e = row.original;
                  const metricShown = sortedBy && metrics.find((m) => m.key === sortedBy.id) ? metrics.find((m) => m.key === sortedBy.id)! : primary;
                  return (
                    <motion.li key={`${season.id}-${row.id}`} layout="position" transition={transition.layout} className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 border-b border-line py-3.5">
                      <span className={cn("nums font-display text-[2rem] leading-none", e.rank <= 3 ? "text-accent-text" : "text-fg")}>{String(e.rank).padStart(2, "0")}</span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-bold">{e.player.displayName}</span>
                          {showDelta && <RankDelta rank={e.rank} previousRank={e.previousRank} />}
                        </span>
                        <span className="nums block truncate text-[0.75rem] text-fg-faint">
                          {metrics
                            .filter((m) => m.key !== metricShown.key)
                            .slice(0, 2)
                            .map((m) => `${formatMetric(e.values[m.key] ?? 0, m.format)} ${m.shortLabel.toLowerCase()}`)
                            .join(" · ")}
                        </span>
                      </span>
                      <span className="nums text-right">
                        <span className="block font-display text-[1.5rem] leading-none">{formatMetric(e.values[metricShown.key] ?? 0, metricShown.format)}</span>
                        <span className="block text-[0.6875rem] uppercase tracking-[0.1em] text-fg-faint">{metricShown.shortLabel}</span>
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
            </div>

            {/* Pagination */}
            <nav aria-label="Standings pages" className="flex items-center justify-between gap-4 pt-6">
              <p className="nums text-[0.8125rem] text-fg-faint" aria-live="polite">
                {from}–{to} of {total} players · {standings.comparisonLabel.toLowerCase()}
              </p>
              {table.getPageCount() > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Previous page"
                    className="inline-flex size-11 items-center justify-center border border-line-strong transition-colors hover:bg-fg hover:text-bg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg"
                  >
                    <ChevronLeft className="size-4" strokeWidth={1.75} />
                  </button>
                  <span className="nums px-2 text-[0.8125rem] text-fg-muted">
                    {pagination.pageIndex + 1} / {table.getPageCount()}
                  </span>
                  <button
                    type="button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Next page"
                    className="inline-flex size-11 items-center justify-center border border-line-strong transition-colors hover:bg-fg hover:text-bg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg"
                  >
                    <ChevronRight className="size-4" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}

function Podium({ entries, primary, seasonKey, showDelta }: { entries: StandingsEntry[]; primary: League["metrics"][number]; seasonKey: string; showDelta: boolean }) {
  // Visual order 2 · 1 · 3 on wide screens; 1 · 2 · 3 stacked on mobile.
  const order = [entries[1], entries[0], entries[2]];
  return (
    <motion.ol
      key={seasonKey}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      className="mb-12 grid gap-px border border-line bg-line md:grid-cols-[1fr_1.25fr_1fr]"
      aria-label="Top three"
    >
      {order.map((e) => {
        const first = e.rank === 1;
        return (
          <motion.li
            key={e.player.id}
            variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }}
            className={cn(
              "relative flex items-end justify-between gap-5 overflow-hidden px-6 md:flex-col md:items-start md:justify-end",
              first ? "order-first bg-red-brand py-8 text-white md:order-none md:py-12" : "bg-bg py-6 md:pt-16 md:pb-9",
              e.rank === 3 && "order-last md:order-none"
            )}
          >
            <span className={cn("nums font-display leading-[0.8]", first ? "text-[5rem] md:text-[9rem]" : "text-[4rem] md:text-[6.5rem]")}>
              {String(e.rank).padStart(2, "0")}
            </span>
            <span className="text-right md:mt-6 md:text-left">
              <span className={cn("block font-display uppercase leading-none", first ? "text-[2rem] md:text-[2.75rem]" : "text-[1.625rem] md:text-[2rem]")}>{e.player.displayName}</span>
              <span className={cn("nums mt-2 flex items-center justify-end gap-3 text-[0.8125rem] font-bold uppercase tracking-[0.08em] md:justify-start", first ? "text-white/85" : "text-fg-muted")}>
                <span>
                  <span className={first ? "text-white" : "text-fg"}>{formatMetric(e.values[primary.key] ?? 0, primary.format)}</span> {primary.shortLabel}
                </span>
                {!first && showDelta && <RankDelta rank={e.rank} previousRank={e.previousRank} />}
              </span>
            </span>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
