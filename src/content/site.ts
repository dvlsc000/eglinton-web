/**
 * Editorial content for the demo.
 *
 * Sources
 * - "About Us", theeglinton.com/about-us/ (fetched Nov 2026): opening date,
 *   location, membership terms, games, restaurant and drinks, phone, email.
 * - Gambling Regulatory Authority of Ireland, "Get help" page (fetched Nov
 *   2026): support services and numbers.
 * Everything else is marked "to-confirm" or "demo".
 */
import type { SiteContent } from "./types";

export const SITE_CONTENT: SiteContent = {
  brand: {
    name: "The Eglinton Casino & Card Club",
    shortName: "The Eglinton",
    // The club's crest, lifted off its maroon field (original kept at /brand/eglinton-crest-original.png).
    // Source artwork is 80×88px; swap in an SVG or a large PNG when the club supplies one.
    logo: { src: "/brand/eglinton-crest.png", width: 228, height: 244, alt: "The Eglinton crest" },
  },

  hero: {
    eyebrow: "Galway · Since 2007",
    headlineLead: "Shuffle up",
    headlineEmphasis: "and deal.",
    lede: "Hold'em and Omaha tournaments and cash games through the afternoon and evening, blackjack and roulette in the house, and complimentary drinks while you play. Come down to Eglinton Street and take a seat.",
    image: {
      src: null,
      alt: "The tournament room at The Eglinton",
      brief: "Venue photograph · tournament room, warm low light, tables in play",
    },
  },

  announcements: [
    {
      id: "winter-series",
      text: "Winter Series dates announced: four events across one long weekend.",
      href: "/schedule?series=winter-series",
      linkLabel: "See the events",
      verification: "demo",
    },
  ],

  featuredEvents: [
    {
      id: "winter-series",
      kicker: "Featured series",
      title: "The Winter Series",
      summary: "Four guaranteed events over one long weekend, building to a Saturday Main Event with 60,000 starting chips.",
      body: [
        "An Opener on Thursday night, a Pot-Limit Omaha championship on Friday, the Main Event on Saturday and a Sunday Closer.",
        "Satellites run in the weeks before, awarding Main Event seats for every €225 in the pool.",
      ],
      image: {
        src: null,
        alt: "Final table at a previous Eglinton festival",
        brief: "Event photograph · final table, chips and dealer's hands, shallow depth of field",
      },
      verification: "demo",
    },
  ],

  club: {
    intro:
      "The Eglinton Casino & Card Club opened on Eglinton Street in July 2007, and has been a fixture of poker in the west of Ireland ever since.",
    story: [
      "The card room runs Texas Hold'em and Omaha Hold'em, as tournaments and as cash games, through the afternoon and into the evening. Beside it, the house games: blackjack, roulette and auto gaming.",
      "Members of the club have gone on to win major prizes in national and international events. Most nights, though, it's simply the place in Galway where the game is on.",
      "Between hands there's the restaurant, serving snacks, tea and coffee, and complimentary drinks for players at the tables.",
    ],
    facts: [
      { label: "Opened", value: "July 2007", verification: "confirmed", source: "theeglinton.com/about-us" },
      { label: "Location", value: "Eglinton Street, Galway city centre", verification: "confirmed", source: "theeglinton.com/about-us" },
      { label: "Poker", value: "Texas Hold'em & Omaha — tournaments and cash games", verification: "confirmed", source: "theeglinton.com/about-us" },
      { label: "House games", value: "Blackjack, roulette, auto gaming", verification: "confirmed", source: "theeglinton.com/about-us" },
      { label: "Membership", value: "€20 per year", verification: "confirmed", source: "theeglinton.com/about-us" },
    ],
    offerings: [
      {
        id: "tournaments",
        name: "Poker tournaments",
        summary: "Afternoon and evening Hold'em and Omaha tournaments, with weekly leagues and seasonal series.",
        verification: "confirmed",
      },
      {
        id: "cash",
        name: "Cash games",
        summary: "Texas Hold'em and Omaha cash tables. Sit down, play as long as you like, leave when you choose.",
        verification: "confirmed",
      },
      {
        id: "blackjack",
        name: "Blackjack",
        summary: "Dealt at the house tables alongside the card room.",
        verification: "confirmed",
      },
      {
        id: "roulette",
        name: "Roulette",
        summary: "The wheel, live, with auto gaming also on the floor.",
        verification: "confirmed",
      },
      {
        id: "restaurant",
        name: "Restaurant",
        summary: "Snacks, tea and coffee — and complimentary drinks for players at the tables.",
        verification: "confirmed",
      },
    ],
    images: {
      room: { src: null, alt: "The card room", brief: "Venue photograph · wide shot of the card room" },
      tables: { src: null, alt: "Dealer at a tournament table", brief: "Venue photograph · dealer pitching cards, close crop" },
      bar: { src: null, alt: "The restaurant", brief: "Venue photograph · restaurant counter, tea and coffee service" },
    },
  },

  visit: {
    address: ["The Eglinton Casino", "Eglinton Street", "Galway", "Ireland"],
    mapQuery: "Eglinton Casino, Eglinton Street, Galway",
    coordinates: { lat: 53.2747, lng: -9.0515, verification: "to-confirm" },
    phoneDisplay: "091 569632",
    phoneIntl: "+353 91 569632",
    phoneHref: "tel:+35391569632",
    email: "theeglinton10@gmail.com",
    hours: [
      { label: "Opening hours", value: "To be confirmed with the club", verification: "to-confirm" },
      { label: "Tournaments", value: "Afternoon and evening", verification: "confirmed" },
    ],
    membership: [
      { label: "Annual fee", value: "€20 per year", verification: "confirmed", source: "theeglinton.com/about-us" },
      { label: "Who can join", value: "Open to any member of the public", verification: "confirmed", source: "theeglinton.com/about-us" },
      {
        label: "How to join",
        value: "Call in to the club with official photo ID (driving licence or passport) and your address",
        verification: "confirmed",
        source: "theeglinton.com/about-us",
      },
      { label: "Minimum age", value: "18+ — confirm the club's policy", verification: "to-confirm" },
      { label: "Renewal & guest policy", value: "To be confirmed with the club", verification: "to-confirm" },
    ],
    faqs: [
      {
        q: "Do I need to be a member to play?",
        a: "Membership is €20 a year and open to the public. Bring official photo ID, such as a driving licence or passport, and your address when you first visit.",
        verification: "confirmed",
      },
      {
        q: "What games are played?",
        a: "Texas Hold'em and Omaha Hold'em, as tournaments and cash games, plus blackjack, roulette and auto gaming.",
        verification: "confirmed",
      },
      {
        q: "Is there food?",
        a: "Yes. The restaurant serves snacks, tea and coffee, and players at the tables receive complimentary drinks.",
        verification: "confirmed",
      },
      {
        q: "How do I enter a tournament?",
        a: "Registration is taken in person at the club. Late registration stays open until the level shown on each tournament page.",
        verification: "to-confirm",
      },
      {
        q: "Is there parking nearby?",
        a: "Details to be confirmed with the club.",
        verification: "to-confirm",
      },
    ],
    image: { src: null, alt: "The Eglinton entrance on Eglinton Street", brief: "Venue photograph · street entrance at dusk" },
  },

  responsibleGaming: {
    summary:
      "Poker and casino games should be entertainment. Set a limit before you play, never chase losses, and take a break when it stops being fun. If gambling is affecting you or someone close to you, free and confidential help is available.",
    services: [
      { name: "HSE Drugs and Alcohol Helpline", detail: "Free helpline, also covers gambling", phone: "1800 459 459" },
      { name: "Gambling Awareness Trust", detail: "National helpline", phone: "1800 936 725", href: "https://www.gamblingcare.ie" },
      { name: "Gamblers Anonymous — Galway", detail: "Peer support meetings", phone: "086 349 4450", href: "https://www.gamblersanonymous.ie" },
      { name: "Extern Problem Gambling", detail: "Support for people and families", phone: "089 241 5401", href: "https://www.problemgambling.ie" },
      { name: "MABS", detail: "Money advice and budgeting", phone: "0818 07 2000", href: "https://www.mabs.ie" },
      { name: "Samaritans", detail: "Any time, day or night", phone: "116 123", href: "https://www.samaritans.org/ireland" },
    ],
    source: {
      label: "Gambling Regulatory Authority of Ireland",
      href: "https://www.grai.ie/gambling-safety/get-support/get-help",
    },
  },
};
