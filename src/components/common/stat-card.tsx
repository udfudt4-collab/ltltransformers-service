import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}

const TONES = {
  default: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/15",
  danger: "text-destructive bg-destructive/10",
  info: "text-info bg-info/10",
} as const;

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <div className="panel flex items-start gap-3 p-4">
      {Icon && (
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md", TONES[tone])}>
          <Icon className="h-4.5 w-4.5" aria-hidden />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="numeric mt-1 text-2xl leading-none font-semibold">{value}</p>
        {hint && <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
