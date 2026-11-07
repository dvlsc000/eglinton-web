/**
 * Editorial content model — kept separate from competitive data on purpose.
 * This is what a future CMS or admin dashboard edits.
 *
 * `verification` marks where each fact came from, so nothing unconfirmed is
 * presented as fact without a visible "to confirm" marker in the demo.
 *  - "confirmed": stated on the club's current website (source noted).
 *  - "to-confirm": plausible placeholder; must be checked with the club.
 *  - "demo": illustrative content created for the proposal.
 */
export type Verification = "confirmed" | "to-confirm" | "demo";

export type Image = {
  /** Path under /public or a full URL. null renders a designed placeholder. */
  src: string | null;
  alt: string;
  /** Shown on the placeholder so stakeholders know what goes here. */
  brief: string;
  credit?: string;
};

export type Fact = {
  label: string;
  value: string;
  verification: Verification;
  source?: string;
  href?: string;
};

export type FeaturedEvent = {
  id: string; // matches Tournament.seriesId
  title: string;
  kicker: string;
  summary: string;
  body: string[];
  image: Image;
  verification: Verification;
};

export type Announcement = {
  id: string;
  text: string;
  href?: string;
  linkLabel?: string;
  verification: Verification;
};

export type Offering = {
  id: string;
  name: string;
  summary: string;
  verification: Verification;
};

export type Faq = { q: string; a: string; verification: Verification };

export type SupportService = { name: string; detail: string; phone?: string; href?: string };

export type SiteContent = {
  brand: {
    name: string;
    shortName: string;
    /** Original logo file. null = placeholder until the club supplies artwork. */
    logo: { src: string | null; width: number; height: number; alt: string };
  };
  hero: {
    eyebrow: string;
    headlineLead: string;
    headlineEmphasis: string;
    lede: string;
    image: Image;
  };
  announcements: Announcement[];
  featuredEvents: FeaturedEvent[];
  club: {
    intro: string;
    story: string[];
    facts: Fact[];
    offerings: Offering[];
    images: { room: Image; tables: Image; bar: Image };
  };
  visit: {
    address: string[];
    mapQuery: string;
    coordinates: { lat: number; lng: number; verification: Verification };
    phoneDisplay: string;
    phoneIntl: string;
    phoneHref: string;
    email: string;
    hours: { label: string; value: string; verification: Verification }[];
    membership: Fact[];
    faqs: Faq[];
    image: Image;
  };
  responsibleGaming: {
    summary: string;
    services: SupportService[];
    source: { label: string; href: string };
  };
};
