import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { FOOTER_NAV } from "@/lib/nav";
import type { SiteContent } from "@/content/types";

export function SiteFooter({ content, isDemo }: { content: SiteContent; isDemo: boolean }) {
  const { visit } = content;
  return (
    <footer className="surface-ink relative overflow-hidden border-t border-line">
      <div className="container-site grid gap-12 pt-20 pb-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="type-eyebrow text-detail">Find us</p>
          <address className="mt-5 not-italic">
            <span className="block font-display text-[2rem] uppercase leading-[0.95]">Eglinton Street,</span>
            <span className="block font-display text-[2rem] uppercase leading-[0.95]">Galway</span>
          </address>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
            <a href={visit.phoneHref} className="nums font-bold text-fg hover:text-accent-text">
              {visit.phoneDisplay}
            </a>
            <a href={`mailto:${visit.email}`} className="text-fg-muted hover:text-fg">
              {visit.email}
            </a>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          {FOOTER_NAV.map((group) => (
            <div key={group.title}>
              <h2 className="type-eyebrow text-fg-faint">{group.title}</h2>
              <ul className="mt-5 space-y-3">
                {group.items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="text-[0.9375rem] font-medium text-fg-muted transition-colors hover:text-fg">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container-site" aria-hidden>
        <Logo size="xl" className="w-full" />
      </div>

      <div className="container-site">
        <div className="flex flex-col gap-5 border-t border-line py-7 text-[0.8125rem] text-fg-faint md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3">
            <span className="inline-flex h-7 items-center border border-fg px-2 text-[0.6875rem] font-extrabold text-fg">18+</span>
            <span>
              Play for fun, play within your limits.{" "}
              <Link href="/responsible-gaming" className="font-semibold text-fg-muted underline underline-offset-4 hover:text-fg">
                Free, confidential help
              </Link>
            </span>
          </p>
          <p>
            © {new Date().getFullYear()} The Eglinton Casino &amp; Card Club
            {isDemo && <span> · Design proposal with demonstration data</span>}
          </p>
        </div>
      </div>
    </footer>
  );
}
