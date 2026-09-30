/** Shared domain types for the LTL Transformer Management Portal. */

export type Role = "EDL_USER" | "LTL_ADMIN";

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "RETURNED"
  | "APPROVED"
  | "LOCKED";

export interface Province {
  code: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  provinceCode: string | null;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}

export interface Period {
  month: number;
  year: number;
}

export interface RecordBase extends Period {
  id: string;
  provinceCode: string;
  status: SubmissionStatus;
  updatedAt: string;
}

export interface StockRecord extends RecordBase {
  rating: string;
  quantity: number;
}

export interface IssuedRecord extends RecordBase {
  rating: string;
  quantity: number;
}

export interface FailureRecord extends RecordBase {
  serialNumber: string;
  capacity: string;
  failureDate: string;
  cause: string;
  remarks: string;
}

export interface FeedbackRecord extends RecordBase {
  customerName: string;
  answers: { questionId: string; rating: number }[];
  comments: string;
  averageRating: number;
}

export interface RequirementRecord extends RecordBase {
  forecastMonth: string;
  rating: string;
  quantity: number;
}

export interface FeedbackQuestion {
  id: string;
  text: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "danger";
  createdAt: string;
  read: boolean;
  audience: Role | "ALL";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  provinceCode: string | null;
  action: string;
  entity: string;
  ip: string;
  browser: string;
}

export interface ProvinceSummary {
  provinceCode: string;
  status: SubmissionStatus;
  stock: number;
  issued: number;
  failures: number;
  feedbackScore: number;
  lastSubmission: string | null;
}

export interface TrendPoint {
  period: string;
  submissions?: number;
  failures?: number;
  feedback?: number;
  forecast?: number;
}

export interface EdlDashboard {
  provinceCode: string;
  currentPeriod: Period;
  currentStatus: SubmissionStatus;
  pendingForms: number;
  submittedForms: number;
  lastSubmission: string | null;
  approvalStatus: SubmissionStatus;
  trends: TrendPoint[];
  notifications: Notification[];
}

export interface LtlDashboard {
  totals: {
    provinces: number;
    submitted: number;
    pending: number;
    approved: number;
    returned: number;
    locked: number;
    stock: number;
    failures: number;
    forecast: number;
    avgFeedback: number;
  };
  provinces: ProvinceSummary[];
  trends: TrendPoint[];
  stockByRating: { rating: string; quantity: number }[];
  topIssues: { cause: string; count: number }[];
  activities: AuditLog[];
}

export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryParams {
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
  provinceCode?: string | undefined;
  month?: number | undefined;
  year?: number | undefined;
  status?: SubmissionStatus | undefined;
  rating?: string | undefined;
}

/* ----------------------------- Service360 ------------------------------ */

export type CoverageType = "warranty" | "ama" | "none";
export type CoverageStatus = "active" | "expiring" | "expired";

export interface EquipmentAsset {
  id: string;
  name: string;
  rating: string;
  model: string;
  serialNumber: string;
  description: string;
  provinceCode: string;
  substation: string;
  purchaseDate: string;
  installationDate: string;
  coverageType: CoverageType;
  coverageStatus: CoverageStatus;
  coverageExpiry: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export type TicketStatus =
  | "open"
  | "acknowledged"
  | "in_progress"
  | "awaiting_customer"
  | "resolved"
  | "closed";

export interface ServiceTicketMessage {
  id: string;
  sender: "customer" | "technician" | "ltl";
  senderName: string;
  message: string;
  timestamp: string;
  type: "message" | "status_update";
}

export interface ServiceRequestTicket {
  id: string;
  ticketId: string;
  equipmentId: string;
  equipmentName: string;
  model: string;
  serialNumber: string;
  category: string;
  status: TicketStatus;
  description: string;
  provinceCode: string;
  substation: string;
  createdDate: string;
  scheduledDate?: string | undefined;
  completedDate?: string | undefined;
  technicianAssigned?: string | undefined;
  technicianPhone?: string | undefined;
  resolution?: string | undefined;
  rating?: number | undefined;
  feedback?: string | undefined;
  imageUrl?: string | undefined;
  messages: ServiceTicketMessage[];
}

export interface AuthorizedPerson {
  id: number;
  name: string;
  email: string;
  mobile: string;
  designation?: string;
}

export interface SiteOperationLocation {
  provinceCode: string;
  substation: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  authorizedPersons: AuthorizedPerson[];
}

