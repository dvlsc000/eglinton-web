import type { Metadata } from "next";
import { getScheduleWindow, isDemoData } from "@/data/queries";
import { getContent } from "@/content/provider";
import { PageHeader } from "@/components/layout/page-header";
import { ScheduleExplorer, type ScheduleInitial } from "@/components/tournaments/schedule-explorer";
import { DemoTag, ErrorState } from "@/components/ui/primitives";
import { TournamentFormat } from "@/domain/schemas";
import { InviteBand } from "@/components/layout/invite-band";

export const metadata: Metadata = {
  title: "Tournament schedule",
  description: "Upcoming Texas Hold'em and Omaha tournaments at The Eglinton, Galway: start times, buy-ins, starting stacks and guarantees.",
};

const ymd = /^\d{4}-\d{2}-\d{2}$/;

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const [{ today, firstWeek, lastDayExclusive, res }, content] = await Promise.all([getScheduleWindow(), getContent()]);
  const isDemo = isDemoData();

  const initial: ScheduleInitial = {
    view: one("view") === "calendar" ? "calendar" : "list",
    week: one("week")?.match(ymd) ? one("week")! : null,
    day: one("day")?.match(ymd) ? one("day")! : null,
    game: one("game") === "NLHE" || one("game") === "PLO" ? (one("game") as "NLHE" | "PLO") : "all",
    formats: (one("format") ?? "")
      .split(",")
      .map((f) => TournamentFormat.safeParse(f))
      .filter((r) => r.success)
      .map((r) => r.data!),
    q: one("q") ?? "",
    series: one("series") ?? null,
  };

  const seriesNames = Object.fromEntries(content.featuredEvents.map((e) => [e.id, e.title]));

  return (
    <>
      <PageHeader
        eyebrow="Tournament schedule"
        title={[{ text: "Pick your" }, { text: "game.", outline: true }]}
        lede="Every published tournament from last week to six weeks out — start times, buy-ins, stacks and guarantees. Find one you like and come down."
        aside={isDemo ? <DemoTag>Demo schedule · relative dates</DemoTag> : undefined}
      />
      <section className="surface-ink pb-28">
        <div className="container-site">
          {res.ok ? (
            <ScheduleExplorer
              tournaments={res.data}
              today={today}
              firstWeek={firstWeek}
              lastDayExclusive={lastDayExclusive}
              initial={initial}
              seriesNames={seriesNames}
            />
          ) : (
            <ErrorState title="The schedule couldn't be loaded" detail={res.error.message} />
          )}
        </div>
      </section>
      <InviteBand phoneHref={content.visit.phoneHref} phoneDisplay={content.visit.phoneDisplay} />
    </>
  );
}
