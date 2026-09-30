/**
 * Enterprise Application Error Reporting & Diagnostics
 * Lanka Transformers Limited (LTL) Portal
 */

export interface ErrorReportContext {
  boundary?: string;
  route?: string;
  source?: string;
  userId?: string;
  provinceCode?: string;
  [key: string]: unknown;
}

export function reportAppError(error: unknown, context: ErrorReportContext = {}) {
  if (typeof window === "undefined") return;

  const timestamp = new Date().toISOString();
  const route = window.location.pathname;
  const message =
    error instanceof Response
      ? `HTTP Response ${error.status} at ${error.url || route}`
      : error instanceof Error
        ? error.message
        : String(error);

  const payload = {
    timestamp,
    message,
    stack: error instanceof Error ? error.stack : undefined,
    route,
    ...context,
  };

  // Structured client logging for development and monitoring
  console.error("[LTL Portal Diagnostics]", payload);

  // Dispatch custom diagnostics event for in-app alert systems or external telemetry
  try {
    const event = new CustomEvent("ltl:error", { detail: payload });
    window.dispatchEvent(event);
  } catch {
    // Non-critical if custom event dispatch fails
  }
}
