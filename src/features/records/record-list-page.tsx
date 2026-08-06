import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/common/data-table";
import { ExportMenu } from "@/components/common/export-menu";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { StatusActions } from "@/features/records/status-actions";
import { useAuth } from "@/app/auth-context";
import type { CrudService } from "@/services/crud.factory";
import type { QueryParams, RecordBase } from "@/types";

interface RecordListPageProps<T extends RecordBase> {
  title: string;
  description: string;
  queryKey: string;
  service: CrudService<T>;
  columns: Column<T>[];
  exportColumns: string[];
  exportRow: (row: T) => (string | number)[];
  showRating?: boolean;
}

/** Read/review page shared by the failure, feedback and requirement modules. */
export function RecordListPage<T extends RecordBase>({
  title,
  description,
  queryKey,
  service,
  columns,
  exportColumns,
  exportRow,
  showRating,
}: RecordListPageProps<T>) {
  const { role, user } = useAuth();
  const isAdmin = role === "LTL_ADMIN";
  const queryClient = useQueryClient();
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10 });

  const scoped = useMemo<QueryParams>(
    () => (isAdmin ? params : { ...params, provinceCode: user?.provinceCode ?? "" }),
    [params, isAdmin, user],
  );

  const { data, isPending } = useQuery({
    queryKey: [queryKey, scoped],
    queryFn: () => service.list(scoped),
  });

  const rows = data?.rows ?? [];
  const allColumns: Column<T>[] = [
    ...(isAdmin
      ? [
          {
            key: "province",
            header: "Province",
            cell: (r: T) => <span className="font-medium">{r.provinceCode}</span>,
          },
        ]
      : []),
    ...columns,
    { key: "status", header: "Status", cell: (r: T) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={description}
        breadcrumb={["Data Modules", title]}
        actions={
          <ExportMenu
            filename={queryKey}
            title={title}
            columns={exportColumns}
            rows={rows.map(exportRow)}
            disabled={rows.length === 0}
          />
        }
      />
      <FilterBar
        value={params}
        onChange={setParams}
        show={{ province: isAdmin, period: true, status: true, rating: showRating ?? false }}
      />
      <DataTable
        rows={rows}
        columns={allColumns}
        rowKey={(r) => r.id}
        loading={isPending}
        total={data?.total ?? 0}
        page={params.page ?? 1}
        pageSize={params.pageSize ?? 10}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        {...(isAdmin
          ? {
              rowActions: (row: T) => (
                <StatusActions
                  status={row.status}
                  onChange={(status) =>
                    service
                      .setStatus([row.id], status)
                      .then(() => queryClient.invalidateQueries({ queryKey: [queryKey] }))
                  }
                />
              ),
            }
          : {})}
      />
    </div>
  );
}
