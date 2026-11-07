# Handover

## Status

A complete, working demo of the proposed website, ready to show the club. It builds and runs (`npm run build && npm run start`), passes type-check and lint, and was tested in a headless browser across all routes at 1440, 1280, 1024, 768, 390 and 360px wide with no horizontal overflow and no console errors.

## Complete

- **Design: "Scoreboard"** direction (chosen by the client) applied across every page, with a full motion system (smooth scrolling, masked headline reveals, velocity ticker, magnetic buttons, count-ups, growing bars, parallax, red-curtain page transitions). See DESIGN.md §6.
- **Animation reference:** the client pointed to animations in one of their GitHub repositories. The repository list could not be opened from the build environment, so the motion system follows current best practice instead; share the repo link to align it more closely.

- All pages: home, schedule (list + calendar), tournament detail, leaderboard, Tournament League, Cash League, results archive, club, visit, responsible gaming, privacy, cookies, 404 and error pages.
- Working interactions: schedule week/day navigation, game and format filters, search, series filter, shareable URLs; calendar with links to events; leaderboard sorting, search, pagination, league and season switching; archive period/game/player search with "show more"; add-to-calendar (.ics); copy address/email; click-to-load map; email composer; mobile menu.
- Loading, empty and error states, including a verified graceful failure when the data source is down.
- Data architecture: typed, validated domain models; mock and API providers behind one interface; environment switch; consistency checks; a reference mock API server. Verified: the full site runs against the HTTP API path.
- Accessibility basics: semantic landmarks and tables, skip link, visible focus, keyboard-operable controls, `aria-sort`, live result counts, reduced-motion support.
- Demo builds are `noindex` and carry a visible "Design proposal" notice.

## Demonstration content (must be replaced)

| Item | Where | Notes |
| --- | --- | --- |
| Tournament schedule, buy-ins, stacks, structures, guarantees | `src/data/mock/` | Event names marked `nameOnCurrentSite` are real; all details are invented |
| Players, results, standings, league funds | generated | All players are fictional |
| League rules and scoring | `src/data/mock/generate.ts` → `LEAGUES` | Placeholder rules |
| Winter/Autumn Series | `src/content/site.ts`, fixtures | Illustrative festival |
| "How to enter" panel | tournament detail page | Labelled illustrative; no online registration or payment exists |

## Placeholders awaiting the club

- **Logo.** The original could not be retrieved. The header shows the club's name in plain type — no invented mark. Drop the file into `public/brand/` and set `SITE_CONTENT.brand.logo.src`.
- **Brand colours.** Tokens are provisional (see DESIGN.md §3). Adjust the five `--brand-*` values once the logo is in hand.
- **Photography.** Every image slot shows a brief of the photograph it needs. Add files to `public/photography/` and set `src` in `src/content/site.ts`.
- **Map pin** coordinates are approximate.

## Needed before production launch

1. Real data source connected and `npm run check:data` passing against it (see DATA_INTEGRATION.md §11 for the questions to ask the club).
2. Confirm everything marked **To confirm** on the site: opening hours, minimum age policy, registration process, renewal/guest policy, parking, map location.
3. Privacy notice, cookie page and responsible-gambling commitments written or approved by the club and its legal adviser. The current site's legal obligations remain in force until then.
4. Re-check support-service numbers on `/responsible-gaming` (sourced from the GRAI "Get help" page, Nov 2026).
5. Player-name publication policy and opt-out agreed.
6. Set `NEXT_PUBLIC_SITE_URL`, deploy, then measure Lighthouse/Core Web Vitals on the real host (not measured here).
7. Add a favicon/app icon derived from the real logo.
