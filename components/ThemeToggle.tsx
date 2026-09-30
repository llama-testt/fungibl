"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
import { THEME_KEY } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) || "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    setTheme(next);
    window.dispatchEvent(new CustomEvent("fungibl-theme", { detail: next }));
  }

  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light" : "Dark"}
      className={`relative flex h-9 w-9 items-center justify-center text-ink/85 transition-opacity hover:opacity-60 ${className}`}
    >
      {/* sun */}
      <svg
        viewBox="0 0 20 20"
        className={`absolute h-[19px] w-[19px] transition-all duration-500 ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <circle cx="10" cy="10" r="3.6" />
        <path d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M4 4l1.5 1.5M14.5 14.5 16 16M16 4l-1.5 1.5M5.5 14.5 4 16" />
      </svg>
      {/* moon */}
      <svg
        viewBox="0 0 20 20"
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8Z" />
      </svg>
    </button>
  );
}

export function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />
    </svg>
  );
}
