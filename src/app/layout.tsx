import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter-tight/index.css";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemoBar } from "@/components/layout/demo-bar";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ScrollProgress } from "@/components/motion/kinetic";
import { getContent } from "@/content/provider";
import { getDataProvider } from "@/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Eglinton Casino & Card Club · Poker in Galway",
    template: "%s · The Eglinton, Galway",
  },
  description:
    "Texas Hold'em and Omaha tournaments and cash games, blackjack and roulette on Eglinton Street, Galway. See what's on and come take a seat.",
  openGraph: {
    type: "website",
    locale: "en_IE",
    siteName: "The Eglinton Casino & Card Club",
  },
  formatDetection: { telephone: false },
  robots: process.env.NEXT_PUBLIC_DATA_MODE === "api" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const content = await getContent();
  const isDemo = getDataProvider().isDemo;
  return (
    <html lang="en-IE" className="h-full">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-[80] bg-red-brand px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScroll>
            <ScrollProgress />
            {isDemo && <DemoBar />}
            <SiteHeader phoneDisplay={content.visit.phoneDisplay} phoneHref={content.visit.phoneHref} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter content={content} isDemo={isDemo} />
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
