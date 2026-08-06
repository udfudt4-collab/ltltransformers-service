import type {
  AuditLog,
  FailureRecord,
  FeedbackQuestion,
  FeedbackRecord,
  IssuedRecord,
  Notification,
  RequirementRecord,
  StockRecord,
  SubmissionStatus,
  User,
} from "@/types";
import {
  CURRENT_PERIOD,
  FAILURE_CAUSES,
  MONTHS,
  PROVINCES,
  TRANSFORMER_RATINGS,
} from "./provinces";
import { createRng, intBetween, lastPeriods, pick, uid } from "./random";

const rng = createRng(20260806);
const PERIODS = lastPeriods(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 12);
const STATUSES: SubmissionStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "RETURNED",
  "APPROVED",
  "LOCKED",
];

const iso = (month: number, year: number, day = 12) =>
  new Date(Date.UTC(year, month - 1, day, 9, 30)).toISOString();

const statusFor = (index: number, isCurrent: boolean): SubmissionStatus =>
  isCurrent ? (STATUSES[index % 4] as SubmissionStatus) : index % 5 === 0 ? "APPROVED" : "LOCKED";

/* ------------------------------- users --------------------------------- */

export const users: User[] = [
  {
    id: "usr-admin",
    username: "ltl.admin",
    fullName: "Nuwan Perera",
    email: "admin@ltl.lk",
    role: "LTL_ADMIN",
    provinceCode: null,
    active: true,
    lastLogin: iso(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 5),
    createdAt: "2024-01-08T04:00:00.000Z",
  },
  ...PROVINCES.map((p, i) => ({
    id: `usr-${p.code.toLowerCase()}`,
    username: p.code,
    fullName: `${p.name} Office`,
    email: `${p.code.toLowerCase()}@edl.lk`,
    role: "EDL_USER" as const,
    provinceCode: p.code,
    active: i !== 11,
    lastLogin: iso(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 1 + (i % 20)),
    createdAt: "2024-02-01T04:00:00.000Z",
  })),
];

/* ------------------------------ records -------------------------------- */

let counter = 0;

export const stock: StockRecord[] = [];
export const issued: IssuedRecord[] = [];
export const failures: FailureRecord[] = [];
export const feedback: FeedbackRecord[] = [];
export const requirements: RequirementRecord[] = [];

export const feedbackQuestions: FeedbackQuestion[] = [
  { id: "q1", text: "Quality of transformers supplied" },
  { id: "q2", text: "Timeliness of delivery" },
  { id: "q3", text: "Responsiveness of LTL support" },
  { id: "q4", text: "Documentation and technical data" },
  { id: "q5", text: "Overall satisfaction" },
];

PROVINCES.forEach((province, pIndex) => {
  PERIODS.forEach((period, tIndex) => {
    const isCurrent = tIndex === PERIODS.length - 1;
    const status = statusFor(pIndex + tIndex, isCurrent);

    TRANSFORMER_RATINGS.slice(0, intBetween(rng, 3, 6)).forEach((rating) => {
      stock.push({
        id: uid("STK", counter++),
        provinceCode: province.code,
        month: period.month,
        year: period.year,
        rating,
        quantity: intBetween(rng, 4, 90),
        status,
        updatedAt: iso(period.month, period.year),
      });
      issued.push({
        id: uid("ISS", counter++),
        provinceCode: province.code,
        month: period.month,
        year: period.year,
        rating,
        quantity: intBetween(rng, 1, 40),
        status,
        updatedAt: iso(period.month, period.year, 14),
      });
    });

    for (let f = 0; f < intBetween(rng, 0, 3); f++) {
      failures.push({
        id: uid("FLR", counter++),
        provinceCode: province.code,
        month: period.month,
        year: period.year,
        serialNumber: `TRF-${period.year}${String(period.month).padStart(2, "0")}-${String(
          intBetween(rng, 1000, 9999),
        )}`,
        capacity: pick(rng, TRANSFORMER_RATINGS),
        failureDate: iso(period.month, period.year, intBetween(rng, 1, 27)).slice(0, 10),
        cause: pick(rng, FAILURE_CAUSES),
        remarks: "Investigated by division maintenance crew.",
        status,
        updatedAt: iso(period.month, period.year, 18),
      });
    }

    for (let c = 0; c < intBetween(rng, 1, 3); c++) {
      const answers = feedbackQuestions.map((q) => ({
        questionId: q.id,
        rating: intBetween(rng, 2, 5),
      }));
      feedback.push({
        id: uid("FBK", counter++),
        provinceCode: province.code,
        month: period.month,
        year: period.year,
        customerName: `Customer ${province.code}-${c + 1}`,
        answers,
        comments: "Service delivered as scheduled.",
        averageRating:
          Math.round((answers.reduce((s, a) => s + a.rating, 0) / answers.length) * 10) / 10,
        status,
        updatedAt: iso(period.month, period.year, 20),
      });
    }

    // Requirements are captured once per quarter.
    if (period.month % 3 === 1) {
      TRANSFORMER_RATINGS.slice(0, 4).forEach((rating) => {
        requirements.push({
          id: uid("REQ", counter++),
          provinceCode: province.code,
          month: period.month,
          year: period.year,
          forecastMonth: `${MONTHS[period.month - 1] ?? ""} ${period.year}`,
          rating,
          quantity: intBetween(rng, 5, 60),
          status,
          updatedAt: iso(period.month, period.year, 8),
        });
      });
    }
  });
});

