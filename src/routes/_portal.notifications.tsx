import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/app/auth-context";
import { notificationService } from "@/services/notification.service";

export const Route = createFileRoute("/_portal/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | LTL Portal" },
      { name: "description", content: "Submission, approval and system alerts for portal users." },
      { property: "og:title", content: "Notifications | LTL Portal" },
      { property: "og:description", content: "Submission and approval alerts." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => notificationService.list(role ?? "EDL_USER"),
  });

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Alerts for pending submissions, returns, approvals and forecast windows."
        breadcrumb={["Overview", "Notifications"]}
        actions={
          <Button variant="outline" size="sm" onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        }
      />
      {data.length === 0 ? (
        <div className="panel">
          <EmptyState title="No notifications" description="You are all caught up." icon={Bell} />
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((n) => (
            <li key={n.id} className="panel flex items-start gap-3 p-4">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.type === "danger"
                    ? "bg-destructive"
                    : n.type === "warning"
                      ? "bg-warning"
                      : n.type === "success"
                        ? "bg-success"
                        : "bg-info"
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {n.title}
                  {!n.read && (
                    <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      NEW
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
