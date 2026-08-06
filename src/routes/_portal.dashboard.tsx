import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Lock,
  PackageSearch,
  RotateCcw,
  Star,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { CardsSkeleton } from "@/components/common/skeletons";
import { useAuth } from "@/app/auth-context";
import { dashboardService } from "@/services/dashboard.service";
import { CURRENT_PERIOD, MONTHS } from "@/mock/provinces";

export const Route = createFileRoute("/_portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | LTL Transformer Portal" },
      { name: "description", content: "Role based dashboard for EDL offices and LTL administrators." },
      { property: "og:title", content: "Dashboard | LTL Transformer Portal" },
      { property: "og:description", content: "Submission status, trends and analytics at a glance." },
    ],
  }),
  component: DashboardPage,
});

const chartAxis = { stroke: "var(--color-muted-foreground)", fontSize: 11 };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DashboardPage() {
  const { role, user } = useAuth();
  return role === "LTL_ADMIN" ? <LtlDashboard /> : <EdlDashboard province={user?.provinceCode ?? ""} />;
}

function EdlDashboard({ province }: { province: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard", "edl", province],
    queryFn: () => dashboardService.edl(province),
  });

  const period = `${MONTHS[CURRENT_PERIOD.month - 1] ?? ""} ${CURRENT_PERIOD.year}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${province} Dashboard`}
        description={`Submission workspace for ${period}.`}
        breadcrumb={["Overview", "Dashboard"]}
      />
      {isPending || !data ? (
        <CardsSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Current month" value={period} hint="Reporting period" icon={ClipboardList} />
            <StatCard label="Pending forms" value={data.pendingForms} tone="warning" icon={AlertTriangle} />
            <StatCard label="Submitted records" value={data.submittedForms} tone="info" icon={CheckCircle2} />
            <StatCard
              label="Last submission"
              value={data.lastSubmission ? new Date(data.lastSubmission).toLocaleDateString() : "—"}
              icon={TrendingUp}
            />
          </div>

          <div className="panel flex flex-wrap items-center gap-3 p-4">
            <span className="text-sm text-muted-foreground">Approval status</span>
            <StatusBadge status={data.approvalStatus} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Submission trend">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartCard>
            <ChartCard title="Failure trend">
              <BarChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip />
                <Bar dataKey="failures" fill="var(--color-chart-5)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>

          <section className="panel p-4">
            <h2 className="mb-3 text-sm font-semibold">Notifications</h2>
            <ul className="divide-y divide-border">
              {data.notifications.map((n) => (
                <li key={n.id} className="py-2.5">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function LtlDashboard() {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard", "ltl"],
    queryFn: () => dashboardService.ltl(),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Executive Dashboard"
        description="Consolidated transformer operations across all EDL provincial offices."
        breadcrumb={["Overview", "Dashboard"]}
      />
      {isPending || !data ? (
        <CardsSkeleton count={8} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Provinces" value={data.totals.provinces} icon={ClipboardList} />
            <StatCard label="Submitted" value={data.totals.submitted} tone="info" icon={CheckCircle2} />
            <StatCard label="Pending" value={data.totals.pending} tone="warning" icon={AlertTriangle} />
            <StatCard label="Approved" value={data.totals.approved} tone="success" icon={CheckCircle2} />
            <StatCard label="Returned" value={data.totals.returned} tone="danger" icon={RotateCcw} />
            <StatCard label="Locked" value={data.totals.locked} icon={Lock} />
            <StatCard label="Current stock" value={data.totals.stock} icon={PackageSearch} />
            <StatCard label="Avg feedback" value={data.totals.avgFeedback} tone="success" icon={Star} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Province comparison — stock vs issued">
              <BarChart data={data.provinces}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="provinceCode" {...chartAxis} interval={0} angle={-35} textAnchor="end" height={60} />
                <YAxis {...chartAxis} />
                <Tooltip />
                <Bar dataKey="stock" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="issued" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartCard>
            <ChartCard title="Submission & failure trend">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="failures" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartCard>
            <ChartCard title="Stock distribution by rating">
              <PieChart>
                <Pie data={data.stockByRating} dataKey="quantity" nameKey="rating" outerRadius={80} label>
                  {data.stockByRating.map((entry, i) => (
                    <Cell key={entry.rating} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartCard>
            <ChartCard title="Forecast trend">
              <BarChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip />
                <Bar dataKey="forecast" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="panel p-4">
              <h2 className="mb-3 text-sm font-semibold">Province status</h2>
              <ul className="divide-y divide-border">
                {data.provinces.map((p) => (
                  <li key={p.provinceCode} className="flex items-center justify-between gap-3 py-2">
                    <span className="truncate text-sm font-medium">{p.provinceCode}</span>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            </section>
            <div className="space-y-4">
              <section className="panel p-4">
                <h2 className="mb-3 text-sm font-semibold">Top failure causes</h2>
                <ul className="space-y-2">
                  {data.topIssues.map((i) => (
                    <li key={i.cause} className="flex items-center justify-between text-sm">
                      <span>{i.cause}</span>
                      <span className="numeric text-muted-foreground">{i.count}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="panel p-4">
                <h2 className="mb-3 text-sm font-semibold">Latest activity</h2>
                <ul className="space-y-2 text-sm">
                  {data.activities.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">
                        {a.user} · {a.action}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(a.timestamp).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
