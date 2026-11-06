"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, MapPin } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard unavailable — no-op */
        }
      }}
      className="inline-flex h-9 items-center gap-1.5 border border-line px-3 text-[0.8125rem] font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      {copied ? <Check aria-hidden className="size-3.5 text-positive" /> : <Copy aria-hidden className="size-3.5" />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

/**
 * Map with a privacy-first load: nothing is requested from a third party
 * until the visitor asks for the interactive map.
 */
export function MapPanel({ lat, lng, query, approximate }: { lat: number; lng: number; query: string; approximate: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const d = 0.006;
  const bbox = [lng - d * 1.6, lat - d, lng + d * 1.6, lat + d].join(",");
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return (
    <div className="relative overflow-hidden border border-line bg-bg-raised">
      <div className="relative aspect-[4/3] w-full md:aspect-[16/11]">
        {loaded ? (
          <iframe
            title="Map showing The Eglinton on Eglinton Street, Galway"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
            className="absolute inset-0 h-full w-full grayscale-[0.4]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
            {/* Abstract street grid — decorative only */}
            <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.18]" preserveAspectRatio="none" viewBox="0 0 400 280">
              <g stroke="currentColor" strokeWidth="1" fill="none">
                <path d="M-10 60 L410 95" />
                <path d="M-10 150 L410 120" />
                <path d="M-10 230 L410 250" />
                <path d="M80 -10 L120 290" />
                <path d="M210 -10 L190 290" />
                <path d="M320 -10 L350 290" />
                <path d="M0 200 C120 170 260 210 400 180" strokeWidth="6" opacity="0.5" />
              </g>
            </svg>
            <span className="relative inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[0_0_0_8px_color-mix(in_oklab,var(--accent)_25%,transparent)]">
              <MapPin aria-hidden className="size-5" strokeWidth={1.75} />
            </span>
            <p className="relative max-w-xs text-[0.875rem] text-fg-muted">
              The interactive map loads from OpenStreetMap only when you ask for it.
            </p>
            <div className="relative flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={() => setLoaded(true)}>
                Show map
              </Button>
              <a href={gmaps} target="_blank" rel="noreferrer" className={buttonClasses("quiet", "md", "text-[0.875rem]")}>
                <span className="link-rule">Open in Google Maps</span>
                <ExternalLink aria-hidden className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
      {approximate && (
        <p className={cn("border-t border-line px-4 py-2 text-[0.75rem] text-fg-faint")}>Pin position is approximate — confirm the exact location before launch.</p>
      )}
    </div>
  );
}

/** Composes an email in the visitor's own mail app. No data is sent by the site. */
export function ContactForm({ email }: { email: string }) {
  const [topic, setTopic] = useState("General question");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const href = `mailto:${email}?subject=${encodeURIComponent(`${topic}${name ? ` — ${name}` : ""}`)}&body=${encodeURIComponent(message)}`;
  const field = "w-full border border-line bg-transparent px-3 text-[0.9375rem] text-fg placeholder:text-fg-faint focus:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = href;
      }}
      className="grid gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="type-eyebrow text-fg-faint">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={cn(field, "h-11")} />
        </label>
        <label className="grid gap-1.5">
          <span className="type-eyebrow text-fg-faint">Topic</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className={cn(field, "select-reset h-11 bg-bg")}>
            {["General question", "Membership", "Tournaments", "Private events", "Feedback"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="type-eyebrow text-fg-faint">Message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required className={cn(field, "py-3")} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" arrow>
          Write email
        </Button>
        <p className="text-[0.8125rem] text-fg-faint">Opens your email app, addressed to {email}.</p>
      </div>
    </form>
  );
}
