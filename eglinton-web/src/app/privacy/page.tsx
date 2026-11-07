import type { Metadata } from "next";
import { LegalPage, ReviewNotice } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Privacy", robots: { index: false } };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Policies" title="Privacy" lede="How The Eglinton handles personal information.">
      <ReviewNotice>
        This page is a placeholder for the club&rsquo;s privacy notice. No policy text has been written here on purpose: the
        club&rsquo;s existing privacy obligations and notice remain in force, and the final text must be provided or approved by
        the club and its legal adviser.
      </ReviewNotice>
      <div>
        <h2>What the final notice needs to cover</h2>
        <p className="mt-4">A checklist for whoever drafts it, based on what this website and the club actually process:</p>
        <ul>
          <li>Who the data controller is, with contact details.</li>
          <li>Membership records (name, address, photo ID) — purpose, legal basis and retention.</li>
          <li>Publication of player names in tournament results and league standings, and how a player can opt out.</li>
          <li>Enquiries sent by email from the contact page.</li>
          <li>Any analytics or third-party services added to the site (none in this demo).</li>
          <li>Data subject rights and how to make a request.</li>
        </ul>
      </div>
    </LegalPage>
  );
}
