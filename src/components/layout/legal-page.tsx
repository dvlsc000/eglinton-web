import { PageHeader } from "./page-header";

export function ReviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="border border-dashed border-detail/60 bg-bg-raised px-5 py-4 text-[0.9375rem]">
      <p className="type-eyebrow text-detail">Requires review before launch</p>
      <div className="mt-2 text-fg-muted">{children}</div>
    </div>
  );
}

export function LegalPage({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={[{ text: title }]} lede={lede} size="l" />
      <section className="surface-ink pb-28">
        <div className="container-site">
          <div className="max-w-3xl space-y-10 [&_h2]:font-display [&_h2]:text-[1.75rem] [&_h2]:leading-tight [&_li]:text-fg-muted [&_p]:text-fg-muted [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
