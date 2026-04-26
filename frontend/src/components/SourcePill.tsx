import { COLORS, type SourceType } from "../lib/colors";

export function SourcePill({ sourceType }: { sourceType: SourceType }) {
  const color = COLORS.src[sourceType] ?? COLORS.src.news;
  return (
    <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: color.bg, color: color.text }}>
      {sourceType[0].toUpperCase() + sourceType.slice(1)}
    </span>
  );
}

