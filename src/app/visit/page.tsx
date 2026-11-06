import type { Metadata } from "next";
import { ArrowUpRight, Plus } from "lucide-react";
import { getContent } from "@/content/provider";
import { PageHeader } from "@/components/layout/page-header";
import { Eyebrow, VerifyMark } from "@/components/ui/primitives";
import { ContactForm, CopyButton, MapPanel } from "@/components/visit/visit-widgets";

export const metadata: Metadata = {
  title: "Visit & contact",
  description: "Find The Eglinton on Eglinton Street, Galway. Phone, email, directions and membership details.",
};

export default async function VisitPage() {
  const { visit } = await getContent();
  const address = visit.address.join(", ");
  return (
    <>
      <PageHeader
        eyebrow="Visit"
        title={[{ text: "Come in." }, { text: "Take a seat.", outline: true }]}
        lede="The Eglinton is on Eglinton Street in the centre of Galway city. Here's how to find us, how to join, and how to get in touch."
      />

      <section className="surface-ink pb-24" aria-labelledby="find-title">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 id="find-title" className="sr-only">
              Find us
            </h2>
            <dl className="border-t border-line">
              <div className="border-b border-line py-6">
                <dt className="type-eyebrow text-fg-faint">Address</dt>
                <dd className="mt-3">
                  <address className="not-italic text-[1.125rem] leading-relaxed">
                    {visit.address.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <CopyButton value={address} label="Copy address" />
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visit.mapQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 border border-line px-3 text-[0.8125rem] font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                    >
                      Directions <ArrowUpRight aria-hidden className="size-3.5" />
                    </a>
                  </div>
                </dd>
              </div>
              <div className="border-b border-line py-6">
                <dt className="type-eyebrow text-fg-faint">Phone</dt>
                <dd className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <a href={visit.phoneHref} className="nums font-display text-[2rem] leading-none hover:text-accent-text">
                    {visit.phoneDisplay}
                  </a>
                  <span className="nums text-[0.875rem] text-fg-faint">{visit.phoneIntl} from outside Ireland</span>
                </dd>
              </div>
              <div className="border-b border-line py-6">
                <dt className="type-eyebrow text-fg-faint">Email</dt>
                <dd className="mt-3 flex flex-wrap items-center gap-3">
                  <a href={`mailto:${visit.email}`} className="break-all text-[1.125rem] hover:text-accent-text">
                    {visit.email}
                  </a>
                  <CopyButton value={visit.email} label="Copy" />
                </dd>
              </div>
              {visit.hours.map((h) => (
                <div key={h.label} className="border-b border-line py-6">
                  <dt className="type-eyebrow text-fg-faint">{h.label}</dt>
                  <dd className="mt-3 text-[1.0625rem]">
                    {h.value}
                    <VerifyMark verification={h.verification} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <MapPanel lat={visit.coordinates.lat} lng={visit.coordinates.lng} query={visit.mapQuery} approximate={visit.coordinates.verification !== "confirmed"} />
          </div>
        </div>
      </section>

      <section id="membership" className="surface-paper scroll-mt-24 py-24 md:py-32" aria-labelledby="membership-title">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Eyebrow rule>Membership</Eyebrow>
            <h2 id="membership-title" className="type-display-l mt-6">
              €20 a year.
              <br />
              <em className="italic">Open to everyone.</em>
            </h2>
            <p className="type-lede mt-6 max-w-md text-fg-muted">
              Call in to the club with official photo ID and your address to join.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <dl className="border-t border-line">
              {visit.membership.map((m) => (
                <div key={m.label} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="type-eyebrow pt-1 text-fg-faint">{m.label}</dt>
                  <dd className="text-[1.0625rem]">
                    {m.value}
                    <VerifyMark verification={m.verification} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.8125rem] text-fg-faint">
              Items marked <span className="font-semibold text-detail">To confirm</span> are not on the club&rsquo;s current site and need checking before launch.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="surface-ink scroll-mt-24 py-24 md:py-32" aria-labelledby="faq-title">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Eyebrow rule>Questions</Eyebrow>
            <h2 id="faq-title" className="type-display-l mt-6">
              Before you visit.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="border-t border-line">
              {visit.faqs.map((f) => (
                <details key={f.q} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[1.125rem] font-semibold [&::-webkit-details-marker]:hidden">
                    <span>
                      {f.q}
                      <VerifyMark verification={f.verification} />
                    </span>
                    <Plus aria-hidden className="size-5 shrink-0 text-fg-muted transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} />
                  </summary>
                  <p className="max-w-2xl pb-6 text-fg-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="surface-ink border-t border-line py-24 md:py-32" aria-labelledby="contact-title">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Eyebrow rule>Get in touch</Eyebrow>
            <h2 id="contact-title" className="type-display-m mt-6">
              Write to the club.
            </h2>
            <p className="mt-4 text-fg-muted">For anything urgent on the night, phone is quickest.</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm email={visit.email} />
          </div>
        </div>
      </section>
    </>
  );
}
