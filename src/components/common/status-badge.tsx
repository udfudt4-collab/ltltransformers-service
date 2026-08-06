import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/types";

const MAP: Record<SubmissionStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  SUBMITTED: { label: "Submitted", className: "bg-info/10 text-info border-info/30" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-accent/10 text-accent border-accent/30" },
  RETURNED: {
    label: "Returned",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  APPROVED: { label: "Approved", className: "bg-success/10 text-success border-success/30" },
  LOCKED: { label: "Locked", className: "bg-warning/15 text-warning border-warning/40" },
};

export function StatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  const item = MAP[status] ?? MAP.DRAFT;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        item.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {item.label}
    </span>
  );
}

export const STATUS_OPTIONS: SubmissionStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "RETURNED",
  "APPROVED",
  "LOCKED",
];

export const statusLabel = (status: SubmissionStatus) => MAP[status]?.label ?? status;
