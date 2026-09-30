import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  trend?: {
    value: string;
    positive?: boolean;
    label?: string;
  };
}

const TONES = {
  default: {
    icon: "text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-400/10 border-sky-500/20",
    glow: "group-hover:border-sky-500/30",
  },
  success: {
    icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/20",
    glow: "group-hover:border-emerald-500/30",
  },
  warning: {
    icon: "text-amber-600 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-400/15 border-amber-500/20",
    glow: "group-hover:border-amber-500/30",
  },
  danger: {
    icon: "text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-400/10 border-rose-500/20",
    glow: "group-hover:border-rose-500/30",
  },
  info: {
    icon: "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10 border-blue-500/20",
    glow: "group-hover:border-blue-500/30",
  },
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  trend,
}: StatCardProps) {
  const toneConfig = TONES[tone];

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        toneConfig.glow
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="numeric mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
        </div>

        {Icon && (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
              toneConfig.icon
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
      </div>

      {(hint || trend) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs">
          {hint && <span className="truncate text-muted-foreground">{hint}</span>}
          {trend && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 font-medium",
                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