/* --------------------------- notifications ----------------------------- */

export const notifications: Notification[] = [
  {
    id: "ntf-1",
    title: "Monthly submission due",
    body: "July 2026 transformer stock and issued data must be submitted before the 25th.",
    type: "warning",
    createdAt: iso(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 18),
    read: false,
    audience: "EDL_USER",
  },
  {
    id: "ntf-2",
    title: "Submission returned for correction",
    body: "EDL-CP-2 failure register was returned. Serial numbers require verification.",
    type: "danger",
    createdAt: iso(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 16),
    read: false,
    audience: "ALL",
  },
  {
    id: "ntf-3",
    title: "Quarterly forecast window open",
    body: "Transformer requirement forecast for Q3 2026 is now accepting entries.",
    type: "info",
    createdAt: iso(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 10),
    read: true,
    audience: "ALL",
  },
  {
    id: "ntf-4",
    title: "June 2026 submissions approved",
    body: "11 provincial submissions were approved and locked by LTL Admin.",
    type: "success",
    createdAt: iso(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 4),
    read: true,
    audience: "ALL",
  },
  {
    id: "ntf-5",
    title: "Password expiry reminder",
    body: "Your portal password expires in 12 days. Update it from Settings.",
    type: "info",
    createdAt: iso(CURRENT_PERIOD.month, CURRENT_PERIOD.year, 2),
    read: false,
    audience: "ALL",
  },
];

/* ------------------------------- audit --------------------------------- */

const AUDIT_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "SUBMISSION",
  "APPROVAL",
  "CORRECTION_RETURNED",
  "EXPORT",
  "PASSWORD_RESET",
  "USER_CREATED",
  "RECORD_UPDATED",
];

export const auditLogs: AuditLog[] = Array.from({ length: 140 }).map((_, i) => {
  const province = PROVINCES[i % PROVINCES.length];
  const isAdmin = i % 6 === 0;
  return {
    id: uid("AUD", i),
    timestamp: new Date(Date.UTC(2026, 6, 31 - (i % 30), 3 + (i % 12), (i * 7) % 60)).toISOString(),
    user: isAdmin ? "ltl.admin" : (province?.code ?? "EDL-NP"),
    provinceCode: isAdmin ? null : (province?.code ?? null),
    action: AUDIT_ACTIONS[i % AUDIT_ACTIONS.length] as string,
    entity: pick(rng, ["Stock", "Issued", "Failure", "Feedback", "Requirement", "User", "Session"]),
    ip: `10.${intBetween(rng, 1, 60)}.${intBetween(rng, 1, 250)}.${intBetween(rng, 2, 250)}`,
    browser: pick(rng, ["Chrome 141 / Windows", "Edge 141 / Windows", "Safari 19 / iOS", "Firefox 140 / Ubuntu"]),
  };
});

export const PERIOD_LIST = PERIODS;
