import type { Metadata } from "next";
import { LegalPage, ReviewNotice } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Cookies", robots: { index: false } };

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Policies" title="Cookies" lede="What this website stores in your browser.">
      <ReviewNotice>Confirm this page against the production build, and add any analytics or embeds before launch.</ReviewNotice>
      <div>
        <h2>In this build</h2>
        <p className="mt-4">
          This demonstration sets no cookies and loads no analytics. The map on the Visit page loads from OpenStreetMap only
          after a visitor chooses &ldquo;Show map&rdquo;, so no third-party request is made by default.
        </p>
      </div>
      <div>
        <h2>If that changes</h2>
        <p className="mt-4">
          Adding analytics, marketing pixels or embedded content that sets non-essential cookies will require a consent banner
          and an updated version of this page before launch.
        </p>
      </div>
    </LegalPage>
  );
}
