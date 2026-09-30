import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "rgb(var(--paper) / <alpha-value>)", deep: "rgb(var(--paper-deep) / <alpha-value>)", light: "rgb(var(--paper-light) / <alpha-value>)" },
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", soft: "rgb(var(--ink-soft) / <alpha-value>)" },
        muted: "rgb(var(--muted) / <alpha-value>)",
        charcoal: "rgb(var(--charcoal) / <alpha-value>)",
        line: "rgb(var(--ink) / 0.2)",
        lineDark: "rgba(239, 228, 206, 0.28)",
        cream: "#EFE4CE",
        moss: "rgb(var(--moss) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "Menlo", "monospace"],
      },
      letterSpacing: { tightest: "-0.045em", tighter2: "-0.03em", label: "0.08em" },
      transitionTimingFunction: { slow: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
      boxShadow: {
        object: "0 1px 0 rgba(255,255,255,0.35) inset, 0 40px 80px -30px rgba(60,40,15,0.45), 0 18px 40px -20px rgba(60,40,15,0.35), 0 2px 6px rgba(60,40,15,0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
