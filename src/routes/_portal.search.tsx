import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/common/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { searchService } from "@/services/search.service";
import type { QueryParams } from "@/types";

export const Route = createFileRoute("/_portal/search")({
  head: () => ({
    meta: [
      { title: "Global Search | LTL Portal" },
      { name: "description", content: "Search transformer records across every module and province." },
      { property: "og:title", content: "Global Search | LTL Portal" },
      { property: "og:description", content: "Search across stock, issued, failures, feedback and forecasts." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [params, setParams] = useState<QueryParams>({ search: "" });
  const { data = [], isPending } = useQuery({
    queryKey: ["search", params],
    queryFn: () => searchService.query(params.search ?? "", params),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Global Search"
        description="Search by province, serial number, rating, month, failure cause or remarks."
        breadcrumb={["Overview", "Global Search"]}
      />
      <FilterBar
        value={params}
        onChange={setParams}
        show={{ province: true, period: true, status: true, rating: true }}
        searchPlaceholder="Search everything…"
      />
      <DataTable
        rows={data}
        rowKey={(r) => r.id}
        loading={isPending}
        columns={[
          { key: "module", header: "Module", cell: (r) => r.module },
          { key: "province", header: "Province", cell: (r) => r.provinceCode },
          { key: "period", header: "Period", cell: (r) => r.period },
          { key: "title", header: "Record", cell: (r) => r.title, primary: true },
          { key: "detail", header: "Detail", cell: (r) => r.detail },
          { key: "status", header: "Status", cell: (r) => r.status },
        ]}
      />
    </div>
  );
}
