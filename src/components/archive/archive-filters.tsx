"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchField, Segmented, SelectField } from "@/components/ui/controls";
import { cn } from "@/lib/cn";

/**
 * Archive filters drive the URL; the server re-queries the data provider,
 * so filtering exercises the same path a real API will.
 */
export function ArchiveFilters({ periods, children }: { periods: { value: string; label: string }[]; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    next.delete("limit");
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-4">
          <SelectField label="Period" value={sp.get("period") ?? "90d"} onChange={(v) => push({ period: v === "90d" ? null : v })} options={periods} className="min-w-[13rem]" />
          <div className="flex flex-col gap-1.5">
            <span className="type-eyebrow text-fg-faint">Game</span>
            <Segmented
              label="Game"
              value={(sp.get("game") as "all" | "NLHE" | "PLO") ?? "all"}
              onChange={(v) => push({ game: v === "all" ? null : v })}
              options={[
                { value: "all", label: "All" },
                { value: "NLHE", label: "Hold'em" },
                { value: "PLO", label: "Omaha" },
              ]}
            />
          </div>
        </div>
        <SearchField
          value={q}
          onChange={(v) => {
            setQ(v);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => push({ q: v.trim() || null }), 280);
          }}
          placeholder="Tournament or player"
          label="Search tournaments or players"
          className="w-full lg:w-80"
        />
      </div>
      <div className={cn("transition-opacity duration-300", pending && "opacity-40")} aria-busy={pending}>
        {children}
      </div>
    </>
  );
}
