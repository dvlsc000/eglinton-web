import type { Metadata } from "next";
import { ArrowUpRight, Phone } from "lucide-react";
import { getContent } from "@/content/provider";
import { LegalPage, ReviewNotice } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Responsible gaming",
  description: "Play responsibly at The Eglinton. Free, confidential support for anyone affected by gambling in Ireland.",
};

export default async function ResponsibleGamingPage() {
  const { responsibleGaming: rg } = await getContent();
  return (
    <LegalPage eyebrow="Responsible gaming" title="Keep it a game." lede={rg.summary}>
      <ReviewNotice>
        The club&rsquo;s own responsible-gambling commitments, age policy and self-exclusion process are not published on its current
        website and must be supplied by the club. Support services below are as listed by the {rg.source.label}; check numbers
        before launch.
      </ReviewNotice>

      <div>
        <h2>Simple rules that help</h2>
        <ul>
          <li>Decide what you can afford to spend before you arrive, and stick to it.</li>
          <li>Treat what you spend as the cost of a night out, not as a way to make money.</li>
          <li>Don&rsquo;t chase losses, and don&rsquo;t play to escape problems or stress.</li>
          <li>Take breaks, and keep track of time.</li>
        </ul>
      </div>

      <div>
        <h2>Free, confidential help</h2>
        <ul className="!mt-6 !list-none !space-y-0 !pl-0 border-t border-line">
          {rg.services.map((s) => (
            <li key={s.name} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
              <div>
                <p className="!text-fg font-semibold">{s.name}</p>
                <p className="text-[0.875rem]">{s.detail}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="nums inline-flex items-center gap-2 font-semibold text-fg hover:text-accent-text">
                    <Phone aria-hidden className="size-4" strokeWidth={1.75} />
                    {s.phone}
                  </a>
                )}
                {s.href && (
                  <a href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[0.875rem] text-fg-muted hover:text-fg">
                    Website <ArrowUpRight aria-hidden className="size-3.5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.8125rem]">
          Source:{" "}
          <a href={rg.source.href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-fg">
            {rg.source.label}
          </a>
          .
        </p>
      </div>
    </LegalPage>
  );
}
