# Design notes

## 1. Site audit (Phase 1)

**Access.** From the build environment, theeglinton.com was mostly unreachable: the homepage and most pages were refused at the network level, and tournament/result pages failed to load. One page — **About Us** — was read in full, and public search results exposed several page titles (e.g. *Monday MegaStack*, *Friday MegaStack*, *Tuesday Rebuy*, *Sunday Rebuy Turbo*, *Saturday Omaha Treble Chance*, *Tournaments Archive*). The site's CSS, logo file and imagery could **not** be inspected. Nothing in this proposal claims otherwise.

**Confirmed from the About page** (used verbatim in meaning, marked "confirmed" in content): opened July 2007; Eglinton Street, central Galway; Texas Hold'em and Omaha tournaments and cash games, afternoon and evening; blackjack, roulette and auto gaming; membership €20/year, open to the public, join with photo ID and address; restaurant with snacks, tea and coffee; complimentary drinks for players; phone 091 569632 (+353 91 569632); email theeglinton10@gmail.com; members have won prizes in national and international events.

**Inferred structure** of the current site (from URLs and titles): a tournaments section with per-event pages, a result page per tournament instance, an archive, and an About page.

| | Findings |
| --- | --- |
| Preserve | The club name and logo; recurring event names players know; the result-per-event habit; phone and email as primary contact; membership terms |
| Most important to visitors | What's on tonight and this week; buy-in, start time, stack, late registration; league position; how to join; where it is |
| Needs improving | Schedule scanning (one line per event, consistent columns); results discoverability (archive search by player); league tables on mobile |
| Reorganise | Separate *schedule* (future), *results* (past) and *leagues* (standings); bring membership/visit info together |
| Reusable assets | Logo (pending supply); venue photographs (pending supply) |

## 2. Direction — "Scoreboard" (chosen by the client)

Black, white and one signal red. Condensed uppercase display type, oversized tabular numerals, hairline grids and a broadcast-style "Next" panel. The site is built around the competition — what's on, who's winning — and every page closes with an invitation to come down to Eglinton Street.

Earlier explorations (Ink & Claret Editorial, Broadsheet, Cinematic Felt) were presented as option boards; this direction was selected.

## 3. Colour tokens (`src/app/globals.css`)

**Provisional** until the club's logo is supplied. Everything derives from these:

| Token | Value | Use |
| --- | --- | --- |
| `--brand-black` | `#0a0a0a` | Primary surface |
| `--brand-white` | `#f4f2ee` | Text on black; inverted panels; "First time?" section |
| `--brand-red` | `#c8323c` | Primary actions, "Reg open", #1 rank, invitation band, page-transition curtain |
| `--brand-red-bright` | `#e8464f` | Red used as text on black (meets AA) |
| `--brand-green` | `#5fd08a` | Upward movement in standings only |

Three surfaces: `.surface-ink` (black), `.surface-paper` (white) and `.surface-red`. Components use semantic names only, so any section can switch surface.

## 4. Typography

- **Display — Archivo** (variable, width axis set to 62% = condensed, weight 800), uppercase. Used for headings, times, money and ranks. Outline lines (`outline: true`) give the two-tone "SHUFFLE UP / AND DEAL." treatment.
- **Interface — Inter Tight** (variable). Body copy, labels and controls.
- Both have **tabular figures**; all numbers use the `nums` utility. Self-hosted via Fontsource.

## 5. Layout

Full-width grids divided by hairlines; sections alternate black → white → red for rhythm. Square corners everywhere.

## 6. Motion system

Built with **Motion for React**, plus **Lenis** for inertial scrolling. Tokens in `src/lib/motion.ts` (expo-out `[0.16, 1, 0.3, 1]`, critically damped layout spring). Components in `src/components/motion/`:

| Effect | Component | Where |
| --- | --- | --- |
| Inertial smooth scroll | `SmoothScroll` (Lenis) | Whole site; off for touch and reduced-motion |
| Masked word reveals | `SplitReveal` | Every page title and section heading |
| Velocity-reactive ticker | `Marquee` | "Tonight" ticker, invitation band; speeds up and reverses with scroll, pauses on hover |
| Magnetic buttons | `Magnetic` | Hero and invitation CTAs (mouse only) |
| Count-up numbers | `CountUp` | Guarantees, league funds, points |
| Growing bars | `GrowBar` / inline | Leaderboard and home league table |
| Scroll parallax | `Parallax`, hero transforms | Photography, hero copy and media |
| The deal | `DealTable` (`components/home/deal-table.tsx`) | Home hero: a full hold'em hand in one Motion sequence. Burn cards, the flop lands as a stack and spreads, a held beat before the river, winning cards lift at showdown. Cards are drawn in HTML/SVG; sizes use container units so the table reflows with the panel. Tilts toward the mouse; reduced-motion shows the finished hand. "Deal again" replays it |
| Chip towers | `ChipTowers` (`components/home/chip-towers.tsx`) | Home Featured Series: one chip tower per event, one chip per €500 guaranteed (unit adapts to the data). Chips fall and settle tower by tower, Thursday to Sunday, when the panel scrolls into view; the Main Event tower is red. Each tower links to its tournament. Reduced-motion shows the built towers |
| Sideways drift type | `Drift` | Featured series |
| Reading progress | `ScrollProgress` | Red line at the very top |
| Page transition | `app/template.tsx` | Red curtain lifts on every navigation (not on first load) |
| Hide-on-scroll header | `SiteHeader` | Sticky toolbars follow it via `--header-offset` |
| Nav pill | `SiteHeader` | White pill slides to the hovered/active item |
| Hover fills | buttons, rows, league tiles | Fill wipes up from the bottom; rows sweep and gain a red edge |
| Live re-sort | `StandingsBoard` | Rows glide to new positions on sort |
| Full-screen mobile menu | `SiteHeader` | Clip-path reveal, links rise in sequence |

Accessibility: `MotionConfig reducedMotion="user"`, a CSS reduced-motion override, Lenis disabled and the marquee frozen for reduced-motion users. All animated text keeps an accessible label.

## 7. Copy — an invitation on every page

Each promotional page ends with the red **InviteBand** ("Your seat is waiting.", "Get your name up here.", "See you at the table.", etc.) with links to the schedule, visit page and phone. Home adds a "First time? It's easy." three-step section built only from confirmed facts (€20 membership with photo ID and address; Hold'em, Omaha, blackjack, roulette, auto gaming; restaurant and complimentary drinks for players). The live "Starts in…" countdown is computed from the schedule, never invented.

Invitations are deliberately **absent** from Responsible gaming, Privacy and Cookies.

## 8. Components

`src/components/ui/primitives.tsx`, `controls.tsx`, `photo-slot.tsx`; `tournaments/bits.tsx` (status chips, schedule row); `leagues/standings-board.tsx` (TanStack Table v9: sort, search, paginate, podium, bars); `layout/invite-band.tsx`; `motion/kinetic.tsx`.
