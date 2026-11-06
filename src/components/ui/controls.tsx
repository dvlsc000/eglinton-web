"use client";

import { motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { transition } from "@/lib/motion";

/** Segmented control with a sliding indicator. Keyboard: arrow keys move. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = "md",
}: {
  options: { value: T; label: React.ReactNode; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex items-center border border-line-strong p-0.5", className)}
      onKeyDown={(e) => {
        const i = options.findIndex((o) => o.value === value);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(options[(i + 1) % options.length].value);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(options[(i - 1 + options.length) % options.length].value);
        }
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative inline-flex items-center gap-2 whitespace-nowrap font-bold uppercase tracking-[0.06em] transition-colors duration-200",
              size === "sm" ? "h-8 px-3 text-[0.75rem]" : "h-10 px-4 text-[0.78125rem]",
              active ? "text-bg" : "text-fg-muted hover:text-fg"
            )}
          >
            {active && <motion.span layoutId={`seg-${id}`} transition={transition.layout} className="absolute inset-0 bg-fg" />}
            <span className="relative">{o.label}</span>
            {o.count != null && <span className={cn("nums relative text-[0.75rem]", active ? "text-bg/60" : "text-fg-faint")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Toggleable filter chip (multi-select). */
export function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 border px-3 text-[0.8125rem] font-medium transition-colors duration-200",
        pressed ? "border-fg bg-fg text-bg" : "border-line-strong text-fg-muted hover:border-fg hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-faint" strokeWidth={1.75} />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 w-full border border-line-strong bg-transparent pl-9 pr-9 text-[0.9375rem] text-fg placeholder:text-fg-faint transition-colors focus:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center text-fg-faint hover:text-fg"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
  hideLabel = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("type-eyebrow text-fg-faint", hideLabel && "sr-only")}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-reset h-10 w-full border border-line-strong bg-bg pl-3 text-[0.8125rem] font-bold uppercase tracking-[0.04em] text-fg transition-colors hover:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Updates the URL query without a navigation (shareable filter state). */
export function replaceQuery(params: Record<string, string | null | undefined>) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState(null, "", url.pathname + (url.search ? url.search : "") + url.hash);
}
