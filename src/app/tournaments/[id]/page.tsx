import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { getTournament, isDemoData } from "@/data/queries";
import { getContent } from "@/content/provider";
import { PageHeader } from "@/components/layout/page-header";
import { DemoTag, ErrorState, Eyebrow, TextLink, buttonClasses } from "@/components/ui/primitives";
import { StatusBadge, TournamentRow } from "@/components/tournaments/bits";
import { AddToCalendar } from "@/components/tournaments/add-to-calendar";
import { InviteBand } from "@/components/layout/invite-band";
import type { Tournament, TournamentResult, TournamentStructure } from "@/domain/schemas";
import {
  VARIANT_LABEL,
  buyInTotal,
  formatBuyIn,
  formatEuro,
  formatFullDate,
  formatInteger,
  formatTime,
  ordinal,
} from "@/domain/format";

export async function generateMetadata({ params }: PageProps<"/tournaments/[id]">): Promise<Metadata> {
  const { id } = await params;
  const res = await getTournament(id);
  const t = res.ok ? res.data?.tournament : null;
  return t
    ? { title: `${t.name}, ${formatFullDate(t.startsAt)}`, description: `${VARIANT_LABEL[t.variant]} at The Eglinton, Galway. Buy-in ${formatEuro(buyInTotal(t.buyIn))}, ${formatInteger(t.startingStack)} starting chips.` }
    : { title: "Tournament" };
}

