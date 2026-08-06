import { failures, feedback, issued, requirements, stock } from "@/mock/dataset";
import type { QueryParams } from "@/types";
import { request } from "./api";

export interface SearchHit {
  id: string;
  module: "Stock" | "Issued" | "Failure" | "Feedback" | "Requirement";
  provinceCode: string;
  period: string;
  title: string;
  detail: string;
  status: string;
}

const period = (m: number, y: number) => `${String(m).padStart(2, "0")}/${y}`;

export const searchService = {
  query: (term: string, filters: QueryParams = {}): Promise<SearchHit[]> =>
    request(() => {
      const t = term.trim().toLowerCase();
      const match = (haystack: string) => !t || haystack.toLowerCase().includes(t);
      const scoped = <T extends { provinceCode: string; month: number; year: number; status: string; rating?: string }>(
        rows: T[],
      ) =>
        rows.filter(
          (r) =>
            (!filters.provinceCode || r.provinceCode === filters.provinceCode) &&
            (!filters.month || r.month === filters.month) &&
            (!filters.year || r.year === filters.year) &&
            (!filters.status || r.status === filters.status) &&
            (!filters.rating || r.rating === filters.rating),
        );

      const hits: SearchHit[] = [];

      scoped(stock).forEach((r) => {
        if (match(`${r.provinceCode} ${r.rating} stock`))
          hits.push({
            id: r.id,
            module: "Stock",
            provinceCode: r.provinceCode,
            period: period(r.month, r.year),
            title: `${r.rating} — ${r.quantity} units`,
            detail: "Transformer stock record",
            status: r.status,
          });
      });
      scoped(issued).forEach((r) => {
        if (match(`${r.provinceCode} ${r.rating} issued`))
          hits.push({
            id: r.id,
            module: "Issued",
            provinceCode: r.provinceCode,
            period: period(r.month, r.year),
            title: `${r.rating} — ${r.quantity} units`,
            detail: "Transformers issued",
            status: r.status,
          });
      });
      scoped(failures).forEach((r) => {
        if (match(`${r.provinceCode} ${r.serialNumber} ${r.cause} ${r.remarks} ${r.capacity}`))
          hits.push({
            id: r.id,
            module: "Failure",
            provinceCode: r.provinceCode,
            period: period(r.month, r.year),
            title: r.serialNumber,
            detail: `${r.capacity} · ${r.cause}`,
            status: r.status,
          });
      });
      scoped(feedback).forEach((r) => {
        if (match(`${r.provinceCode} ${r.customerName} ${r.comments}`))
          hits.push({
            id: r.id,
            module: "Feedback",
            provinceCode: r.provinceCode,
            period: period(r.month, r.year),
            title: r.customerName,
            detail: `Average rating ${r.averageRating}`,
            status: r.status,
          });
      });
      scoped(requirements).forEach((r) => {
        if (match(`${r.provinceCode} ${r.forecastMonth} ${r.rating}`))
          hits.push({
            id: r.id,
            module: "Requirement",
            provinceCode: r.provinceCode,
            period: period(r.month, r.year),
            title: `${r.rating} — ${r.quantity} units`,
            detail: `Forecast ${r.forecastMonth}`,
            status: r.status,
          });
      });

      return hits.slice(0, 120);
    }),
};
