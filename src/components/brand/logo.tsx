import Image from "next/image";
import { cn } from "@/lib/cn";
import { SITE_CONTENT } from "@/content/site";

/**
 * LOGO SLOT — the club's ORIGINAL logo belongs here.
 *
 * The original artwork could not be retrieved from the build environment.
 * Until it is supplied, this renders the club's name in the display face
 * (no invented symbol). To install the real logo:
 *   1. Put the file in /public/brand/ (SVG preferred, transparent PNG fine).
 *   2. Set SITE_CONTENT.brand.logo.src (and width/height) in src/content/site.ts.
 */
export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "lg" | "xl" }) {
  const { logo, name } = SITE_CONTENT.brand;
  if (logo.src) {
    const scale = size === "xl" ? 2.4 : size === "lg" ? 1.6 : 1;
    return <Image src={logo.src} alt={logo.alt} width={logo.width * scale} height={logo.height * scale} priority className={cn("h-auto", className)} />;
  }
  return (
    <span data-placeholder="logo" aria-label={name} className={cn("inline-flex items-center gap-2 leading-none text-fg", className)}>
      <span
        aria-hidden
        className={cn(
          "font-display uppercase tracking-[0.01em] [font-stretch:75%]",
          size === "xl" ? "text-[clamp(4rem,13vw,13rem)] leading-[0.82] [font-stretch:62%]" : size === "lg" ? "text-[2.5rem]" : "text-[1.5rem]"
        )}
      >
        The Eglinton
      </span>
      <span aria-hidden className={cn("shrink-0 rounded-full bg-red-brand", size === "xl" ? "size-[clamp(0.9rem,2.4vw,2.5rem)] self-end mb-[1.2vw]" : size === "lg" ? "size-3" : "size-2")} />
    </span>
  );
}
