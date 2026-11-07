import Image from "next/image";
import { cn } from "@/lib/cn";
import { SITE_CONTENT } from "@/content/site";

/**
 * The club's crest beside the "The Eglinton" wordmark.
 *
 * The crest file lives in /public/brand/ and is set in
 * SITE_CONTENT.brand.logo (src/content/site.ts). With `src: null` only the
 * wordmark renders.
 *
 *   md — header and mobile menu
 *   lg — larger inline uses
 *   xl — footer: crest above a full-width wordmark
 */
export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "lg" | "xl" }) {
  const { logo, name } = SITE_CONTENT.brand;

  const crest = logo.src ? (
    <Image
      src={logo.src}
      alt=""
      aria-hidden
      width={logo.width}
      height={logo.height}
      priority={size !== "xl"}
      sizes={size === "xl" ? "120px" : size === "lg" ? "60px" : "44px"}
      className={cn(
        "w-auto shrink-0 select-none",
        size === "xl" ? "h-[clamp(4.5rem,8vw,7.5rem)]" : size === "lg" ? "h-14" : "h-10"
      )}
    />
  ) : null;

  const wordmark = (
    <span className="inline-flex items-center gap-2 leading-none">
      <span
        aria-hidden
        className={cn(
          "font-display uppercase tracking-[0.01em] [font-stretch:75%]",
          size === "xl" ? "text-[clamp(4rem,13vw,13rem)] leading-[0.82] [font-stretch:62%]" : size === "lg" ? "text-[2.5rem]" : "text-[1.5rem]"
        )}
      >
        The Eglinton
      </span>
      <span
        aria-hidden
        className={cn("shrink-0 rounded-full bg-red-brand", size === "xl" ? "mb-[1.2vw] size-[clamp(0.9rem,2.4vw,2.5rem)] self-end" : size === "lg" ? "size-3" : "size-2")}
      />
    </span>
  );

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex text-fg",
        size === "xl" ? "flex-col items-start gap-[clamp(1rem,2vw,2rem)]" : "items-center gap-3",
        className
      )}
    >
      {crest}
      {wordmark}
    </span>
  );
}
