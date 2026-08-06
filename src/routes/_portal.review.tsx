import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_portal/review")({
  head: () => ({
    meta: [
      { title: "Review Queue | LTL Portal" },
      { name: "description", content: "LTL review queue for submitted provincial transformer records." },
      { property: "og:title", content: "Review Queue | LTL Portal" },
      { property: "og:description", content: "Approve, return or lock submitted records." },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <PageHeader
        title="Review Queue"
        description="Open any data module to approve, return or lock submitted provincial records."
        breadcrumb={["Administration", "Review Queue"]}
      />
      <div className="panel p-6 text-sm text-muted-foreground">
        Review actions are available inline on the Stock, Issued, Failures, Feedback and Requirements pages
        for LTL administrators.
      </div>
    </div>
  ),
});
