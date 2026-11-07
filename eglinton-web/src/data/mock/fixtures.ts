/**
 * Hand-authored inputs for the mock data generator.
 *
 * Recurring event NAMES marked `nameOnCurrentSite` appear on theeglinton.com
 * (seen in public search results, Nov 2026). Every other detail here — times,
 * buy-ins, stacks, guarantees, structures — is DEMONSTRATION DATA and must be
 * replaced with the club's real schedule.
 *
 * All players are fictional.
 */
import type { BuyIn, EntryRules, PokerVariant, TournamentFormat } from "@/domain/schemas";

export type EventTemplate = {
  key: string;
  name: string;
  nameOnCurrentSite?: boolean;
  /** ISO weekday 1 = Monday … 7 = Sunday */
  weekday: number;
  time: string; // HH:mm club time
  variant: PokerVariant;
  formats: TournamentFormat[];
  buyIn: BuyIn;
  startingStack: number;
  guaranteeCents: number | null;
  entryRules: EntryRules;
  structureId: string;
  lateRegLevel: number;
  /** Typical field size; drives demo entries. */
  baseEntries: number;
  league: boolean;
  description: string | null;
};

const reentry = (max: number, until: number): EntryRules => ({ type: "re-entry", maxEntries: max, untilLevel: until, addOn: null });

export const WEEKLY_TEMPLATES: EventTemplate[] = [
  {
    key: "monday-megastack",
    name: "Monday MegaStack",
    nameOnCurrentSite: true,
    weekday: 1,
    time: "19:30",
    variant: "NLHE",
    formats: ["Deepstack", "Re-entry"],
    buyIn: { entryCents: 5000, feeCents: 1000, bountyCents: 0 },
    startingStack: 30000,
    guaranteeCents: null,
    entryRules: reentry(2, 6),
    structureId: "deepstack-20",
    lateRegLevel: 6,
    baseEntries: 32,
    league: true,
    description: "A deep-stacked start to the week with room to play through the early levels.",
  },
  {
    key: "tuesday-rebuy",
    name: "Tuesday Rebuy",
    nameOnCurrentSite: true,
    weekday: 2,
    time: "19:30",
    variant: "NLHE",
    formats: ["Rebuy"],
    buyIn: { entryCents: 2000, feeCents: 500, bountyCents: 0 },
    startingStack: 10000,
    guaranteeCents: null,
    entryRules: { type: "rebuy", maxEntries: null, untilLevel: 6, addOn: { costCents: 2000, chips: 15000 } },
    structureId: "standard-15",
    lateRegLevel: 6,
    baseEntries: 26,
    league: true,
    description: "Unlimited rebuys through the first six levels, with an add-on at the first break.",
  },
  {
    key: "wednesday-omaha",
    name: "Wednesday Omaha",
    weekday: 3,
    time: "19:30",
    variant: "PLO",
    formats: ["Re-entry"],
    buyIn: { entryCents: 4000, feeCents: 1000, bountyCents: 0 },
    startingStack: 25000,
    guaranteeCents: null,
    entryRules: reentry(2, 6),
    structureId: "omaha-20",
    lateRegLevel: 6,
    baseEntries: 18,
    league: true,
    description: "Pot-Limit Omaha midweek, four cards and a steady 20-minute clock.",
  },
  {
    key: "thursday-bounty",
    name: "Thursday Bounty",
    weekday: 4,
    time: "19:30",
    variant: "NLHE",
    formats: ["Bounty", "Re-entry"],
    buyIn: { entryCents: 3000, feeCents: 1000, bountyCents: 2000 },
    startingStack: 25000,
    guaranteeCents: null,
    entryRules: reentry(2, 6),
    structureId: "standard-15",
    lateRegLevel: 6,
    baseEntries: 24,
    league: true,
    description: "Every player carries a bounty, paid out on the spot for each knockout.",
  },
  {
    key: "friday-megastack",
    name: "Friday MegaStack",
    nameOnCurrentSite: true,
    weekday: 5,
    time: "20:00",
    variant: "NLHE",
    formats: ["Deepstack", "Re-entry"],
    buyIn: { entryCents: 8000, feeCents: 1500, bountyCents: 0 },
    startingStack: 40000,
    guaranteeCents: 300000,
    entryRules: reentry(2, 8),
    structureId: "deepstack-20",
    lateRegLevel: 8,
    baseEntries: 40,
    league: true,
    description: "The club's Friday night deepstack, with a guaranteed prize pool.",
  },
  {
    key: "saturday-omaha-treble-chance",
    name: "Saturday Omaha Treble Chance",
    nameOnCurrentSite: true,
    weekday: 6,
    time: "15:00",
    variant: "PLO",
    formats: ["Multi-entry"],
    buyIn: { entryCents: 5000, feeCents: 1000, bountyCents: 0 },
    startingStack: 25000,
    guaranteeCents: null,
    entryRules: reentry(3, 8),
    structureId: "omaha-20",
    lateRegLevel: 8,
    baseEntries: 20,
    league: true,
    description: "Afternoon Omaha with up to three entries per player.",
  },
  {
    key: "saturday-deepstack",
    name: "Saturday Night Deepstack",
    weekday: 6,
    time: "20:00",
    variant: "NLHE",
    formats: ["Deepstack", "Re-entry"],
    buyIn: { entryCents: 10000, feeCents: 1500, bountyCents: 0 },
    startingStack: 50000,
    guaranteeCents: 500000,
    entryRules: reentry(2, 8),
    structureId: "deepstack-25",
    lateRegLevel: 8,
    baseEntries: 46,
    league: true,
    description: "The biggest regular game of the week: 50,000 chips and 25-minute levels.",
  },
  {
    key: "sunday-rebuy-turbo",
    name: "Sunday Rebuy Turbo",
    nameOnCurrentSite: true,
    weekday: 7,
    time: "16:00",
    variant: "NLHE",
    formats: ["Rebuy", "Turbo"],
    buyIn: { entryCents: 2000, feeCents: 500, bountyCents: 0 },
    startingStack: 8000,
    guaranteeCents: null,
    entryRules: { type: "rebuy", maxEntries: null, untilLevel: 4, addOn: { costCents: 2000, chips: 12000 } },
    structureId: "turbo-10",
    lateRegLevel: 4,
    baseEntries: 28,
    league: true,
    description: "Fast levels, rebuys for the first four, and an early finish.",
  },
];

