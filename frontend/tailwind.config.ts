import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: "#FFFFFF",
        "surface-2": "#F7F8FA",
        "sidebar-bg": "#FAFAFB",
        border: "#E5E7EB",

        // Text
        ink: "#111827",
        "ink-2": "#4B5563",
        "ink-3": "#9CA3AF",

        // Data
        navy: "#1E3A8A",
        "navy-2": "#60A5FA",

        // States
        amber: "#D97706",
        "amber-bg": "#FEF3C7",
        teal: "#0D9488",
        "teal-bg": "#CCFBF1",

        // AI / graph reasoning (purple is reserved for AI surfaces only)
        ai: "#7C3AED",
        "ai-bg": "#F5F3FF",
        "ai-active": "#EDE9FE",
        "ai-active-text": "#6D28D9",

        // Source pill backgrounds and texts
        "src-news-bg": "#DBEAFE",
        "src-news": "#1E40AF",
        "src-analyst-bg": "#E0E7FF",
        "src-analyst": "#4338CA",
        "src-crm-bg": "#DCFCE7",
        "src-crm": "#166534",
        "src-cpq-bg": "#FED7AA",
        "src-cpq": "#9A3412",
        "src-social-bg": "#FCE7F3",
        "src-social": "#9D174D",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(124, 58, 237, 0.15)" },
          "50%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.5s ease-out both",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "count-up": "count-up 0.6s ease-out both",
      },
      boxShadow: {
        "glass": "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.5) inset",
        "glass-hover": "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.6) inset",
        "elevated": "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)",
        "depth": "0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
