// Color tokens, mirrored from tailwind.config.ts so SVG and recharts code
// can reference the same hex values without going through CSS variables.

export const COLORS = {
  surface: "#FFFFFF",
  surface2: "#F7F8FA",
  sidebarBg: "#FAFAFB",
  border: "#E5E7EB",

  ink: "#111827",
  ink2: "#4B5563",
  ink3: "#9CA3AF",

  navy: "#1E3A8A",
  navy2: "#60A5FA",

  amber: "#D97706",
  amberBg: "#FEF3C7",
  teal: "#0D9488",
  tealBg: "#CCFBF1",

  ai: "#7C3AED",
  aiBg: "#F5F3FF",
  aiActive: "#EDE9FE",
  aiActiveText: "#6D28D9",

  src: {
    news: { bg: "#DBEAFE", text: "#1E40AF" },
    analyst: { bg: "#E0E7FF", text: "#4338CA" },
    crm: { bg: "#DCFCE7", text: "#166534" },
    cpq: { bg: "#FED7AA", text: "#9A3412" },
    social: { bg: "#FCE7F3", text: "#9D174D" },
  },
} as const;

export type SourceType = "news" | "analyst" | "crm" | "cpq" | "social";
