import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/** Movement since the comparison snapshot. Positive = climbed. */
export function RankDelta({ rank, previousRank, className }: { rank: number; previousRank: number | null; className?: string }) {
  if (previousRank == null) {
    return <span className={cn("inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-accent-text", className)}>New</span>;
  }
  const diff = previousRank - rank;
  if (diff === 0) {
    return (
      <span className={cn("inline-flex items-center text-fg-faint", className)}>
        <Minus aria-hidden className="size-3" strokeWidth={2.5} />
        <span className="sr-only">No change</span>
      </span>
    );
  }
  const up = diff > 0;
  return (
    <span className={cn("nums inline-flex items-center gap-0.5 text-[0.8125rem] font-extrabold", up ? "text-positive" : "text-negative", className)}>
      {up ? <ArrowUp aria-hidden className="size-3" strokeWidth={3} /> : <ArrowDown aria-hidden className="size-3" strokeWidth={3} />}
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      {Math.abs(diff)}
    </span>
  );
}
