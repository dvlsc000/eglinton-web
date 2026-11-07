import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Tournament, TournamentStatus } from "@/domain/schemas";
import {
  STATUS_LABEL,
  VARIANT_SHORT,
  formatBuyIn,
  formatChipsShort,
  formatDayOfMonth,
  formatEuro,
  formatMonthShort,
  formatTime,
  formatWeekdayShort,
  buyInTotal,
} from "@/domain/format";
import { cn } from "@/lib/cn";

const SHORT_STATUS: Record<TournamentStatus, string> = {
  scheduled: "Scheduled",
  "registration-open": "Reg open",
  "late-registration": "Late reg",
  "in-progress": "Live now",
  completed: "Finished",
  cancelled: "Cancelled",
};

const statusStyle: Record<TournamentStatus, string> = {
  scheduled: "border border-line-strong text-fg",
  "registration-open": "bg-red-brand text-white",
  "late-registration": "border border-accent-text text-accent-text",
  "in-progress": "bg-fg text-bg",
  completed: "border border-line text-fg-faint",
  cancelled: "border border-line text-fg-faint line-through",
};

/** Scoreboard chip. `full` spells the label out (for headers and detail pages). */
export function StatusBadge({ status, className, full = false }: { status: TournamentStatus; className?: string; full?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 px-2.5 text-[0.6875rem] font-extrabold uppercase tracking-[0.1em] whitespace-nowrap",
        statusStyle[status],
        className
      )}
    >
      {(status === "registration-open" || status === "in-progress") && (
        <span aria-hidden className="relative flex size-1.5">
          <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-70", status === "in-progress" ? "bg-bg" : "bg-white")} />
          <span className={cn("relative inline-flex size-1.5 rounded-full", status === "in-progress" ? "bg-bg" : "bg-white")} />
        </span>
      )}
      {full ? STATUS_LABEL[status] : SHORT_STATUS[status]}
    </span>
  );
}

export function DateBlock({ iso, className }: { iso: string; className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-start leading-none", className)}>
      <span className="text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-fg-muted">{formatWeekdayShort(iso)}</span>
      <span className="nums mt-1 font-display text-[1.875rem] leading-none">{formatDayOfMonth(iso)}</span>
      <span className="mt-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-fg-faint">{formatMonthShort(iso)}</span>
    </div>
  );
}

export function FormatList({ t, className }: { t: Tournament; className?: string }) {
  return (
    <span className={cn("text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-faint", className)}>
      {VARIANT_SHORT[t.variant]}
      {t.formats
        .filter((f) => f !== "Festival")
        .map((f) => (
          <span key={f}>
            <span aria-hidden className="px-1.5">·</span>
            {f}
          </span>
        ))}
    </span>
  );
}

const ROW_COLS = "lg:grid-cols-[5.5rem_7.5rem_minmax(0,1fr)_7rem_5rem_7.5rem_8rem_1.5rem]";

/**
 * Schedule row — the core reading unit. Desktop: one aligned line with a big
 * condensed start time. Mobile: time + name first, money and status below.
 */
export function TournamentRow({ t, date = "show", highlight = false }: { t: Tournament; date?: "show" | "blank" | "none"; highlight?: boolean }) {
  const cancelled = t.status === "cancelled";
  const past = t.status === "completed";
  return (
    <Link
      href={`/tournaments/${t.id}`}
      className={cn(
        "group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 border-b border-line py-5 md:gap-x-6",
        ROW_COLS,
        "lg:gap-x-6 lg:py-6",
        cancelled && "opacity-60",
        past && "opacity-70"
      )}
    >
      {/* hover sweep */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-0 origin-left scale-x-0 bg-fg/[0.04] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-red-brand transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100", highlight && "scale-y-100")} />

      {date === "show" ? (
        <>
          <span className="relative hidden pl-3 text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-fg-muted lg:block">
            {formatWeekdayShort(t.startsAt)} {formatDayOfMonth(t.startsAt)} {formatMonthShort(t.startsAt)}
          </span>
          <DateBlock iso={t.startsAt} className="relative row-span-2 w-11 pl-2 lg:hidden" />
        </>
      ) : (
        <span aria-hidden className={cn("relative row-span-2 lg:row-span-1", date === "blank" ? "w-11 lg:w-auto" : "-mr-4 w-0 md:-mr-6 lg:mr-0 lg:w-auto")} />
      )}

      <span className="nums relative hidden font-display text-[2.75rem] leading-none transition-colors group-hover:text-accent-text lg:block">
        {formatTime(t.startsAt)}
      </span>

      <span className="relative min-w-0">
        <span className={cn("block text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] md:text-[1.1875rem]", cancelled && "line-through decoration-2")}>
          <span className="nums mr-2 font-display text-[1.375rem] text-accent-text lg:hidden">{formatTime(t.startsAt)}</span>
          {t.name}
        </span>
        <FormatList t={t} className="mt-1 block" />
      </span>

      <span className="nums relative text-right lg:text-left">
        <span className="block font-display text-[1.625rem] leading-none">{formatEuro(buyInTotal(t.buyIn))}</span>
        <span className="mt-1 block text-[0.6875rem] text-fg-faint">{formatBuyIn(t.buyIn)}</span>
      </span>

      <span className="nums relative hidden font-display text-[1.625rem] leading-none text-fg-muted lg:block">
        <span className="sr-only">Starting stack </span>
        {formatChipsShort(t.startingStack).toUpperCase()}
      </span>

      <span className="nums relative hidden lg:block">
        {t.guaranteeCents ? (
          <span className="block font-display text-[1.625rem] leading-none text-accent-text">
            <span className="sr-only">Guaranteed </span>
            {formatEuro(t.guaranteeCents)}
          </span>
        ) : (
          <span className="text-fg-faint">—</span>
        )}
      </span>

      <span className="relative col-start-2 col-end-4 flex items-center justify-between gap-3 lg:col-auto lg:block">
        <StatusBadge status={t.status} />
        <span className="nums text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-fg-faint lg:hidden">
          {formatChipsShort(t.startingStack)} stack
          {t.guaranteeCents ? <span className="text-accent-text"> · {formatEuro(t.guaranteeCents)} GTD</span> : null}
        </span>
      </span>

      <ArrowUpRight
        aria-hidden
        className="relative hidden size-5 text-fg-faint transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg lg:block"
        strokeWidth={2}
      />
    </Link>
  );
}

export function TournamentTableHead() {
  return (
    <div aria-hidden className={cn("type-eyebrow hidden gap-x-6 border-b border-line-strong pb-3 text-fg-faint lg:grid", ROW_COLS)}>
      <span className="pl-3">Date</span>
      <span>Start</span>
      <span>Tournament</span>
      <span>Buy-in</span>
      <span>Stack</span>
      <span>Guarantee</span>
      <span>Status</span>
      <span />
    </div>
  );
}
