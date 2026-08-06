import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS, PROVINCES, TRANSFORMER_RATINGS } from "@/mock/provinces";
import { STATUS_OPTIONS, statusLabel } from "./status-badge";
import type { QueryParams } from "@/types";

const ALL = "__all__";
const YEARS = [2026, 2025, 2024];

export interface FilterConfig {
  province?: boolean;
  period?: boolean;
  status?: boolean;
  rating?: boolean;
}

interface FilterBarProps {
  value: QueryParams;
  onChange: (next: QueryParams) => void;
  show?: FilterConfig;
  searchPlaceholder?: string;
}

export function FilterBar({
  value,
  onChange,
  show = { province: true, period: true, status: true },
  searchPlaceholder = "Search records…",
}: FilterBarProps) {
  const set = (patch: QueryParams) => onChange({ ...value, ...patch, page: 1 });
  const active =
    Boolean(value.search) ||
    Boolean(value.provinceCode) ||
    Boolean(value.month) ||
    Boolean(value.year) ||
    Boolean(value.status) ||
    Boolean(value.rating);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={value.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label="Search"
        />
      </div>

      {show.province && (
        <Select
          value={value.provinceCode ?? ALL}
          onValueChange={(v) => set({ provinceCode: v === ALL ? undefined : v })}
        >
          <SelectTrigger className="w-full sm:w-[190px]" aria-label="Province">
            <SelectValue placeholder="Province" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All provinces</SelectItem>
            {PROVINCES.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show.period && (
        <>
          <Select
            value={value.month ? String(value.month) : ALL}
            onValueChange={(v) => set({ month: v === ALL ? undefined : Number(v) })}
          >
            <SelectTrigger className="w-full sm:w-[140px]" aria-label="Month">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All months</SelectItem>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={value.year ? String(value.year) : ALL}
            onValueChange={(v) => set({ year: v === ALL ? undefined : Number(v) })}
          >
            <SelectTrigger className="w-full sm:w-[110px]" aria-label="Year">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All years</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {show.status && (
        <Select
          value={value.status ?? ALL}
          onValueChange={(v) =>
            set({ status: v === ALL ? undefined : (v as QueryParams["status"]) })
          }
        >
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show.rating && (
        <Select
          value={value.rating ?? ALL}
          onValueChange={(v) => set({ rating: v === ALL ? undefined : v })}
        >
          <SelectTrigger className="w-full sm:w-[140px]" aria-label="Rating">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All ratings</SelectItem>
            {TRANSFORMER_RATINGS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {active && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ page: 1, pageSize: value.pageSize ?? 10 })}>
          <X className="mr-1 h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  );
}
