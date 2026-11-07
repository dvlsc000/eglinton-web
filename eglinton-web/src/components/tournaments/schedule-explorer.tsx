"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, List, X } from "lucide-react";
import type { PokerVariant, Tournament, TournamentFormat } from "@/domain/schemas";
import {
  civilAddDays,
  civilAddMonths,
  civilMonthStart,
  civilWeekStart,
  civilWeekday,
  type CivilDate,
} from "@/domain/civil";
import { clubDayKey, formatCalendarDate, formatTime, VARIANT_SHORT } from "@/domain/format";
import { TournamentRow, TournamentTableHead } from "./bits";
import { Chip, SearchField, Segmented, replaceQuery } from "@/components/ui/controls";
import { EmptyState, Button } from "@/components/ui/primitives";
import { matchesSearch } from "@/data/search";
import { cn } from "@/lib/cn";
import { transition } from "@/lib/motion";

type View = "list" | "calendar";
type Game = "all" | PokerVariant;

const FORMAT_FILTERS: TournamentFormat[] = ["Deepstack", "Re-entry", "Rebuy", "Bounty", "Turbo", "Satellite", "Festival"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type ScheduleInitial = {
  view: View;
  week: CivilDate | null;
  day: CivilDate | null;
  game: Game;
  formats: TournamentFormat[];
  q: string;
  series: string | null;
};

export function ScheduleExplorer({
  tournaments,
  today,
  firstWeek,
  lastDayExclusive,
  initial,
  seriesNames,
}: {
  tournaments: Tournament[];
  today: CivilDate;
  firstWeek: CivilDate;
  lastDayExclusive: CivilDate;
  initial: ScheduleInitial;
  seriesNames: Record<string, string>;
}) {
  const thisWeek = civilWeekStart(today);
  const lastWeek = civilAddDays(lastDayExclusive, -7);
  const clampWeek = (w: CivilDate) => (w < firstWeek ? firstWeek : w > lastWeek ? lastWeek : w);

  const [view, setView] = useState<View>(initial.view);
  const [week, setWeek] = useState<CivilDate>(clampWeek(initial.week ? civilWeekStart(initial.week) : thisWeek));
  const [day, setDay] = useState<CivilDate | null>(initial.day);
  const [game, setGame] = useState<Game>(initial.game);
  const [formats, setFormats] = useState<TournamentFormat[]>(initial.formats);
  const [q, setQ] = useState(initial.q);
  const [series, setSeries] = useState<string | null>(initial.series && seriesNames[initial.series] ? initial.series : null);
  const [month, setMonth] = useState<CivilDate>(civilMonthStart(initial.day ?? today));
  const [, startTransition] = useTransition();

  const withDay = useMemo(() => tournaments.map((t) => ({ t, day: clubDayKey(t.startsAt) })), [tournaments]);

  // Filters other than date
  const matching = useMemo(
    () =>
      withDay.filter(
        ({ t }) =>
          (game === "all" || t.variant === game) &&
          (!formats.length || formats.some((f) => t.formats.includes(f))) &&
          (!series || t.seriesId === series) &&
          matchesSearch([t.name, VARIANT_SHORT[t.variant], ...t.formats], q)
      ),
    [withDay, game, formats, series, q]
  );

  const weekEnd = civilAddDays(week, 7);
  // A series filter shows the whole series regardless of week.
  const inScope = series ? matching : matching.filter((x) => x.day >= week && x.day < weekEnd);
  const visible = day && !series ? inScope.filter((x) => x.day === day) : inScope;

  const countsByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of matching) m.set(x.day, (m.get(x.day) ?? 0) + 1);
    return m;
  }, [matching]);

  const sync = (patch: Partial<Record<string, string | null>>) => startTransition(() => replaceQuery(patch));

  const changeWeek = (delta: number) => {
    const next = clampWeek(civilAddDays(week, delta * 7));
    setWeek(next);
    setDay(null);
    sync({ week: next === thisWeek ? null : next, day: null });
  };
  const pickDay = (d: CivilDate | null) => {
    setDay(d);
    sync({ day: d });
  };
  const toggleFormat = (f: TournamentFormat) => {
    const next = formats.includes(f) ? formats.filter((x) => x !== f) : [...formats, f];
    setFormats(next);
    sync({ format: next.join(",") || null });
  };
  const reset = () => {
    setGame("all");
    setFormats([]);
    setQ("");
    setSeries(null);
    setDay(null);
    sync({ game: null, format: null, q: null, series: null, day: null });
  };
  const filtersActive = game !== "all" || formats.length > 0 || q.trim() !== "" || series !== null;

  const openDayInList = (d: CivilDate) => {
    const w = clampWeek(civilWeekStart(d));
    setWeek(w);
    setDay(d);
    setView("list");
    sync({ view: null, week: w === thisWeek ? null : w, day: d });
    document.getElementById("schedule-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const weekLabel = `${formatCalendarDate(week).replace(/ \d{4}$/, "")} – ${formatCalendarDate(civilAddDays(week, 6))}`;

  return (
    <div>
      {/* ---------------- Toolbar ---------------- */}
      <div className="sticky top-[var(--header-offset,var(--header-h))] transition-[top] duration-[450ms] z-30 -mx-[var(--gutter)] border-y border-line bg-bg/95 px-[var(--gutter)] py-4 backdrop-blur-[2px]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Schedule view"
              value={view}
              onChange={(v) => {
                setView(v);
                sync({ view: v === "list" ? null : v });
              }}
              options={[
                { value: "list", label: <span className="inline-flex items-center gap-2"><List aria-hidden className="size-4" strokeWidth={1.75} />List</span> },
                { value: "calendar", label: <span className="inline-flex items-center gap-2"><CalendarDays aria-hidden className="size-4" strokeWidth={1.75} />Calendar</span> },
              ]}
            />
            <Segmented
              label="Game"
              value={game}
              onChange={(v) => {
                setGame(v);
                sync({ game: v === "all" ? null : v });
              }}
              options={[
                { value: "all", label: "All games" },
                { value: "NLHE", label: "Hold'em" },
                { value: "PLO", label: "Omaha" },
              ]}
            />
          </div>
          <SearchField
            value={q}
            onChange={(v) => {
              setQ(v);
              sync({ q: v || null });
            }}
            placeholder="Search tournaments"
            label="Search tournaments"
            className="w-full xl:w-72"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Format">
          {FORMAT_FILTERS.map((f) => (
            <Chip key={f} pressed={formats.includes(f)} onClick={() => toggleFormat(f)}>
              {f}
            </Chip>
          ))}
          {series && (
            <button
              type="button"
              onClick={() => {
                setSeries(null);
                sync({ series: null });
              }}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 border border-detail px-3 text-[0.8125rem] font-medium text-detail"
            >
              {seriesNames[series]}
              <X aria-label="Remove series filter" className="size-3.5" />
            </button>
          )}
          {filtersActive && (
            <button type="button" onClick={reset} className="ml-1 h-9 shrink-0 px-2 text-[0.8125rem] font-semibold text-accent-text">
              Clear all
            </button>
          )}
        </div>
      </div>

      <div id="schedule-results" className="scroll-mt-[calc(var(--header-h)+9rem)]" />

      {view === "list" ? (
        <div className="mt-10">
          {/* Week navigation + day strip */}
          {!series && (
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="type-eyebrow text-fg-faint">{week === thisWeek ? "This week" : week < thisWeek ? "Last week" : "Week of"}</p>
                  <p className="nums mt-1 font-display text-[1.625rem] leading-tight md:text-[2rem]" aria-live="polite">
                    {weekLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {week !== thisWeek && (
                    <button
                      type="button"
                      onClick={() => {
                        setWeek(thisWeek);
                        setDay(null);
                        sync({ week: null, day: null });
                      }}
                      className="mr-2 hidden text-[0.8125rem] font-semibold text-accent-text sm:inline">
                      Back to this week
                    </button>
                  )}
                  <WeekButton dir="prev" disabled={week <= firstWeek} onClick={() => changeWeek(-1)} />
                  <WeekButton dir="next" disabled={week >= lastWeek} onClick={() => changeWeek(1)} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-7 border-y border-line" role="group" aria-label="Choose a day">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = civilAddDays(week, i);
                  const count = countsByDay.get(d) ?? 0;
                  const selected = day === d;
                  const isToday = d === today;
                  const past = d < today;
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => pickDay(selected ? null : d)}
                      className={cn(
                        "relative flex flex-col items-center gap-1 py-3 transition-colors duration-200 sm:py-4",
                        i > 0 && "border-l border-line",
                        selected ? "bg-fg text-bg" : "hover:bg-fg/[0.04]",
                        past && !selected && "text-fg-faint"
                      )}
                    >
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em]">{WEEKDAYS[i]}</span>
                      <span className="nums font-display text-[1.375rem] leading-none sm:text-[1.625rem]">{Number(d.slice(8))}</span>
                      <span className={cn("nums text-[0.6875rem]", selected ? "text-bg/70" : "text-fg-faint")}>
                        {count ? `${count} event${count > 1 ? "s" : ""}` : "—"}
                      </span>
                      {isToday && <span aria-label="Today" className={cn("absolute top-2 right-2 size-1.5 rounded-full", selected ? "bg-bg" : "bg-accent-text")} />}
                    </button>
                  );
                })}
              </div>
              {day && (
                <button type="button" onClick={() => pickDay(null)} className="mt-3 text-[0.8125rem] font-semibold text-accent-text">
                  Show the whole week
                </button>
              )}
            </div>
          )}

          <p className="sr-only" aria-live="polite">
            {visible.length} tournament{visible.length === 1 ? "" : "s"} shown
          </p>

          {visible.length ? (
            <>
              <TournamentTableHead />
              <ul>
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map(({ t, day: d }, i) => (
                    <motion.li
                      key={t.id}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={transition.fast}
                      className={cn(i > 0 && visible[i - 1].day !== d && "border-t border-line-strong")}
                    >
                      <TournamentRow t={t} date={i === 0 || visible[i - 1].day !== d ? "show" : "blank"} highlight={d === today} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </>
          ) : (
            <EmptyState
              title={filtersActive ? "No tournaments match those filters" : "Nothing scheduled"}
              body={
                filtersActive
                  ? "Try a different game or format, or clear the filters to see the full week."
                  : day
                    ? "There are no tournaments on this day. Pick another day or show the whole week."
                    : "No tournaments have been published for this week yet."
              }
              action={
                filtersActive ? (
                  <Button variant="secondary" onClick={reset}>
                    Clear filters
                  </Button>
                ) : day ? (
                  <Button variant="secondary" onClick={() => pickDay(null)}>
                    Show the whole week
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      ) : (
        <CalendarView
          month={month}
          setMonth={setMonth}
          today={today}
          firstDay={firstWeek}
          lastDayExclusive={lastDayExclusive}
          items={matching}
          onOpenDay={openDayInList}
        />
      )}
    </div>
  );
}

function WeekButton({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous week" : "Next week"}
      className="inline-flex size-11 items-center justify-center border border-line text-fg transition-colors hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Calendar                                                                   */
/* -------------------------------------------------------------------------- */

function CalendarView({
  month,
  setMonth,
  today,
  firstDay,
  lastDayExclusive,
  items,
  onOpenDay,
}: {
  month: CivilDate;
  setMonth: (m: CivilDate) => void;
  today: CivilDate;
  firstDay: CivilDate;
  lastDayExclusive: CivilDate;
  items: { t: Tournament; day: CivilDate }[];
  onOpenDay: (d: CivilDate) => void;
}) {
  const [selected, setSelected] = useState<CivilDate>(today >= month && today < civilAddMonths(month, 1) ? today : month);
  const gridStart = civilAddDays(month, -(civilWeekday(month) - 1));
  const nextMonth = civilAddMonths(month, 1);
  const weeks = Math.ceil((civilWeekday(month) - 1 + Number(civilAddDays(nextMonth, -1).slice(8))) / 7);
  const byDay = useMemo(() => {
    const m = new Map<string, Tournament[]>();
    for (const x of items) m.set(x.day, [...(m.get(x.day) ?? []), x.t]);
    return m;
  }, [items]);
  const canPrev = month > civilMonthStart(firstDay);
  const canNext = nextMonth < lastDayExclusive;
  const monthLabel = formatCalendarDate(civilAddDays(month, 14), "long").replace(/^\d+ /, "");
  const selectedItems = byDay.get(selected) ?? [];

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <p className="font-display text-[1.75rem] md:text-[2.25rem]" aria-live="polite">
          {monthLabel}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setMonth(civilAddMonths(month, -1))}
            aria-label="Previous month"
            className="inline-flex size-11 items-center justify-center border border-line disabled:opacity-30"
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setMonth(civilAddMonths(month, 1))}
            aria-label="Next month"
            className="inline-flex size-11 items-center justify-center border border-line disabled:opacity-30"
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 border-l border-t border-line" role="grid" aria-label={`${monthLabel} tournaments`}>
        {WEEKDAYS.map((w) => (
          <div key={w} role="columnheader" className="type-eyebrow border-b border-r border-line px-2 py-3 text-center text-fg-faint md:text-left">
            {w}
          </div>
        ))}
        {Array.from({ length: weeks * 7 }, (_, i) => {
          const d = civilAddDays(gridStart, i);
          const inMonth = d >= month && d < nextMonth;
          const inWindow = d >= firstDay && d < lastDayExclusive;
          const list = inWindow ? (byDay.get(d) ?? []) : [];
          const isToday = d === today;
          const isSelected = d === selected;
          return (
            <div
              key={d}
              role="gridcell"
              className={cn(
                "group/cell relative min-h-[3.75rem] border-b border-r border-line md:min-h-[8.5rem]",
                !inMonth && "bg-fg/[0.015]",
                isSelected && "max-md:bg-fg/[0.06]"
              )}
            >
              <button
                type="button"
                onClick={() => (window.matchMedia("(min-width: 768px)").matches ? onOpenDay(d) : setSelected(d))}
                disabled={!inWindow}
                aria-label={`${formatCalendarDate(d, "long")}: ${list.length} tournament${list.length === 1 ? "" : "s"}${inWindow ? "" : " (not yet published)"}`}
                className={cn(
                  "flex w-full items-center justify-center gap-2 px-2 pt-2 md:justify-between",
                  !inMonth && "text-fg-faint",
                  !inWindow && "cursor-default opacity-40"
                )}
              >
                <span
                  className={cn(
                    "nums inline-flex size-7 items-center justify-center rounded-full text-[0.875rem] font-semibold",
                    isToday && "bg-accent text-accent-fg"
                  )}
                >
                  {Number(d.slice(8))}
                </span>
                {list.length > 0 && <span className="hidden text-[0.6875rem] text-fg-faint opacity-0 transition-opacity group-hover/cell:opacity-100 md:inline">View day</span>}
              </button>
              {/* Mobile: dots */}
              <div className="flex justify-center gap-1 pb-2 pt-1 md:hidden" aria-hidden>
                {list.slice(0, 3).map((t) => (
                  <span key={t.id} className={cn("size-1 rounded-full", t.status === "cancelled" ? "bg-fg-faint" : t.seriesId ? "bg-detail" : "bg-fg-muted")} />
                ))}
              </div>
              {/* Desktop: event list */}
              <ul className="hidden space-y-1 px-2 pb-2 pt-1.5 md:block">
                {list.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tournaments/${t.id}`}
                      className={cn(
                        "block truncate border-l-2 py-0.5 pl-1.5 text-[0.75rem] leading-snug transition-colors hover:bg-fg/[0.05]",
                        t.seriesId ? "border-detail" : t.variant === "PLO" ? "border-felt-300/60" : "border-line-strong",
                        (t.status === "completed" || t.status === "cancelled") && "text-fg-faint",
                        t.status === "cancelled" && "line-through"
                      )}
                    >
                      <span className="nums font-semibold">{formatTime(t.startsAt)}</span> {t.name.replace(/^Winter Series · /, "WS · ")}
                    </Link>
                  </li>
                ))}
                {list.length > 3 && (
                  <li>
                    <button type="button" onClick={() => onOpenDay(d)} className="pl-2 text-[0.75rem] font-semibold text-accent-text">
                      +{list.length - 3} more
                    </button>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-4 hidden flex-wrap gap-5 text-[0.75rem] text-fg-faint md:flex">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-0.5 bg-line-strong" />Hold&rsquo;em</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-0.5 bg-felt-300/60" />Omaha</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-0.5 bg-detail" />Series event</span>
        <span>Faded dates are outside the published schedule.</span>
      </div>

      {/* Mobile: agenda for the selected day */}
      <div className="mt-8 md:hidden">
        <p className="type-eyebrow text-fg-faint">{selected === today ? "Today" : "Selected day"}</p>
        <p className="mt-1 font-display text-[1.5rem]">{formatCalendarDate(selected, "long")}</p>
        {selectedItems.length ? (
          <ul className="mt-4 border-t border-line">
            {selectedItems.map((t) => (
              <li key={t.id}>
                <TournamentRow t={t} date="none" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-y border-line py-6 text-fg-muted">No tournaments on this day.</p>
        )}
      </div>
    </div>
  );
}
