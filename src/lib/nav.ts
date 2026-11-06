export type NavItem = { href: string; label: string; match?: string[] };

export const PRIMARY_NAV: NavItem[] = [
  { href: "/schedule", label: "Schedule", match: ["/schedule", "/tournaments"] },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/leagues/tournament", label: "Leagues", match: ["/leagues"] },
  { href: "/archive", label: "Results" },
  { href: "/club", label: "The Club" },
  { href: "/visit", label: "Visit" },
];

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Poker",
    items: [
      { href: "/schedule", label: "Tournament schedule" },
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/leagues/tournament", label: "Tournament League" },
      { href: "/leagues/cash", label: "Cash League" },
      { href: "/archive", label: "Results archive" },
    ],
  },
  {
    title: "The club",
    items: [
      { href: "/club", label: "About the club" },
      { href: "/visit", label: "Visit & contact" },
      { href: "/visit#membership", label: "Membership" },
      { href: "/visit#faq", label: "Questions" },
    ],
  },
  {
    title: "Policies",
    items: [
      { href: "/responsible-gaming", label: "Responsible gaming" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

export function isActive(pathname: string, item: NavItem) {
  const prefixes = item.match ?? [item.href];
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
