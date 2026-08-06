import type { Paged, QueryParams, RecordBase, SubmissionStatus } from "@/types";
import { applyFilters, nextId, paginate, request } from "./api";

export interface CrudService<T extends RecordBase> {
  list(params?: QueryParams): Promise<Paged<T>>;
  all(params?: QueryParams): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(payload: Omit<T, "id" | "status" | "updatedAt">): Promise<T>;
  update(id: string, payload: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
  setStatus(ids: string[], status: SubmissionStatus): Promise<void>;
  submitPeriod(provinceCode: string, month: number, year: number): Promise<void>;
}

/**
 * Builds a mock CRUD service over an in-memory collection.
 * Phase 2 replaces this factory with typed Axios resources — the hook layer
 * and components stay unchanged.
 */
export function createCrudService<T extends RecordBase>(
  store: T[],
  prefix: string,
  searchable: (row: T) => string,
): CrudService<T> {
  const find = (id: string) => store.find((r) => r.id === id);

  return {
    list: (params = {}) =>
      request(() => paginate(applyFilters(store, params, searchable), params)),
    all: (params = {}) => request(() => applyFilters(store, params, searchable)),
    get: (id) => request(() => find(id)),
    create: (payload) =>
      request(() => {
        const row = {
          ...payload,
          id: nextId(prefix),
          status: "DRAFT" as SubmissionStatus,
          updatedAt: new Date().toISOString(),
        } as unknown as T;
        store.unshift(row);
        return row;
      }),
    update: (id, payload) =>
      request(() => {
        const row = find(id);
        if (!row) throw new Error("Record not found");
        Object.assign(row, payload, { updatedAt: new Date().toISOString() });
        return row;
      }),
    remove: (id) =>
      request(() => {
        const index = store.findIndex((r) => r.id === id);
        if (index >= 0) store.splice(index, 1);
      }),
    setStatus: (ids, status) =>
      request(() => {
        store.forEach((row) => {
          if (ids.includes(row.id)) {
            row.status = status;
            row.updatedAt = new Date().toISOString();
          }
        });
      }),
    submitPeriod: (provinceCode, month, year) =>
      request(() => {
        store.forEach((row) => {
          if (row.provinceCode === provinceCode && row.month === month && row.year === year) {
            row.status = "SUBMITTED";
            row.updatedAt = new Date().toISOString();
          }
        });
      }),
  };
}
