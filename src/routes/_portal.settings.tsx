import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/app/auth-context";

export const Route = createFileRoute("/_portal/settings")({
  head: () => ({
    meta: [
      { title: "Settings | LTL Portal" },
      { name: "description", content: "Account and portal preferences for the transformer management portal." },
      { property: "og:title", content: "Settings | LTL Portal" },
      { property: "og:description", content: "Account details and portal preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, role } = useAuth();
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Your account details." breadcrumb={["Settings"]} />
      <dl className="panel grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Name</dt>
          <dd className="text-sm font-medium">{user?.fullName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Email</dt>
          <dd className="text-sm font-medium">{user?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Role</dt>
          <dd className="text-sm font-medium">{role ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Province</dt>
          <dd className="text-sm font-medium">{user?.provinceCode ?? "All provinces"}</dd>
        </div>
      </dl>
    </div>
  );
}
