import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_portal/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | LTL Portal" },
      { name: "description", content: "Trend and comparison analytics for transformer operations." },
      { property: "og:title", content: "Analytics | LTL Portal" },
      { property: "og:description", content: "Province comparisons, failure and forecast trends." },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Consolidated charts are available on the executive dashboard."
        breadcrumb={["Administration", "Analytics"]}
      />
      <div className="panel p-6 text-sm text-muted-foreground">
        Province comparison, stock distribution, failure and forecast trend charts are rendered on the
        Dashboard for LTL administrators.
      </div>
    </div>
  ),
});
