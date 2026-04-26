import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  className = "",
  variant = "default",
  children,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: "default" | "glass" | "elevated";
  children: ReactNode;
}) {
  const base = variant === "elevated"
    ? "elevated-card rounded-xl p-5"
    : variant === "glass"
    ? "glass-card rounded-xl p-5"
    : "glass-card rounded-xl p-5";

  return (
    <section className={`${base} ${className}`}>
      {title ? (
        <div className="mb-4">
          <div className="text-sm font-bold text-ink tracking-tight">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-ink-2 leading-relaxed">{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
