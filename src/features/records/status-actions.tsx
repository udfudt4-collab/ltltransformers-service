import { CheckCircle2, Lock, MoreHorizontal, RotateCcw, Search, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubmissionStatus } from "@/types";

/** LTL administrator review actions available on every submission row. */
export function StatusActions({
  status,
  onChange,
}: {
  status: SubmissionStatus;
  onChange: (status: SubmissionStatus) => void;
}) {
  const act = (next: SubmissionStatus, message: string) => {
    onChange(next);
    toast.success(message);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Review actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Review</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => act("UNDER_REVIEW", "Marked under review")}>
          <Search className="mr-2 h-4 w-4" /> Mark under review
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => act("APPROVED", "Submission approved")}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => act("RETURNED", "Returned for correction")}>
          <RotateCcw className="mr-2 h-4 w-4" /> Return for correction
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status === "LOCKED" ? (
          <DropdownMenuItem onClick={() => act("APPROVED", "Month unlocked")}>
            <Unlock className="mr-2 h-4 w-4" /> Unlock month
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => act("LOCKED", "Month locked")}>
            <Lock className="mr-2 h-4 w-4" /> Lock month
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
