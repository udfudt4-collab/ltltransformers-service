import { failures, feedback, issued, requirements, stock } from "@/mock/dataset";
import { MONTHS } from "@/mock/provinces";
import type { QueryParams } from "@/types";
import { request } from "./api";

export type ReportKey =
  | "monthly"
  | "province"
  | "failure"
  | "rating"
  | "forecast"
  | "feedback"
  | "summary";

export interface ReportDefinition {
  key: ReportKey;
  title: string;
  description: string;
}

export interface ReportResult {
  key: ReportKey;
  columns: string[];
  rows: (string | number)[][];
  generatedAt: string;
}

export const REPORTS: ReportDefinition[] = [
  { key: "monthly", title: "Monthly Report", description: "Stock, issued and failures per month." },
  { key: "province", title: "Province Report", description: "Consolidated activity per EDL office." },
  { key: "failure", title: "Failure Report", description: "Transformer failure register with causes." },
  { key: "rating", title: "Transformer Rating Report", description: "Quantities grouped by kVA rating." },
  { key: "forecast", title: "Forecast Report", description: "Quarterly transformer requirements." },
  { key: "feedback", title: "Feedback Report", description: "Customer satisfaction by province." },
  { key: "summary", title: "Summary Report", description: "One-line executive summary per province." },
];

const inScope = <T extends { provinceCode: string; month: number; year: number }>(
  rows: T[],
  p: QueryParams,
) =>
  rows.filter(
    (r) =>
      (!p.provinceCode || r.provinceCode === p.provinceCode) &&
      (!p.month || r.month === p.month) &&
      (!p.year || r.year === p.year),
  );

function group<T>(rows: T[], key: (row: T) => string) {
  const map = new Map<string, T[]>();
  rows.forEach((row) => {
    const k = key(row);
    map.set(k, [...(map.get(k) ?? []), row]);
  });
  return map;
}

export const reportService = {
  definitions: () => REPORTS,

  generate: (key: ReportKey, params: QueryParams = {}): Promise<ReportResult> =>
    request(() => {
      const generatedAt = new Date().toISOString();
      const s = inScope(stock, params);
      const i = inScope(issued, params);
      const f = inScope(failures, params);
      const fb = inScope(feedback, params);
      const rq = inScope(requirements, params);

      switch (key) {
        case "monthly": {
          const map = group(s, (r) => `${r.year}-${r.month}`);
          return {
            key,
            generatedAt,
            columns: ["Period", "Stock Qty", "Issued Qty", "Failures"],
            rows: [...map.entries()].map(([period, rows]) => {
              const [y, m] = period.split("-").map(Number);
              return [
                `${MONTHS[(m ?? 1) - 1] ?? ""} ${y}`,
                rows.reduce((t, r) => t + r.quantity, 0),
                i.filter((r) => r.year === y && r.month === m).reduce((t, r) => t + r.quantity, 0),
                f.filter((r) => r.year === y && r.month === m).length,
              ];
            }),
          };
        }
        case "province": {
          const map = group(s, (r) => r.provinceCode);
          return {
            key,
            generatedAt,
            columns: ["Province", "Stock Qty", "Issued Qty", "Failures", "Forecast Qty"],
            rows: [...map.entries()].map(([code, rows]) => [
              code,
              rows.reduce((t, r) => t + r.quantity, 0),
              i.filter((r) => r.provinceCode === code).reduce((t, r) => t + r.quantity, 0),
              f.filter((r) => r.provinceCode === code).length,
              rq.filter((r) => r.provinceCode === code).reduce((t, r) => t + r.quantity, 0),
            ]),
          };
        }
        case "failure":
          return {
            key,
            generatedAt,
            columns: ["Province", "Serial No", "Capacity", "Date", "Cause", "Status"],
            rows: f.map((r) => [r.provinceCode, r.serialNumber, r.capacity, r.failureDate, r.cause, r.status]),
          };
        case "rating": {
          const map = group(s, (r) => r.rating);
          return {
            key,
            generatedAt,
            columns: ["Rating", "Stock Qty", "Issued Qty"],
            rows: [...map.entries()].map(([rating, rows]) => [
              rating,
              rows.reduce((t, r) => t + r.quantity, 0),
              i.filter((r) => r.rating === rating).reduce((t, r) => t + r.quantity, 0),
            ]),
          };
        }
        case "forecast":
          return {
            key,
            generatedAt,
            columns: ["Province", "Forecast Month", "Rating", "Quantity", "Status"],
            rows: rq.map((r) => [r.provinceCode, r.forecastMonth, r.rating, r.quantity, r.status]),
          };
        case "feedback": {
          const map = group(fb, (r) => r.provinceCode);
          return {
            key,
            generatedAt,
            columns: ["Province", "Responses", "Average Rating"],
            rows: [...map.entries()].map(([code, rows]) => [
              code,
              rows.length,
              Math.round((rows.reduce((t, r) => t + r.averageRating, 0) / rows.length) * 10) / 10,
            ]),
          };
        }
        case "summary":
        default: {
          const map = group(s, (r) => r.provinceCode);
          return {
            key: "summary" as ReportKey,
            generatedAt,
            columns: ["Province", "Status", "Stock", "Issued", "Failures", "Avg Feedback"],
            rows: [...map.entries()].map(([code, rows]) => {
              const provFb = fb.filter((r) => r.provinceCode === code);
              return [
                code,
                rows[0]?.status ?? "DRAFT",
                rows.reduce((t, r) => t + r.quantity, 0),
                i.filter((r) => r.provinceCode === code).reduce((t, r) => t + r.quantity, 0),
                f.filter((r) => r.provinceCode === code).length,
                provFb.length
                  ? Math.round(
                      (provFb.reduce((t, r) => t + r.averageRating, 0) / provFb.length) * 10,
                    ) / 10
                  : 0,
              ];
            }),
          };
        }
      }
    }),
};
