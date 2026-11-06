import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Verification } from "@/content/types";

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

type ButtonVariant = "primary" | "secondary" | "quiet";
type ButtonSize = "md" | "lg";

const buttonBase =
  "group/btn relative isolate inline-flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap font-sans font-extrabold uppercase tracking-[0.08em] transition-[color,border-color,transform] duration-300 ease-out select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-y-100";

const buttonVariants: Record<ButtonVariant, string> = {
  // Fill wipes up from the bottom on hover.
  primary: "bg-accent text-accent-fg before:bg-invert-bg hover:text-invert-fg",
  secondary: "border border-fg text-fg before:bg-fg hover:text-bg",
  quiet: "text-fg hover:text-accent-text before:hidden",
};

const buttonSizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[0.8125rem]",
  lg: "h-14 px-7 text-[0.875rem]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(buttonBase, buttonVariants[variant], variant === "quiet" ? "h-auto px-0" : buttonSizes[size], className);
}

function Arrow() {
  return (
    <ArrowRight
      aria-hidden
      className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover/btn:translate-x-1"
      strokeWidth={2.25}
    />
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean }) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean }) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </button>
  );
}

/** Inline text link with a drawn rule. */
export function TextLink({ className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link className={cn("group/btn inline-flex items-center gap-2 font-semibold text-fg hover:text-accent-text", className)} {...rest}>
      <span className="link-rule pb-1 text-[0.8125rem] font-extrabold uppercase tracking-[0.1em]">{children}</span>
      <Arrow />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Typography helpers                                                         */
/* -------------------------------------------------------------------------- */

export function Eyebrow({ children, className, rule = false }: { children: ReactNode; className?: string; rule?: boolean }) {
  return (
    <p className={cn("type-eyebrow flex items-center gap-3 text-detail", className)}>
      {rule && <span aria-hidden className="h-[3px] w-7 bg-current" />}
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
  className,
  as: Tag = "h2",
  size = "l",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "l" | "m";
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12", className)}>
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow className="mb-5" rule>{eyebrow}</Eyebrow>}
        <Tag className={size === "xl" ? "type-display-xl" : size === "l" ? "type-display-l" : "type-display-m"}>{title}</Tag>
        {lede && <div className="type-lede mt-5 max-w-2xl text-fg-muted">{lede}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

/** Unambiguous but quiet marker for sample data. */
export function DemoTag({ className, children = "Demo data" }: { className?: string; children?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border border-dashed border-line-strong px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-fg-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

const verifyCopy: Record<Verification, string | null> = {
  confirmed: null,
  "to-confirm": "To confirm",
  demo: "Demo",
};

export function VerifyMark({ verification, className }: { verification: Verification; className?: string }) {
  const label = verifyCopy[verification];
  if (!label) return null;
  return (
    <span
      title={verification === "to-confirm" ? "Not yet confirmed by the club — verify before launch" : "Illustrative content for the demo"}
      className={cn(
        "ml-2 inline-flex translate-y-[-1px] items-center border border-dashed px-1.5 py-px align-middle text-[0.625rem] font-semibold uppercase tracking-[0.12em]",
        verification === "to-confirm" ? "border-detail/60 text-detail" : "border-line-strong text-fg-muted",
        className
      )}
    >
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* States                                                                     */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-4 border-y border-line py-14 md:items-center md:text-center", className)} role="status">
      <span aria-hidden className="font-display text-6xl leading-none text-accent-text">
        00
      </span>
      <p className="type-display-s">{title}</p>
      {body && <div className="max-w-md text-fg-muted">{body}</div>}
      {action}
    </div>
  );
}

export function ErrorState({ title = "This information isn't available right now", detail }: { title?: string; detail?: string }) {
  return (
    <div role="alert" className="border-l-4 border-accent bg-bg-raised px-6 py-8">
      <p className="type-display-s">{title}</p>
      <p className="mt-2 max-w-xl text-fg-muted">
        Please try again in a moment. If the problem continues, call the club on 091 569632.
      </p>
      {detail && process.env.NODE_ENV !== "production" && <p className="mt-4 font-mono text-xs text-fg-faint">{detail}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse bg-fg/[0.07]", className)} />;
}
