import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/page-header";
import { FilterBar } from "@/components/common/filter-bar";
import { ExportMenu } from "@/components/common/export-menu";
import { TableSkeleton } from "@/components/common/skeletons";
import { Button } from "@/components/ui/button";
import { REPORTS, reportService, type ReportKey } from "@/services/report.service";
import { useAuth } from "@/app/auth-context";
import type { QueryParams } from "@/types";

export const Route = createFileRoute("/_portal/reports")({
  head: () => ({
    meta: [
      { title: "Reports | LTL Portal" },
      { name: "description", content: "Monthly, province, failure, forecast and feedback reports with exports." },
      { property: "og:title", content: "Reports | LTL Portal" },
      { property: "og:description", content: "Generate and export transformer operations reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { role, user } = useAuth();
  const isAdmin = role === "LTL_ADMIN";
  const [key, setKey] = useState<ReportKey>("monthly");
  const [params, setParams] = useState<QueryParams>({});

  const scoped: QueryParams = isAdmin ? params : { ...params, provinceCode: user?.provinceCode ?? "" };
  const { data, isPending } = useQuery({
    queryKey: ["report", key, scoped],
    queryFn: () => reportService.generate(key, scoped),
  });

  const definition = REPORTS.find((r) => r.key === key);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description={definition?.description ?? ""}
        breadcrumb={["Administration", "Reports"]}
        actions={
          <ExportMenu
            filename={`ltl-${key}-report`}
            title={definition?.title ?? "Report"}
            columns={data?.columns ?? []}
            rows={data?.rows ?? []}
            disabled={!data || data.rows.length === 0}
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        {REPORTS.map((r) => (
          <Button
            key={r.key}
            size="sm"
            variant={r.key === key ? "default" : "outline"}
            onClick={() => setKey(r.key)}
          >
            {r.title}
          </Button>
        ))}
      </div>

      <FilterBar
        value={params}
        onChange={setParams}
        show={{ province: isAdmin, period: true }}
        searchPlaceholder="Filter report scope…"
      />

      {isPending || !data ? (
        <div className="panel">
          <TableSkeleton />
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-xs uppercase">
                {data.columns.map((c) => (
                  <th key={c} className="px-3 py-2 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="numeric px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