export default async function TournamentPage({ params }: PageProps<"/tournaments/[id]">) {
  const { id } = await params;
  const [res, content] = await Promise.all([getTournament(id), getContent()]);
  const isDemo = isDemoData();

  if (!res.ok) {
    return (
      <section className="surface-ink py-24">
        <div className="container-site">
          <ErrorState title="This tournament couldn't be loaded" detail={res.error.message} />
        </div>
      </section>
    );
  }
  if (!res.data) notFound();
  const { tournament: t, structure, result, related, leagues } = res.data;
  const series = t.seriesId ? content.featuredEvents.find((e) => e.id === t.seriesId) : null;
  const lateRegTime = structure ? clockAtEndOfLevel(t, structure, t.lateRegLevel) : null;
  const upcoming = t.status === "scheduled" || t.status === "registration-open" || t.status === "late-registration";

  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/schedule", label: "Schedule" },
          { href: `/tournaments/${t.id}`, label: t.name },
        ]}
        eyebrow={series ? series.title : t.formats.includes("Satellite") ? "Satellite" : "Weekly tournament"}
        title={[{ text: t.name }]}
        size="l"
        lede={
          <span className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-fg">
              {formatFullDate(t.startsAt)} · <span className="nums">{formatTime(t.startsAt)}</span>
            </span>
            <StatusBadge status={t.status} />
            {isDemo && <DemoTag />}
          </span>
        }
      />

      {t.status === "cancelled" && (
        <div className="surface-ink">
          <div className="container-site">
            <p role="status" className="border-l-2 border-accent bg-bg-raised px-5 py-4">
              <strong className="font-semibold">This tournament is cancelled.</strong>{" "}
              <span className="text-fg-muted">{t.statusNote}</span>{" "}
              <Link href="/schedule" className="font-semibold text-accent-text underline underline-offset-4">
                See other events
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Key facts */}
      <section className="surface-ink" aria-label="Key details">
        <div className="container-site">
          <dl className="grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-3 xl:grid-cols-6">
            <Fact label="Buy-in" value={formatEuro(buyInTotal(t.buyIn))} sub={formatBuyIn(t.buyIn)} />
            <Fact label="Starting stack" value={formatInteger(t.startingStack)} sub="chips" />
            <Fact label="Guarantee" value={t.guaranteeCents ? formatEuro(t.guaranteeCents) : "—"} sub={t.guaranteeCents ? "prize pool" : "no guarantee"} accent={!!t.guaranteeCents} />
            <Fact label="Game" value={t.variant === "NLHE" ? "Hold'em" : "Omaha"} sub={VARIANT_LABEL[t.variant]} />
            <Fact label="Entries" value={entryHeadline(t)} sub={entrySub(t)} />
            <Fact
              label="Late registration"
              value={lateRegTime ?? `Level ${t.lateRegLevel}`}
              sub={`until end of level ${t.lateRegLevel}`}
            />
          </dl>
        </div>
      </section>

      <section className="surface-ink py-16 md:py-24">
        <div className="container-site grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-8">
            {t.description && <p className="type-display-s max-w-2xl text-fg">{t.description}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              {t.formats.map((f) => (
                <span key={f} className="border border-line-strong px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
                  {f}
                </span>
              ))}
            </div>

            {result ? (
              <Results result={result} />
            ) : t.status === "completed" ? (
              <p className="mt-14 border-y border-line py-8 text-fg-muted">
                Results for this tournament will be published here shortly.
              </p>
            ) : null}

            {structure && <Structure t={t} structure={structure} />}
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-[calc(var(--header-offset,var(--header-h))+2rem)] lg:transition-[top] lg:duration-[450ms]">
              {upcoming && (
                <div className="border border-line-strong bg-bg-raised">
                  <div className="h-[3px] bg-accent" />
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <Eyebrow>How to enter</Eyebrow>
                      <DemoTag>Illustrative</DemoTag>
                    </div>
                    <p className="mt-4 text-fg-muted">
                      Register in person at the club before the start, or during late registration until the end of level {t.lateRegLevel}
                      {lateRegTime ? ` (about ${lateRegTime})` : ""}. Membership is required.
                    </p>
                    <p className="mt-3 text-[0.8125rem] text-fg-faint">
                      No online registration or payment. Process to be confirmed with the club before launch.
                    </p>
                    <div className="mt-6 grid gap-3">
                      <a href={content.visit.phoneHref} className={buttonClasses("primary", "md", "w-full")}>
                        <Phone aria-hidden className="size-4" strokeWidth={1.75} />
                        <span>Call {content.visit.phoneDisplay}</span>
                      </a>
                      <AddToCalendar
                        id={t.id}
                        title={`${t.name} · The Eglinton`}
                        startsAt={t.startsAt}
                        durationHours={5}
                        location={content.visit.address.join(", ")}
                        url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/tournaments/${t.id}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {leagues.length > 0 && (
                <div className="border border-line p-6">
                  <Eyebrow>League event</Eyebrow>
                  <p className="mt-3 text-fg-muted">
                    Counts toward the {leagues[0].name}. Every in-the-money finish earns points.
                  </p>
                  <TextLink href={`/leagues/${leagues[0].kind}`} className="mt-4">
                    {leagues[0].name} standings
                  </TextLink>
                </div>
              )}

              {series && (
                <div className="border border-line p-6">
                  <Eyebrow>{series.title}</Eyebrow>
                  <p className="mt-3 text-fg-muted">{series.summary}</p>
                  <TextLink href={`/schedule?series=${series.id}`} className="mt-4">
                    All series events
                  </TextLink>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="surface-ink border-t border-line py-16 md:py-24" aria-labelledby="related-title">
          <div className="container-site">
            <div className="flex items-end justify-between gap-6">
              <h2 id="related-title" className="type-display-m">
                You might also play
              </h2>
              <TextLink href="/schedule" className="hidden sm:inline-flex">
                Full schedule
              </TextLink>
            </div>
            <ul className="mt-10 border-t border-line">
              {related.map((r) => (
                <li key={r.id}>
                  <TournamentRow t={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {upcoming && (
        <InviteBand
          title={[{ text: "See you" }, { text: "at the table.", outline: true }]}
          lede={`${t.name} starts at ${formatTime(t.startsAt)} on ${formatFullDate(t.startsAt)}. Register in person at the club. New here? Membership is €20 a year.`}
          phoneHref={content.visit.phoneHref}
          phoneDisplay={content.visit.phoneDisplay}
        />
      )}
    </>
  );
}

function Fact({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-bg px-4 py-6 sm:px-6 md:py-8">
      <dt className="type-eyebrow text-fg-faint">{label}</dt>
      <dd className={`nums mt-3 font-display text-[2rem] uppercase leading-none md:text-[2.5rem] ${accent ? "text-detail" : ""}`}>{value}</dd>
      {sub && <dd className="mt-2 text-[0.8125rem] text-fg-muted">{sub}</dd>}
    </div>
  );
}

function entryHeadline(t: Tournament) {
  const r = t.entryRules;
  if (r.type === "freezeout") return "Freezeout";
  if (r.type === "rebuy") return r.maxEntries ? `${r.maxEntries} rebuys` : "Rebuys";
  return r.maxEntries ? `Up to ${r.maxEntries}` : "Re-entry";
}

function entrySub(t: Tournament) {
  const r = t.entryRules;
  const parts: string[] = [];
  if (r.type === "rebuy" && !r.maxEntries) parts.push("unlimited");
  if (r.untilLevel) parts.push(`${r.type === "rebuy" ? "rebuys" : "entries"} until level ${r.untilLevel}`);
  if (r.addOn) parts.push(`add-on ${formatEuro(r.addOn.costCents)} for ${formatInteger(r.addOn.chips)}`);
  return parts.join(" · ") || "one entry per player";
}

function clockAtEndOfLevel(t: Tournament, s: TournamentStructure, level: number) {
  let minutes = 0;
  for (const l of s.levels) {
    minutes += l.minutes;
    if (l.kind === "level" && l.level === level) break;
  }
  return formatTime(new Date(new Date(t.startsAt).getTime() + minutes * 60_000));
}

function Structure({ t, structure }: { t: Tournament; structure: TournamentStructure }) {
  const start = new Date(t.startsAt).getTime();
  const offsets = structure.levels.reduce<number[]>((acc, l, i) => [...acc, i === 0 ? 0 : acc[i - 1] + structure.levels[i - 1].minutes], []);
  const rows = structure.levels.map((l, i) => ({ l, at: formatTime(new Date(start + offsets[i] * 60_000)) }));
  const hasAnte = structure.levels.some((l) => l.kind === "level" && l.ante > 0);
  return (
    <section className="mt-16" aria-labelledby="structure-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow rule>Structure</Eyebrow>
          <h2 id="structure-title" className="type-display-m mt-4">
            {structure.name}
          </h2>
        </div>
        <p className="text-[0.8125rem] text-fg-faint">Times are estimates from the scheduled start.</p>
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="nums w-full min-w-[30rem] text-left text-[0.9375rem]">
          <thead>
            <tr className="type-eyebrow border-b border-line-strong text-fg-faint">
              <th scope="col" className="py-3 pr-4 font-semibold">Level</th>
              <th scope="col" className="py-3 pr-4 font-semibold">Blinds</th>
              {hasAnte && <th scope="col" className="py-3 pr-4 font-semibold">BB ante</th>}
              <th scope="col" className="py-3 pr-4 font-semibold">Length</th>
              <th scope="col" className="py-3 text-right font-semibold">Approx. start</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ l, at }, i) =>
              l.kind === "break" ? (
                <tr key={`b${i}`} className="border-b border-line bg-fg/[0.03] text-fg-muted">
                  <td colSpan={hasAnte ? 3 : 2} className="py-2.5 pr-4 text-[0.8125rem] italic">{l.label}</td>
                  <td className="py-2.5 pr-4 text-[0.8125rem]">{l.minutes} min</td>
                  <td className="py-2.5 text-right text-[0.8125rem]">{at}</td>
                </tr>
              ) : (
                <tr key={l.level} className="border-b border-line transition-colors hover:bg-fg/[0.025]">
                  <th scope="row" className="py-2.5 pr-4 font-semibold">
                    {l.level}
                    {l.level === t.lateRegLevel && (
                      <span className="ml-3 align-middle text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-detail">Late reg closes</span>
                    )}
                  </th>
                  <td className="py-2.5 pr-4">
                    {formatInteger(l.smallBlind)} / {formatInteger(l.bigBlind)}
                  </td>
                  {hasAnte && <td className="py-2.5 pr-4 text-fg-muted">{l.ante ? formatInteger(l.ante) : "—"}</td>}
                  <td className="py-2.5 pr-4 text-fg-muted">{l.minutes} min</td>
                  <td className="py-2.5 text-right text-fg-muted">{at}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Results({ result }: { result: TournamentResult }) {
  return (
    <section className="mt-14" aria-labelledby="results-title">
      <Eyebrow rule>Result</Eyebrow>
      <h2 id="results-title" className="type-display-m mt-4">
        Final standings
      </h2>
      <dl className="nums mt-8 grid grid-cols-3 border-y border-line">
        <div className="py-5 pr-4">
          <dt className="type-eyebrow text-fg-faint">Entries</dt>
          <dd className="mt-2 font-display text-[1.75rem] leading-none">{result.entries}</dd>
        </div>
        <div className="border-l border-line px-4 py-5">
          <dt className="type-eyebrow text-fg-faint">{result.rebuys ? "Rebuys · add-ons" : "Places paid"}</dt>
          <dd className="mt-2 font-display text-[1.75rem] leading-none">
            {result.rebuys ? `${result.rebuys} · ${result.addOns}` : result.payouts.length}
          </dd>
        </div>
        <div className="border-l border-line px-4 py-5">
          <dt className="type-eyebrow text-fg-faint">Prize pool</dt>
          <dd className="mt-2 font-display text-[1.75rem] leading-none text-detail">{formatEuro(result.prizePoolCents)}</dd>
          {result.overlay && <dd className="mt-1 text-[0.75rem] text-fg-muted">Guarantee met by the club</dd>}
        </div>
      </dl>
      <table className="nums mt-6 w-full text-left">
        <thead>
          <tr className="type-eyebrow border-b border-line-strong text-fg-faint">
            <th scope="col" className="w-16 py-3 font-semibold">Place</th>
            <th scope="col" className="py-3 font-semibold">Player</th>
            <th scope="col" className="py-3 text-right font-semibold">Prize</th>
            <th scope="col" className="hidden py-3 text-right font-semibold sm:table-cell">League pts</th>
          </tr>
        </thead>
        <tbody>
          {result.payouts.map((p) => (
            <tr key={p.position} className="border-b border-line">
              <td className="py-3">
                <span className={`font-display italic ${p.position <= 3 ? "text-[1.375rem] text-detail" : "text-[1.125rem] text-fg-muted"}`}>
                  {ordinal(p.position)}
                </span>
              </td>
              <td className={`py-3 ${p.position === 1 ? "font-semibold" : ""}`}>{p.player.displayName}</td>
              <td className="py-3 text-right font-semibold">{formatEuro(p.prizeCents)}</td>
              <td className="hidden py-3 text-right text-fg-muted sm:table-cell">{p.leaguePoints || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
