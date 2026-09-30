import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#EFE4CE", deep: "#E6D8BD", light: "#F5EDDC" },
        ink: { DEFAULT: "#20201E", soft: "#3A3833" },
        muted: "#6B6258",
        charcoal: "#22211F",
        line: "rgba(32, 32, 30, 0.22)",
        lineDark: "rgba(239, 228, 206, 0.28)",
        moss: "#6E7358",
        clay: "#A0694A",
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
