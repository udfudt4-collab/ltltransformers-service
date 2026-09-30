import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  Filter,
  Lock,
  PackageSearch,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { CardsSkeleton } from "@/components/common/skeletons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth-context";
import { dashboardService } from "@/services/dashboard.service";
import { CURRENT_PERIOD, MONTHS, PROVINCES } from "@/mock/provinces";

export const Route = createFileRoute("/_portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard | LTL Transformer Portal" },
      {
        name: "description",
        content: "Role-based executive dashboard for EDL provincial offices and LTL engineering specialists.",
      },
      { property: "og:title", content: "Executive Dashboard | LTL Transformer Portal" },
      { property: "og:description", content: "Consolidated transformer telemetry, failure trends, and stock metrics." },
    ],
  }),
  component: DashboardPage,
});

const chartAxis = { stroke: "var(--color-muted-foreground)", fontSize: 11 };

// High-definition modern tooltip component for Recharts
function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 p-3 shadow-xl backdrop-blur-md text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color || item.fill }}
              />
              <span className="capitalize">{item.name || item.dataKey}:</span>
            </span>
            <span className="font-bold text-foreground numeric">{item.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-4.5 shadow-xs transition-all duration-200 hover:shadow-md">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {badge}
          </span>
        )}
      </div>
      <div className="h-60 w-full">
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
    <div className="space-y-6">
      {/* Province Welcome Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-background to-background p-5 backdrop-blur-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500/20 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400">
              {province} Office
            </span>
            <span className="text-xs text-muted-foreground">Reporting Cycle Active</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {province} Provincial Workspace
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Monthly transformer returns and incident diagnostics for {period}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link to="/stock">
              <PackageSearch className="mr-1.5 h-4 w-4" />
              Update Stock
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/failures">
              <Zap className="mr-1.5 h-4 w-4" />
              Report Trip
            </Link>
          </Button>
        </div>
      </div>

      {isPending || !data ? (
        <CardsSkeleton count={4} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active Period"
              value={period}
              hint="Submission deadline in 6 days"
              icon={Calendar}
              tone="default"
            />
            <StatCard
              label="Pending Forms"
              value={data.pendingForms}
              hint="Requires engineering entry"
              tone={data.pendingForms > 0 ? "warning" : "success"}
              icon={AlertTriangle}
            />
            <StatCard
              label="Submitted Records"
              value={data.submittedForms}
              hint="Logged this billing period"
              tone="info"
              icon={CheckCircle2}
              trend={{ value: "+3 records", positive: true }}
            />
            <StatCard
              label="Last Submission"
              value={data.lastSubmission ? new Date(data.lastSubmission).toLocaleDateString() : "—"}
              hint="Telemetry synchronized"
              icon={TrendingUp}
              tone="success"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">Current Monthly Approval Status:</span>
              <StatusBadge status={data.approvalStatus} />
            </div>
            <span className="text-xs text-muted-foreground">
              Reviewed by LTL Engineering Directorate
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Monthly Submissions History" subtitle="Form volumes over the past 12 months">
              <LineChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  name="Submissions"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0284c7" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartCard>

            <ChartCard title="Failure & Tripping Incidents" subtitle="Reported anomalies by month">
              <BarChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="failures"
                  name="Failures"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ChartCard>
          </div>

          <section className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Operational Notifications</h2>
              <span className="text-xs text-muted-foreground">{data.notifications.length} updates</span>
            </div>
            <ul className="divide-y divide-border/60">
              {data.notifications.map((n) => (
                <li key={n.id} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground">Just now</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

// Sophisticated curated color palette for Transformer Ratings
const DONUT_COLORS = ["#0284c7", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e"];

function LtlDashboard() {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard", "ltl"],
    queryFn: () => dashboardService.ltl(),
  });

  const period = `${MONTHS[CURRENT_PERIOD.month - 1] ?? ""} ${CURRENT_PERIOD.year}`;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-blue-950/20 via-sky-950/10 to-background p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" />
                LTL Engineering Executive Portal
              </span>
              <span className="text-xs text-muted-foreground">Reporting Cycle: {period}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Consolidated National Grid Dashboard
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Live operational telemetry across {PROVINCES.length} EDL provinces, tracking inventory,
              distribution, and failure diagnostics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button size="sm" asChild className="shadow-sm">
              <Link to="/review">
                <ClipboardList className="mr-1.5 h-4 w-4" />
                Review Queue (4)
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/reports">
                <FileBarChart className="mr-1.5 h-4 w-4" />
                Export Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {isPending || !data ? (
        <CardsSkeleton count={8} />
      ) : (
        <>
          {/* Key Metric Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="EDL Provinces"
              value={data.totals.provinces}
              hint="All provincial offices"
              icon={ClipboardList}
              tone="default"
            />
            <StatCard
              label="Submitted Forms"
              value={data.totals.submitted}
              hint="Awaiting technical review"
              tone="info"
              icon={CheckCircle2}
              trend={{ value: "+14% vs last mo", positive: true }}
            />
            <StatCard
              label="Pending Review"
              value={data.totals.pending}
              hint="Requires LTL action"
              tone="warning"
              icon={AlertTriangle}
            />
            <StatCard
              label="Approved Records"
              value={data.totals.approved}
              hint="Locked & archived"
              tone="success"
              icon={CheckCircle2}
            />
            <StatCard
              label="Returned for Edit"
              value={data.totals.returned}
              hint="Clarifications requested"
              tone="danger"
              icon={RotateCcw}
            />
            <StatCard
              label="Locked Portals"
              value={data.totals.locked}
              hint="Post-deadline freeze"
              icon={Lock}
            />
            <StatCard
              label="National Stock Units"
              value={data.totals.stock.toLocaleString()}
              hint="Total transformers in grid"
              icon={PackageSearch}
              trend={{ value: "+320 units", positive: true }}
            />
            <StatCard
              label="Avg Quality Feedback"
              value={`${data.totals.avgFeedback} / 5.0`}
              hint="Field reliability index"
              tone="success"
              icon={Star}
            />
          </div>

          {/* Core Telemetry & Visualizations */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Province Stock vs Issued Bar Chart */}
            <ChartCard
              title="Provincial Distribution — Stock vs Issued"
              subtitle="Comparing warehouse reserves vs deployed units"
              badge="15 Provinces"
            >
              <BarChart
                data={data.provinces}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="provinceCode"
                  {...chartAxis}
                  interval={0}
                  angle={-38}
                  textAnchor="end"
                  height={50}
                  tickFormatter={(val: string) => {
                    // Abbreviate very long codes nicely so they don't clip
                    return val.replace("EDL-", "");
                  }}
                />
                <YAxis {...chartAxis} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="stock" name="Stock" fill="#0284c7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="issued" name="Issued" fill="#0d9488" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartCard>

            {/* Submission & Failure Trend Line Chart */}
            <ChartCard
              title="Submissions & Failure Trajectory"
              subtitle="12-month trailing operational telemetry"
              badge="Trailing 12M"
            >
              <LineChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  name="Submissions"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0284c7" }}
                />
                <Line
                  type="monotone"
                  dataKey="failures"
                  name="Failures"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#ef4444" }}
                />
              </LineChart>
            </ChartCard>

            {/* Modern Donut Chart for Transformer Ratings */}
            <ChartCard
              title="Transformer Fleet Distribution by Rating"
              subtitle="Current operational capacity allocation"
              badge="By kVA"
            >
              <PieChart>
                <Pie
                  data={data.stockByRating}
                  dataKey="quantity"
                  nameKey="rating"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  label={({ rating, percent }) => `${rating} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.stockByRating.map((entry, i) => (
                    <Cell key={entry.rating} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
              </PieChart>
            </ChartCard>

            {/* Forecast Trend Bar Chart */}
            <ChartCard
              title="Quarterly Demand Forecast"
              subtitle="Expected transformer replacements across provinces"
              badge="Quarterly"
            >
              <BarChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="period" {...chartAxis} />
                <YAxis {...chartAxis} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="forecast"
                  name="Forecast Demand"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ChartCard>
          </div>

          {/* Lower Section: Province Status & Failure Causes */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Provincial Submission Status Table */}
            <section className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Provincial Office Status</h2>
                  <p className="text-xs text-muted-foreground">Real-time workflow cycle review</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link to="/review">
                    View Queue
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="max-h-72 overflow-y-auto pr-1">
                <ul className="divide-y divide-border/60">
                  {data.provinces.map((p) => (
                    <li
                      key={p.provinceCode}
                      className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/40 px-1 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary/60" />
                        <span className="text-sm font-medium text-foreground">{p.provinceCode}</span>
                      </div>
                      <StatusBadge status={p.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Failure Causes with Progress Bars & Activity */}
            <div className="space-y-5">
              <section className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs">
                <h2 className="text-sm font-semibold text-foreground mb-1">Top Failure Root Causes</h2>
                <p className="text-xs text-muted-foreground mb-3">Diagnostic frequency across reporting cycle</p>
                <div className="space-y-3">
                  {data.topIssues.map((item) => {
                    const maxCount = Math.max(...data.topIssues.map((i) => i.count));
                    const percentage = Math.round((item.count / maxCount) * 100);
                    return (
                      <div key={item.cause} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{item.cause}</span>
                          <span className="font-semibold text-muted-foreground numeric">
                            {item.count} incidents
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs">
                <h2 className="text-sm font-semibold text-foreground mb-1">Recent Audit Stream</h2>
                <p className="text-xs text-muted-foreground mb-3">Certified operator activity</p>
                <ul className="space-y-2.5 text-xs">
                  {data.activities.slice(0, 3).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/60 p-2.5"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate text-foreground font-medium">
                          {a.user} · <span className="text-muted-foreground">{a.action}</span>
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground font-mono">
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
