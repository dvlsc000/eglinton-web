import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { FeaturedEvent, SiteContent, Announcement } from "@/content/types";
import type { Season, Standings, Tournament } from "@/domain/schemas";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { ButtonLink, DemoTag, Eyebrow, ErrorState, TextLink } from "@/components/ui/primitives";
import { TournamentRow, TournamentTableHead } from "@/components/tournaments/bits";
import { RankDelta } from "@/components/leagues/bits";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CountUp, Drift, GrowBar, Magnetic, Marquee, Parallax, SplitReveal } from "@/components/motion/kinetic";
import { ChipTowers } from "@/components/home/chip-towers";
import { formatCalendarDate, formatDayMonth, formatEuro, formatTime, formatWeekdayShort, buyInTotal } from "@/domain/format";

/* -------------------------------------------------------------------------- */
/* Tonight ticker                                                             */
/* -------------------------------------------------------------------------- */

export function TonightTicker({ items }: { items: Tournament[] }) {
  if (!items.length) return null;
  return (
    <Marquee label="Upcoming tournaments" className="surface-paper border-b border-ink-950 py-4" baseVelocity={-2.4}>
      {items.map((t) => (
        <Link key={t.id} href={`/tournaments/${t.id}`} className="group flex items-center font-display text-[clamp(1.5rem,2.4vw,2.25rem)] uppercase leading-none">
          <span className="nums px-5 text-red-brand">{formatWeekdayShort(t.startsAt)} {formatTime(t.startsAt)}</span>
          <span className="transition-colors group-hover:text-red-brand">{t.name}</span>
          <span className="nums px-5 text-fg-muted">{formatEuro(buyInTotal(t.buyIn))}</span>
          <span aria-hidden className="px-3 text-red-brand">●</span>
        </Link>
      ))}
    </Marquee>
  );
}

