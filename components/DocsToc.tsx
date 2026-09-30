"use client";

import { useEffect, useState } from "react";

/** Sticky table of contents that follows the section in view. */
export function DocsToc({ items }: { items: { id: string; label: string; n: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="sticky top-10">
      <p className="label">On this page</p>
      <ol className="mt-5 space-y-[10px] font-mono text-[12px]">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={`group flex gap-3 transition-colors ${active === i.id ? "text-ink" : "text-muted hover:text-ink"}`}>
              <span className="w-5 text-muted">{i.n}</span>
              <span className={`u-link ${active === i.id ? "![background-size:100%_1px]" : ""}`}>{i.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
