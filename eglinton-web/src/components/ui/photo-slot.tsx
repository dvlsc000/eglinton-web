import Image from "next/image";
import { Camera } from "lucide-react";
import type { Image as ContentImage } from "@/content/types";
import { cn } from "@/lib/cn";

type Tone = "tungsten" | "felt" | "claret" | "night";

const tones: Record<Tone, string> = {
  // Layered light fields that read as a low-lit room, not as a "gradient".
  tungsten: "bg-[radial-gradient(120%_80%_at_30%_25%,#4a3a2a_0%,#231c16_38%,#111010_70%,#0a0a0a_100%)]",
  felt: "bg-[radial-gradient(110%_75%_at_60%_40%,#2f5446_0%,#1a2f27_42%,#0f1714_75%,#0b0d0c_100%)]",
  claret: "bg-[radial-gradient(70%_60%_at_55%_40%,#5b3a2c_0%,#2a1a16_50%,#100c0b_85%,#0a0a0a_100%)]",
  night: "bg-[radial-gradient(120%_90%_at_40%_20%,#2a2f33_0%,#171a1c_45%,#0d0f10_80%,#0a0b0b_100%)]",
};

/**
 * Art-directed image slot. With a `src` it renders a responsive next/image;
 * without one it renders a designed placeholder that states what photograph
 * belongs there, so stakeholders review composition, not stock imagery.
 */
export function PhotoSlot({
  image,
  tone = "tungsten",
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  showBrief = true,
  captionPosition = "bottom",
  children,
}: {
  image: ContentImage;
  tone?: Tone;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showBrief?: boolean;
  captionPosition?: "top" | "bottom";
  children?: React.ReactNode;
}) {
  return (
    <figure className={cn(!className?.includes("absolute") && "relative", "isolate overflow-hidden bg-ink-900", className)}>
      {image.src ? (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div role="img" aria-label={`${image.alt} (photograph to be supplied)`} className={cn("grain absolute inset-0", tones[tone])}>
          {/* soft light pools suggesting pendant lamps over tables */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(35%_28%_at_28%_30%,rgba(255,214,150,0.16),transparent_70%),radial-gradient(30%_24%_at_72%_58%,rgba(255,200,140,0.10),transparent_70%)]" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.55))]" />
        </div>
      )}
      {children}
      {!image.src && showBrief && (
        <figcaption
          className={cn(
            "absolute left-3 right-3 flex items-start gap-2 text-[0.6875rem] leading-snug tracking-[0.02em] text-ivory-100/60",
            captionPosition === "top" ? "top-3" : "bottom-3"
          )}
        >
          <Camera aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={1.5} />
          <span>{image.brief}</span>
        </figcaption>
      )}
    </figure>
  );
}