export function AnnouncementStrip({ items, isDemo }: { items: Announcement[]; isDemo: boolean }) {
  if (!items.length) return null;
  return (
    <div className="surface-ink border-b border-line">
      <div className="container-site">
        {items.map((a) => (
          <p key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 text-[0.9375rem]">
            <span className="bg-red-brand px-2 py-1 text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-white">News</span>
            <span className="font-semibold">{a.text}</span>
            {a.href && (
              <Link href={a.href} className="inline-flex items-center gap-1 text-[0.8125rem] font-extrabold uppercase tracking-[0.08em] text-accent-text">
                <span className="link-rule pb-0.5">{a.linkLabel ?? "Read more"}</span>
                <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2.25} />
              </Link>
            )}
            {isDemo && a.verification === "demo" && <DemoTag className="ml-auto" />}
          </p>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SectionTitle({ id, lines, action, eyebrow }: { id: string; lines: { text: string; outline?: boolean }[]; action?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <Reveal>
            <Eyebrow rule className="mb-5">
              {eyebrow}
            </Eyebrow>
          </Reveal>
        )}
        <SplitReveal id={id} lines={lines} className="type-display-l" />
      </div>
      {action && <Reveal delay={0.2}>{action}</Reveal>}
    </div>
  );
}

export function UpcomingSection({ result, isDemo }: { result: { ok: true; data: Tournament[] } | { ok: false; error: { message: string } }; isDemo: boolean }) {
  return (
    <section className="surface-ink py-24 md:py-32" aria-labelledby="upcoming-title">
      <div className="container-site">
        <SectionTitle
          id="upcoming-title"
          eyebrow="Tournament schedule"
          lines={[{ text: "This week" }, { text: "at the tables", outline: true }]}
          action={<TextLink href="/schedule">Full schedule</TextLink>}
        />
        <Reveal delay={0.1}>
          <p className="type-lede mt-6 max-w-xl text-fg-muted">
            Pick your game, check the buy-in and come down. Registration is at the club.
            {isDemo && <DemoTag className="ml-3 align-middle" />}
          </p>
        </Reveal>
        <div className="mt-12">
          {result.ok ? (
            <>
              <TournamentTableHead />
              <RevealGroup step={0.07}>
                <ul>
                  {result.data.map((t, i) => (
                    <RevealItem as="li" key={t.id}>
                      <TournamentRow t={t} highlight={i === 0} />
                    </RevealItem>
                  ))}
                </ul>
              </RevealGroup>
            </>
          ) : (
            <ErrorState detail={result.error.message} />
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function FirstVisit({ visit }: { visit: SiteContent["visit"] }) {
  const steps = [
    { n: "01", t: "Join at the door", b: "Membership is €20 a year and open to the public. Bring photo ID — a driving licence or passport — and your address.", k: "€20", kl: "a year" },
    { n: "02", t: "Pick your game", b: "Hold'em and Omaha tournaments and cash games, plus blackjack, roulette and auto gaming in the house.", k: "4+", kl: "ways to play" },
    { n: "03", t: "Take your seat", b: "The restaurant has snacks, tea and coffee, and players get complimentary drinks at the tables.", k: "On us", kl: "drinks while you play" },
  ];
  return (
    <section className="surface-paper py-24 md:py-32" aria-labelledby="first-title">
      <div className="container-site">
        <SectionTitle id="first-title" eyebrow="New here?" lines={[{ text: "First time?" }, { text: "It's easy.", outline: true }]} />
        <RevealGroup step={0.12}>
          <ol className="mt-16 grid gap-px border-y border-line bg-line md:grid-cols-3">
            {steps.map((s) => (
              <RevealItem as="li" key={s.n} className="group relative flex flex-col justify-between gap-12 overflow-hidden bg-bg p-7 md:p-9">
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-red-brand transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                <div>
                  <span className="nums font-display text-[5.5rem] leading-[0.8] text-red-brand">{s.n}</span>
                  <h3 className="type-display-s mt-6">{s.t}</h3>
                  <p className="mt-3 text-fg-muted">{s.b}</p>
                </div>
                <p className="flex items-baseline gap-3 border-t border-line pt-5">
                  <span className="font-display text-[2.5rem] uppercase leading-none">{s.k}</span>
                  <span className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-fg-faint">{s.kl}</span>
                </p>
              </RevealItem>
            ))}
          </ol>
        </RevealGroup>
        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-4">
          <ButtonLink href="/visit#membership" size="lg" arrow>
            How to join
          </ButtonLink>
          <a href={visit.phoneHref} className="nums text-[0.875rem] font-extrabold uppercase tracking-[0.08em] link-rule pb-1">
            Questions? Call {visit.phoneDisplay}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function FeaturedSeries({ event, tournaments, isDemo }: { event: FeaturedEvent; tournaments: Tournament[]; isDemo: boolean }) {
  const main = tournaments.filter((t) => !t.formats.includes("Satellite"));
  const totalGtd = main.reduce((s, t) => s + (t.guaranteeCents ?? 0), 0);
  return (
    <section className="surface-ink relative overflow-hidden border-y border-line" aria-labelledby={`feature-${event.id}`}>
      <Drift distance={160} className="pointer-events-none select-none border-b border-line py-4" >
        <p aria-hidden className="whitespace-nowrap font-display text-[clamp(5rem,14vw,14rem)] uppercase leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--line-strong)]">
          {event.title} · {event.title} · {event.title}
        </p>
      </Drift>
      <div className="container-site grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal className="flex items-center gap-3">
            <Eyebrow rule>{event.kicker}</Eyebrow>
            {isDemo && event.verification === "demo" && <DemoTag />}
          </Reveal>
          <SplitReveal id={`feature-${event.id}`} lines={[{ text: event.title }]} className="type-display-l mt-6" />
          <Reveal delay={0.15}>
            <p className="type-lede mt-6 text-fg-muted">{event.summary}</p>
          </Reveal>
          {totalGtd > 0 && (
            <Reveal delay={0.2} className="mt-10 border-t border-line pt-6">
              <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.14em] text-fg-faint">Guaranteed across the series</p>
              <p className="mt-2 font-display text-[clamp(4rem,8vw,7rem)] leading-[0.85] text-accent-text">
                <CountUp value={totalGtd} cents format="euro" />
              </p>
            </Reveal>
          )}
          <Reveal delay={0.25} className="mt-10">
            <Magnetic>
              <ButtonLink href={`/schedule?series=${event.id}`} size="lg" arrow>
                Series schedule
              </ButtonLink>
            </Magnetic>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <Reveal className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
            <ChipTowers
              image={event.image}
              events={main.map((t) => ({
                id: t.id,
                name: t.name.replace(/^.*·\s*/, ""),
                day: `${formatWeekdayShort(t.startsAt)} ${formatDayMonth(t.startsAt)}`,
                guaranteeCents: t.guaranteeCents ?? null,
                guaranteeLabel: t.guaranteeCents ? formatEuro(t.guaranteeCents) : "—",
              }))}
            />
          </Reveal>
          {main.length > 0 && (
            <RevealGroup step={0.08}>
              <ol className="mt-2">
                {main.map((t, i) => (
                  <RevealItem as="li" key={t.id}>
                    <Link href={`/tournaments/${t.id}`} className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b border-line py-5 transition-colors hover:bg-fg/[0.03]">
                      <span className="nums font-display text-[2.5rem] leading-none text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        <span className="block font-display text-[1.75rem] uppercase leading-none transition-colors group-hover:text-accent-text">{t.name.replace(/^.*·\s*/, "")}</span>
                        <span className="nums mt-1 block text-[0.75rem] font-bold uppercase tracking-[0.08em] text-fg-faint">
                          {formatWeekdayShort(t.startsAt)} {formatDayMonth(t.startsAt)} · {formatTime(t.startsAt)} · {formatEuro(buyInTotal(t.buyIn))}
                        </span>
                      </span>
                      <span className="nums text-right">
                        <span className="block font-display text-[1.75rem] leading-none">{t.guaranteeCents ? formatEuro(t.guaranteeCents) : "—"}</span>
                        <span className="block text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-fg-faint">GTD</span>
                      </span>
                    </Link>
                  </RevealItem>
                ))}
              </ol>
            </RevealGroup>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function LeaderboardPreview({ standings, isDemo }: { standings: Standings | null; isDemo: boolean }) {
  if (!standings) return null;
  const { league, season, entries } = standings;
  const primary = league.metrics[0];
  const top = entries.slice(0, 6);
  const max = top[0]?.values[primary.key] ?? 1;
  const showDelta = entries.some((e) => e.previousRank != null);
  return (
    <section className="surface-ink py-24 md:py-32" aria-labelledby="lb-title">
      <div className="container-site">
        <SectionTitle
          id="lb-title"
          eyebrow={`${league.name} · ${season.name}`}
          lines={[{ text: "League table" }]}
          action={
            <div className="flex flex-wrap items-center gap-4">
              {isDemo && <DemoTag>Fictional players</DemoTag>}
              <TextLink href="/leaderboard">Full leaderboard</TextLink>
            </div>
          }
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-fg-muted">
            {formatCalendarDate(season.startsOn)} – {formatCalendarDate(season.endsOn)}. Every cash in a weekly tournament puts you on the board.
          </p>
        </Reveal>
        <ol className="mt-12 border-t border-line-strong">
          {top.map((e, i) => (
            <li key={e.player.id} className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b border-line py-4 md:grid-cols-[5.5rem_1fr_minmax(8rem,18rem)_4rem_6rem] md:gap-6">
              <span className={`nums font-display text-[clamp(2.75rem,4.4vw,4rem)] leading-none ${e.rank <= 2 ? "text-accent-text" : ""}`}>
                {String(e.rank).padStart(2, "0")}
              </span>
              <span className="text-[1.125rem] font-bold md:text-[1.375rem]">{e.player.displayName}</span>
              <GrowBar ratio={(e.values[primary.key] ?? 0) / max} delay={0.1 + i * 0.07} className="hidden md:block" barClassName={e.rank === 1 ? "bg-red-brand" : undefined} />
              {showDelta ? <RankDelta rank={e.rank} previousRank={e.previousRank} className="hidden justify-end md:inline-flex" /> : <span className="hidden md:block" />}
              <span className="text-right font-display text-[clamp(2rem,3vw,2.75rem)] leading-none">
                <CountUp value={e.values[primary.key] ?? 0} />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function LeagueEntryPoints({ tournamentSeason, cashSeason, isDemo }: { tournamentSeason: Season | null; cashSeason: Season | null; isDemo: boolean }) {
  const items = [
    { href: "/leagues/tournament", eyebrow: "Tournament League", title: "Every cash scores", body: "Finish in the money in a weekly tournament and you earn points, weighted by field size. Twelve-week seasons.", cents: tournamentSeason?.prizePool?.totalCents, label: "League fund this season" },
    { href: "/leagues/cash", eyebrow: "Cash League", title: "Every hour counts", body: "Time at the cash tables adds up across the month. The month's most dedicated players share the fund.", cents: cashSeason?.prizePool?.totalCents, label: "Monthly league fund" },
  ];
  return (
    <section className="surface-ink pb-24 md:pb-32" aria-label="Leagues">
      <div className="container-site grid gap-px bg-line md:grid-cols-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="group relative flex flex-col justify-between gap-14 overflow-hidden bg-bg p-8 md:p-10">
            <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-red-brand transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
            <div className="relative">
              <p className="type-eyebrow text-accent-text transition-colors group-hover:text-white">{it.eyebrow}</p>
              <h3 className="type-display-m mt-5 transition-colors group-hover:text-white">{it.title}</h3>
              <p className="mt-4 max-w-md text-fg-muted transition-colors group-hover:text-white/85">{it.body}</p>
            </div>
            <div className="relative flex items-end justify-between gap-6">
              {it.cents != null && (
                <p>
                  <span className="block font-display text-[clamp(3rem,5vw,4.5rem)] leading-none transition-colors group-hover:text-white">
                    <CountUp value={it.cents} cents format="euro" />
                  </span>
                  <span className="mt-2 block text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-fg-faint transition-colors group-hover:text-white/80">
                    {it.label}
                    {isDemo && " · demo"}
                  </span>
                </p>
              )}
              <span className="inline-flex size-14 shrink-0 items-center justify-center border border-fg transition-all duration-500 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-red-brand">
                <ArrowUpRight aria-hidden className="size-6" strokeWidth={2} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function GamesSection({ club }: { club: SiteContent["club"] }) {
  return (
    <section className="surface-ink overflow-hidden border-t border-line py-24 md:py-32" aria-labelledby="games-title">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionTitle id="games-title" eyebrow="The club" lines={[{ text: "More than" }, { text: "the card room", outline: true }]} />
          <Reveal delay={0.1}>
            <p className="type-lede mt-6 text-fg-muted">{club.intro}</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10">
            <TextLink href="/club">About the club</TextLink>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <ul className="border-t border-line-strong">
            {club.offerings.map((o, i) => (
              <li key={o.id} className="group relative border-b border-line">
                <Reveal delay={i * 0.05} className="relative grid grid-cols-[3rem_1fr] gap-4 py-6 md:grid-cols-[4rem_1fr_1.2fr] md:items-baseline md:gap-6">
                  <span className="nums font-display text-[1.5rem] text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] uppercase leading-[0.9] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                    {o.name}
                  </h3>
                  <p className="col-start-2 text-fg-muted md:col-start-auto">{o.summary}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <Parallax offset={40} className="aspect-[4/3]">
              <PhotoSlot image={club.images.tables} tone="night" className="absolute inset-0" />
            </Parallax>
            <Parallax offset={70} className="aspect-[4/3]">
              <PhotoSlot image={club.images.bar} tone="claret" className="absolute inset-0" />
            </Parallax>
          </div>
        </div>
      </div>
    </section>
  );
}
