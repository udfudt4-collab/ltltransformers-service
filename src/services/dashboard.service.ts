import { PERIOD_LIST, failures, feedback, issued, notifications, requirements, stock, auditLogs } from "@/mock/dataset";
import { CURRENT_PERIOD, MONTHS, PROVINCES } from "@/mock/provinces";
import type { EdlDashboard, LtlDashboard, ProvinceSummary, SubmissionStatus, TrendPoint } from "@/types";
import { request } from "./api";

const label = (month: number, year: number) =>
  `${(MONTHS[month - 1] ?? "").slice(0, 3)} ${String(year).slice(2)}`;

const sum = (rows: { quantity: number }[]) => rows.reduce((s, r) => s + r.quantity, 0);

function statusOf(provinceCode: string): SubmissionStatus {
  const row = stock.find(
    (r) =>
      r.provinceCode === provinceCode &&
      r.month === CURRENT_PERIOD.month &&
      r.year === CURRENT_PERIOD.year,
  );
  return row?.status ?? "DRAFT";
}

function buildTrends(provinceCode?: string): TrendPoint[] {
  return PERIOD_LIST.map((p) => {
    const inPeriod = <T extends { month: number; year: number; provinceCode: string }>(rows: T[]) =>
      rows.filter(
        (r) =>
          r.month === p.month && r.year === p.year && (!provinceCode || r.provinceCode === provinceCode),
      );
    const fb = inPeriod(feedback);
    return {
      period: label(p.month, p.year),
      submissions: inPeriod(stock).length + inPeriod(issued).length,
      failures: inPeriod(failures).length,
      feedback: fb.length
        ? Math.round((fb.reduce((s, f) => s + f.averageRating, 0) / fb.length) * 10) / 10
        : 0,
      forecast: sum(inPeriod(requirements)),
    };
  });
}

export const dashboardService = {
  edl: (provinceCode: string): Promise<EdlDashboard> =>
    request(() => {
      const currentStatus = statusOf(provinceCode);
      const own = stock.filter((r) => r.provinceCode === provinceCode);
      const submitted = own.filter((r) => r.status !== "DRAFT").length;
      const lastSubmission =
        own
          .filter((r) => r.status !== "DRAFT")
          .map((r) => r.updatedAt)
          .sort()
          .pop() ?? null;
      return {
        provinceCode,
        currentPeriod: CURRENT_PERIOD,
        currentStatus,
        pendingForms: currentStatus === "DRAFT" ? 3 : currentStatus === "RETURNED" ? 1 : 0,
        submittedForms: submitted,
        lastSubmission,
        approvalStatus: currentStatus,
        trends: buildTrends(provinceCode),
        notifications: notifications.filter(
          (n) => n.audience === "ALL" || n.audience === "EDL_USER",
        ),
      };
    }),

  ltl: (): Promise<LtlDashboard> =>
    request(() => {
      const provinces: ProvinceSummary[] = PROVINCES.map((p) => {
        const fb = feedback.filter(
          (f) =>
            f.provinceCode === p.code &&
            f.month === CURRENT_PERIOD.month &&
            f.year === CURRENT_PERIOD.year,
        );
        return {
          provinceCode: p.code,
          status: statusOf(p.code),
          stock: sum(stock.filter((r) => r.provinceCode === p.code && r.year === CURRENT_PERIOD.year)),
          issued: sum(issued.filter((r) => r.provinceCode === p.code && r.year === CURRENT_PERIOD.year)),
          failures: failures.filter((r) => r.provinceCode === p.code).length,
          feedbackScore: fb.length
            ? Math.round((fb.reduce((s, f) => s + f.averageRating, 0) / fb.length) * 10) / 10
            : 0,
          lastSubmission:
            stock
              .filter((r) => r.provinceCode === p.code)
              .map((r) => r.updatedAt)
              .sort()
              .pop() ?? null,
        };
      });

      const count = (s: SubmissionStatus) => provinces.filter((p) => p.status === s).length;
      const ratings = new Map<string, number>();
      stock
        .filter((r) => r.year === CURRENT_PERIOD.year)
        .forEach((r) => ratings.set(r.rating, (ratings.get(r.rating) ?? 0) + r.quantity));
      const issues = new Map<string, number>();
      failures.forEach((f) => issues.set(f.cause, (issues.get(f.cause) ?? 0) + 1));

      const allFeedback = feedback.filter((f) => f.year === CURRENT_PERIOD.year);

      return {
        totals: {
          provinces: PROVINCES.length,
          submitted: count("SUBMITTED") + count("UNDER_REVIEW"),
          pending: count("DRAFT"),
          approved: count("APPROVED"),
          returned: count("RETURNED"),
          locked: count("LOCKED"),
          stock: sum(stock.filter((r) => r.year === CURRENT_PERIOD.year)),
          failures: failures.length,
          forecast: sum(requirements.filter((r) => r.year === CURRENT_PERIOD.year)),
          avgFeedback: allFeedback.length
            ? Math.round(
                (allFeedback.reduce((s, f) => s + f.averageRating, 0) / allFeedback.length) * 10,
              ) / 10
            : 0,
        },
        provinces,
        trends: buildTrends(),
        stockByRating: [...ratings.entries()]
          .map(([rating, quantity]) => ({ rating, quantity }))
          .sort((a, b) => b.quantity - a.quantity),
        topIssues: [...issues.entries()]
          .map(([cause, count2]) => ({ cause, count: count2 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6),
        activities: auditLogs.slice(0, 8),
      };
    }),
};