/** Festival / series events, positioned relative to the current week. */
export type SeriesTemplate = {
  seriesId: string;
  /** Week offset from the current week. */
  weekOffset: number;
  /** Weekdays on which the regular evening schedule is replaced. */
  replacesWeekdays: number[];
  events: (Omit<EventTemplate, "league" | "baseEntries"> & { baseEntries: number })[];
};

export const SERIES: SeriesTemplate[] = [
  {
    seriesId: "winter-series",
    weekOffset: 4,
    replacesWeekdays: [4, 5, 6, 7],
    events: [
      {
        key: "winter-series-opener",
        name: "Winter Series · Opener",
        weekday: 4,
        time: "19:30",
        variant: "NLHE",
        formats: ["Festival", "Deepstack", "Re-entry"],
        buyIn: { entryCents: 8000, feeCents: 1500, bountyCents: 0 },
        startingStack: 40000,
        guaranteeCents: 400000,
        entryRules: reentry(2, 8),
        structureId: "deepstack-20",
        lateRegLevel: 8,
        baseEntries: 60,
        description: "Event #1 opens the series with a deep stack and a guaranteed pool.",
      },
      {
        key: "winter-series-plo",
        name: "Winter Series · PLO Championship",
        weekday: 5,
        time: "19:00",
        variant: "PLO",
        formats: ["Festival", "Re-entry"],
        buyIn: { entryCents: 10000, feeCents: 1500, bountyCents: 0 },
        startingStack: 40000,
        guaranteeCents: 300000,
        entryRules: reentry(2, 8),
        structureId: "omaha-20",
        lateRegLevel: 8,
        baseEntries: 34,
        description: "Event #2: the series' Pot-Limit Omaha title.",
      },
      {
        key: "winter-series-main",
        name: "Winter Series · Main Event",
        weekday: 6,
        time: "13:00",
        variant: "NLHE",
        formats: ["Festival", "Deepstack", "Re-entry"],
        buyIn: { entryCents: 20000, feeCents: 2500, bountyCents: 0 },
        startingStack: 60000,
        guaranteeCents: 1500000,
        entryRules: reentry(2, 10),
        structureId: "deepstack-30",
        lateRegLevel: 10,
        baseEntries: 90,
        description: "Event #3, the centrepiece: 60,000 chips, 30-minute levels, played to a winner.",
      },
      {
        key: "winter-series-closer",
        name: "Winter Series · Closer",
        weekday: 7,
        time: "14:00",
        variant: "NLHE",
        formats: ["Festival", "Re-entry"],
        buyIn: { entryCents: 10000, feeCents: 1500, bountyCents: 0 },
        startingStack: 40000,
        guaranteeCents: 400000,
        entryRules: reentry(2, 8),
        structureId: "deepstack-20",
        lateRegLevel: 8,
        baseEntries: 55,
        description: "Event #4 brings the series home on Sunday afternoon.",
      },
    ],
  },
  {
    seriesId: "autumn-series",
    weekOffset: -9,
    replacesWeekdays: [5, 6],
    events: [
      {
        key: "autumn-series-main",
        name: "Autumn Series · Main Event",
        weekday: 6,
        time: "14:00",
        variant: "NLHE",
        formats: ["Festival", "Deepstack", "Re-entry"],
        buyIn: { entryCents: 15000, feeCents: 2000, bountyCents: 0 },
        startingStack: 50000,
        guaranteeCents: 1000000,
        entryRules: reentry(2, 10),
        structureId: "deepstack-30",
        lateRegLevel: 10,
        baseEntries: 70,
        description: "The Autumn Series headline event.",
      },
      {
        key: "autumn-series-opener",
        name: "Autumn Series · Opener",
        weekday: 5,
        time: "19:30",
        variant: "NLHE",
        formats: ["Festival", "Re-entry"],
        buyIn: { entryCents: 8000, feeCents: 1500, bountyCents: 0 },
        startingStack: 40000,
        guaranteeCents: 300000,
        entryRules: reentry(2, 8),
        structureId: "deepstack-20",
        lateRegLevel: 8,
        baseEntries: 52,
        description: "The Autumn Series opening event.",
      },
    ],
  },
];

