import type { Metadata } from "next";
import { getContent } from "@/content/provider";
import { PageHeader } from "@/components/layout/page-header";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { ButtonLink, Eyebrow, VerifyMark } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";
import { InviteBand } from "@/components/layout/invite-band";
import { Parallax } from "@/components/motion/kinetic";

export const metadata: Metadata = {
  title: "The club",
  description: "The Eglinton Casino & Card Club opened on Eglinton Street, Galway in July 2007: poker tournaments and cash games, blackjack and roulette.",
};

export default async function ClubPage() {
  const { club, visit } = await getContent();
  return (
    <>
      <PageHeader
        eyebrow="The club"
        title={[{ text: "Since" }, { text: "July 2007.", outline: true }]}
        lede={club.intro}
      />

      <section className="surface-ink pb-24">
        <div className="container-site">
          <Parallax offset={90} className="aspect-[16/9] w-full md:aspect-[21/9]">
            <PhotoSlot image={club.images.room} tone="claret" className="absolute inset-0" sizes="100vw" />
          </Parallax>
        </div>
      </section>

      <section className="surface-paper py-24 md:py-32">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Eyebrow rule>The story</Eyebrow>
            <dl className="mt-8 border-t border-line">
              {club.facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-4">
                  <dt className="type-eyebrow pt-1 text-fg-faint">{f.label}</dt>
                  <dd className="font-medium">
                    {f.value}
                    <VerifyMark verification={f.verification} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.75rem] text-fg-faint">Facts from the club&rsquo;s current website.</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {club.story.map((p, i) => (
              <Reveal key={p} delay={i * 0.05}>
                <p className={i === 0 ? "text-[clamp(1.375rem,1.6vw+0.8rem,2rem)] font-semibold leading-snug tracking-[-0.01em] text-fg" : "type-lede mt-8 text-fg-muted"}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-ink py-24 md:py-32" aria-labelledby="games-title">
        <div className="container-site">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Eyebrow rule>On the floor</Eyebrow>
              <h2 id="games-title" className="type-display-l mt-6">
                What&rsquo;s played here.
              </h2>
            </div>
          </div>
          <ol className="mt-14 grid gap-px border-y border-line bg-line md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
            {club.offerings.map((o, i) => (
              <li key={o.id} className={`bg-bg py-10 md:px-8 ${i === 0 ? "lg:row-span-2" : ""} ${i % 2 === 0 ? "md:pl-0" : ""}`}>
                <span className="nums font-display text-[1.5rem] text-detail">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={`mt-4 font-display uppercase ${i === 0 ? "text-[clamp(2.75rem,4vw,3.75rem)]" : "text-[2.25rem]"} leading-[0.9]`}>
                  {o.name}
                  <VerifyMark verification={o.verification} />
                </h3>
                <p className="mt-3 max-w-sm text-fg-muted">{o.summary}</p>
                {i === 0 && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href="/schedule" arrow>Schedule</ButtonLink>
                    <ButtonLink href="/leagues/tournament" variant="secondary">Leagues</ButtonLink>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="surface-ink pb-24 md:pb-32">
        <div className="container-site grid gap-4 md:grid-cols-12 md:gap-6">
          <PhotoSlot image={club.images.tables} tone="felt" className="aspect-[4/3] md:col-span-7" />
          <PhotoSlot image={club.images.bar} tone="claret" className="aspect-[4/3] md:col-span-5 md:mt-24 md:aspect-[4/5]" />
        </div>
      </section>
      <InviteBand title={[{ text: "Come and" }, { text: "see for yourself.", outline: true }]} phoneHref={visit.phoneHref} phoneDisplay={visit.phoneDisplay} />
    </>
  );
}
