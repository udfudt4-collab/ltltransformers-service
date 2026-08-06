import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_portal/audit")({
  head: () => ({
    meta: [
      { title: "Audit Log | LTL Portal" },
      { name: "description", content: "Chronological record of submissions, approvals and locks." },
      { property: "og:title", content: "Audit Log | LTL Portal" },
      { property: "og:description", content: "Who changed what, and when." },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <PageHeader
        title="Audit Log"
        description="Chronological record of submissions, approvals, returns and locks."
        breadcrumb={["Administration", "Audit Log"]}
      />
      <div className="panel p-6 text-sm text-muted-foreground">
        Recent activity is summarised on the executive dashboard; full immutable audit history is written by
        the backend phase.
      </div>
    </div>
  ),
});
