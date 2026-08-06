/**
 * Mock transport layer.
 *
 * Every service call goes through `request()`, which simulates network latency
 * and error handling. Swapping Phase 1 mocks for the Phase 2 REST API only
 * requires replacing the body of `request()` with an Axios call.
 */

import type { Paged, QueryParams, RecordBase } from "@/types";

const LATENCY = [180, 420] as const;

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function request<T>(resolver: () => T, options?: { fail?: string }): Promise<T> {
  const wait = LATENCY[0] + Math.random() * (LATENCY[1] - LATENCY[0]);
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (options?.fail) {
        reject(new ApiError(options.fail));
        return;
      }
      try {
        resolve(structuredClone(resolver()));
      } catch (error) {
        reject(error instanceof Error ? error : new ApiError("Unexpected error", 500));
      }
    }, wait);
  });
}

export function paginate<T>(rows: T[], params: QueryParams = {}): Paged<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total: rows.length, page, pageSize };
}

/** Common filtering shared by every record-based module. */
export function applyFilters<T extends RecordBase>(
  rows: T[],
  params: QueryParams,
  searchable: (row: T) => string,
): T[] {
  const term = params.search?.trim().toLowerCase();
  return rows.filter((row) => {
    if (params.provinceCode && row.provinceCode !== params.provinceCode) return false;
    if (params.month && row.month !== params.month) return false;
    if (params.year && row.year !== params.year) return false;
    if (params.status && row.status !== params.status) return false;
    if (term && !searchable(row).toLowerCase().includes(term)) return false;
    return true;
  });
}

export const nextId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
