import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_portal/users")({
  head: () => ({
    meta: [
      { title: "User Management | LTL Portal" },
      { name: "description", content: "Manage EDL provincial users and LTL administrator accounts." },
      { property: "og:title", content: "User Management | LTL Portal" },
      { property: "og:description", content: "Provincial user and administrator accounts." },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        description="Provincial and administrator accounts."
        breadcrumb={["Administration", "Users"]}
      />
      <div className="panel p-6 text-sm text-muted-foreground">
        Account provisioning is handled by the LTL IT team; directory sync arrives with the backend phase.
      </div>
    </div>
  ),
});
