import Link from "next/link";
import type { League, Season } from "@/domain/schemas";
import type { LeagueView } from "@/data/queries";
import { formatEuro, ordinal } from "@/domain/format";
import { PageHeader } from "@/components/layout/page-header";
import { InviteBand } from "@/components/layout/invite-band";
import { DemoTag, Eyebrow, ErrorState } from "@/components/ui/primitives";
import { CountUp, type RevealLine } from "@/components/motion/kinetic";
import { Reveal } from "@/components/motion/reveal";
import { StandingsBoard } from "./standings-board";
import { cn } from "@/lib/cn";
import { SITE_CONTENT } from "@/content/site";

const LEAGUE_TABS = [
  { href: "/leagues/tournament", label: "Tournament League", kind: "tournament" },
  { href: "/leagues/cash", label: "Cash League", kind: "cash" },
] as const;

export function LeagueSwitch({ current }: { current: League["kind"] }) {
  return (
    <nav aria-label="Leagues" className="grid grid-cols-2 border border-line-strong sm:inline-grid">
      {LEAGUE_TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.kind === current ? "page" : undefined}
          className={cn(
            "px-5 py-3.5 text-center text-[0.8125rem] font-extrabold uppercase tracking-[0.1em] transition-colors",
            t.kind === current ? "bg-fg text-bg" : "text-fg-muted hover:text-fg"
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function LeaguePage({
  league,
  view,
  isDemo,
  title,
  basePath,
}: {
  league: League;
  view: { ok: true; data: LeagueView | null } | { ok: false; error: { message: string } };
  isDemo: boolean;
  title: RevealLine[];
  basePath: string;
}) {
  const { visit } = SITE_CONTENT;
  return (
    <>
      <PageHeader
        eyebrow={league.name}
        title={title}
        lede={league.description}
        aside={isDemo ? <DemoTag>Fictional players · demo seasons</DemoTag> : undefined}
      />
      <section className="surface-ink pt-10 pb-28">
        <div className="container-site">
          <LeagueSwitch current={league.kind} />
          <div className="mt-12 grid gap-16 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-8">
              {!view.ok ? (
                <ErrorState title="Standings couldn't be loaded" detail={view.error.message} />
              ) : view.data?.standings ? (
                <StandingsBoard standings={view.data.standings} seasons={view.data.seasons} basePath={basePath} />
              ) : (
                <ErrorState title="No standings for this season" />
              )}
            </div>
            <aside className="space-y-12 lg:col-span-4">
              {view.ok && view.data?.selected?.prizePool && <PrizePoolCard season={view.data.selected} isDemo={isDemo} />}
              <Reveal>
                <Eyebrow rule>How it works</Eyebrow>
                <ol className="mt-6 border-t border-line">
                  {league.rules.map((r, i) => (
                    <li key={r} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-line py-4 text-[0.9375rem] text-fg-muted">
                      <span className="nums font-display text-[1.5rem] leading-none text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
                {isDemo && <p className="mt-5 text-[0.8125rem] text-fg-faint">Rules shown are a demonstration and must be replaced with the club&rsquo;s published league rules.</p>}
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
      <InviteBand
        title={league.kind === "cash" ? [{ text: "Clock your" }, { text: "hours in.", outline: true }] : [{ text: "Your next" }, { text: "cash counts.", outline: true }]}
        lede={league.kind === "cash" ? "Every hour at a cash table counts toward this month's table. Pull up a chair." : "Every in-the-money finish in a weekly tournament earns points. There's one on this week."}
        phoneHref={visit.phoneHref}
        phoneDisplay={visit.phoneDisplay}
      />
    </>
  );
}

function PrizePoolCard({ season, isDemo }: { season: Season; isDemo: boolean }) {
  const pool = season.prizePool!;
  return (
    <Reveal className="relative overflow-hidden bg-red-brand p-7 text-white">
      <div className="flex items-center justify-between">
        <p className="type-eyebrow">League fund</p>
        {isDemo && <span className="border border-dashed border-white/60 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em]">Demo</span>}
      </div>
      <p className="mt-5 font-display text-[clamp(3.5rem,6vw,5rem)] leading-[0.85]">
        <CountUp value={pool.totalCents} cents format="euro" />
      </p>
      <p className="mt-3 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-white/80">
        {season.name}
        {season.status === "active" ? " · so far" : " · final"}
      </p>
      <table className="nums mt-6 w-full text-[0.9375rem]">
        <caption className="sr-only">Prize split</caption>
        <tbody>
          {pool.places.map((p) => (
            <tr key={p.position} className="border-t border-white/25">
              <th scope="row" className="py-2 text-left font-semibold text-white/85">
                {ordinal(p.position)}
              </th>
              <td className="py-2 text-right font-display text-[1.25rem]">{formatEuro(p.amountCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pool.note && <p className="mt-4 text-[0.8125rem] text-white/75">{pool.note}</p>}
    </Reveal>
  );
}
