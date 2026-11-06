"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Phone, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PRIMARY_NAV, FOOTER_NAV, isActive } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { ease, transition } from "@/lib/motion";
import { useLenis } from "@/components/motion/smooth-scroll";

export function SiteHeader({ phoneDisplay, phoneHref }: { phoneDisplay: string; phoneHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const lenis = useLenis();
  const { scrollY } = useScroll();

  // Hide on scroll down, reveal on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    setHidden(y > 240 && y > prev && !open);
  });

  // Close menu after navigation (derived-state pattern).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // Let sticky toolbars follow the header as it hides and reappears.
  useEffect(() => {
    document.documentElement.style.setProperty("--header-offset", hidden ? "0px" : "var(--header-h)");
  }, [hidden]);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  const activeHref = PRIMARY_NAV.find((i) => isActive(pathname, i))?.href ?? null;
  const pill = hovered ?? activeHref;

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.45, ease: ease.out }}
      className={cn(
        "surface-ink sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled ? "border-line bg-ink-950/90 backdrop-blur-md" : "border-transparent"
      )}
    >
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" aria-label="The Eglinton — home" className="-my-2 shrink-0 py-2">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block" onPointerLeave={() => setHovered(null)}>
          <ul className="flex items-center">
            {PRIMARY_NAV.map((item) => {
              const active = item.href === activeHref;
              const lit = item.href === pill;
              return (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onPointerEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      "relative block px-4 py-2.5 text-[0.8125rem] font-bold uppercase tracking-[0.08em] transition-colors duration-200",
                      lit ? "text-ink-950" : active ? "text-fg" : "text-fg-muted hover:text-fg"
                    )}
                  >
                    {lit && <motion.span layoutId="nav-pill" transition={transition.layout} className="absolute inset-0 bg-fg" />}
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={phoneHref}
            className="nums hidden items-center gap-2 text-[0.8125rem] font-bold tracking-[0.04em] text-fg transition-colors hover:text-accent-text xl:inline-flex"
          >
            <Phone aria-hidden className="size-3.5" strokeWidth={2} />
            {phoneDisplay}
          </a>
          <Link
            href="/schedule"
            className="hidden h-10 items-center bg-red-brand px-4 text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white hover:text-ink-950 md:inline-flex"
          >
            Tonight
          </Link>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="group -mr-2 inline-flex h-11 items-center gap-3 px-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] lg:hidden" aria-label="Open menu">
              <span className="hidden sm:inline">Menu</span>
              <span aria-hidden className="flex w-6 flex-col gap-1.5">
                <span className="h-0.5 w-full bg-fg transition-transform group-hover:translate-x-0.5" />
                <span className="h-0.5 w-4/6 bg-fg transition-all group-hover:w-full" />
              </span>
            </Dialog.Trigger>
            <AnimatePresence>
              {open && (
                <Dialog.Portal forceMount>
                  <Dialog.Content asChild forceMount aria-describedby={undefined}>
                    <motion.div
                      className="surface-ink fixed inset-0 z-50 flex flex-col overflow-y-auto"
                      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
                      transition={{ duration: 0.6, ease: ease.inOut }}
                      data-lenis-prevent
                    >
                      <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line">
                        <Dialog.Title asChild>
                          <span>
                            <Logo />
                          </span>
                        </Dialog.Title>
                        <Dialog.Close className="-mr-2 inline-flex size-11 items-center justify-center" aria-label="Close menu">
                          <X className="size-6" strokeWidth={2} />
                        </Dialog.Close>
                      </div>
                      <ul className="container-site flex-1 pt-6">
                        {[{ href: "/", label: "Home" }, ...PRIMARY_NAV].map((item, i) => {
                          const active = item.href === "/" ? pathname === "/" : isActive(pathname, item);
                          return (
                            <li key={item.href} className="overflow-hidden border-b border-line">
                              <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: ease.expo, delay: 0.2 + i * 0.05 }}>
                                <Link
                                  href={item.href}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    "flex items-center justify-between py-3 font-display text-[clamp(2.75rem,12vw,4.5rem)] uppercase leading-[0.95]",
                                    active ? "text-accent-text" : "text-fg"
                                  )}
                                >
                                  <span className="flex items-baseline gap-4">
                                    <span className="nums font-sans text-[0.75rem] font-bold tracking-[0.1em] text-fg-faint">0{i + 1}</span>
                                    {item.label}
                                  </span>
                                  <ArrowUpRight aria-hidden className="size-7" strokeWidth={1.75} />
                                </Link>
                              </motion.div>
                            </li>
                          );
                        })}
                      </ul>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="container-site grid gap-5 py-8 text-[0.875rem]"
                      >
                        <a href={phoneHref} className="nums inline-flex h-14 items-center justify-center gap-2 bg-red-brand font-extrabold uppercase tracking-[0.1em] text-white">
                          <Phone aria-hidden className="size-4" strokeWidth={2} /> Call {phoneDisplay}
                        </a>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-fg-muted">
                          {FOOTER_NAV[2].items.map((i) => (
                            <Link key={i.href} href={i.href} className="hover:text-fg">
                              {i.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </div>
    </motion.header>
  );
}
