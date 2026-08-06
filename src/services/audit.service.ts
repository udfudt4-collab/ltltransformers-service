import { auditLogs } from "@/mock/dataset";
import type { AuditLog, Paged } from "@/types";
import { paginate, request } from "./api";

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  action?: string;
  provinceCode?: string;
}

export const auditService = {
  list: (query: AuditQuery = {}): Promise<Paged<AuditLog>> =>
    request(() => {
      const term = query.search?.trim().toLowerCase();
      const rows = auditLogs.filter((log) => {
        if (query.action && log.action !== query.action) return false;
        if (query.provinceCode && log.provinceCode !== query.provinceCode) return false;
        if (
          term &&
          !`${log.user} ${log.action} ${log.entity} ${log.ip} ${log.browser}`
            .toLowerCase()
            .includes(term)
        )
          return false;
        return true;
      });
      return paginate(rows, query);
    }),
  record: (entry: Omit<AuditLog, "id" | "timestamp">): Promise<void> =>
    request(() => {
      auditLogs.unshift({
        ...entry,
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }),
};