/** One-off satellite events (week offset, weekday, time). */
export const SATELLITES = [
  { weekOffset: 2, weekday: 3, time: "20:45" },
  { weekOffset: 3, weekday: 2, time: "20:45" },
];

/** Demo cancellation to exercise the "cancelled" state. */
export const CANCELLATIONS = [
  { templateKey: "wednesday-omaha", weekOffset: 2, note: "Cancelled for a private event (demo)." },
];

const FIRST = [
  "Aoife", "Ciarán", "Niamh", "Darragh", "Siobhán", "Eoin", "Gráinne", "Cathal", "Orla", "Fionn",
  "Róisín", "Tadhg", "Clodagh", "Oisín", "Méabh", "Pádraig", "Saoirse", "Colm", "Deirdre", "Rory",
  "Laura", "Mark", "Tomasz", "Ana", "Kevin", "Sinéad", "Declan", "Helen", "Marco", "Jakub",
  "Una", "Brian", "Aisling", "Shane", "Emer", "Conor", "Paula", "Lorcan", "Bríd", "Dónal",
  "Nuala", "Ronan", "Karen", "Gavin", "Ita", "Fergal", "Lucia", "Enda", "Mairéad", "Piotr",
  "Sorcha", "Cian",
];
const INITIALS = "ABCDEFGHJKLMNOPRSTW";

export type MockPlayer = { id: string; displayName: string; skill: number; activity: number; cashPlayer: number };

export function buildPlayers(r: () => number): MockPlayer[] {
  return FIRST.map((first, i) => {
    const initial = INITIALS[Math.floor(r() * INITIALS.length)];
    return {
      id: `p${String(i + 1).padStart(3, "0")}`,
      displayName: `${first} ${initial}.`,
      skill: 0.35 + r() * 1.3,
      activity: 0.25 + r() * 0.75,
      cashPlayer: r() < 0.8 ? 0.3 + r() * 0.9 : 0,
    };
  });
}
