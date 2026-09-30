"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`arrow inline-block h-[0.95em] w-[0.95em] ${className}`} aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export function SwapGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M6 18h34M32 10l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M42 30H8M16 22l-8 8 8 8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** Split-circle mark: fungible half / non-fungible half. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 1.4a8.6 8.6 0 0 1 0 17.2z" fill="currentColor" />
      <rect x="4.2" y="7" width="2.2" height="2.2" fill="currentColor" />
      <rect x="4.2" y="10.8" width="2.2" height="2.2" fill="currentColor" />
    </svg>
  );
}

type BtnProps = { href: string; children: ReactNode; variant?: "primary" | "ghost" | "paper"; className?: string; arrow?: boolean };

export function Button({ href, children, variant = "primary", className = "", arrow = false }: BtnProps) {
  const styles = {
    primary: "bg-charcoal text-paper border border-charcoal hover:bg-charcoal/90",
    ghost: "border border-ink/80 text-ink hover:bg-ink/[0.04]",
    paper: "bg-paper-light/95 text-ink border border-paper-light hover:bg-paper-light",
  }[variant];
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-3 rounded-[4px] px-7 py-[15px] font-mono text-[14px] tracking-[0.01em] transition-colors duration-500 ${styles} ${className}`}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** Fades content upward when it enters the viewport. */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`font-mono text-[11px] uppercase tracking-label text-muted ${className}`}>{children}</p>;
}

/** Thin editorial section header: index / label on the left, rule across. */
export function SectionHead({ index, label, right }: { index: string; label: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-line pb-4 font-mono text-[11px] uppercase tracking-label text-muted">
      <span className="text-ink">{index}</span>
      <span>{label}</span>
      <span className="ml-auto">{right}</span>
    </div>
  );
}
