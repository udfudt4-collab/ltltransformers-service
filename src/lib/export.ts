/** Client-side export helpers used by reports and data tables (Phase 1 mock). */

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export function exportCsv(filename: string, columns: string[], rows: (string | number)[][]) {
  const csv = [columns, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
  download(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

/** Excel-readable SpreadsheetML export — replaced by a server-side XLSX in Phase 2. */
export function exportExcel(filename: string, columns: string[], rows: (string | number)[][]) {
  const head = columns.map((c) => `<th>${c}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  download(html, `${filename}.xls`, "application/vnd.ms-excel");
}

/** Print-to-PDF via the browser dialog. */
export function exportPdf(title: string, columns: string[], rows: (string | number)[][]) {
  const win = window.open("", "_blank", "width=1100,height=800");
  if (!win) return;
  const head = columns.map((c) => `<th>${c}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");
  win.document.write(`<!doctype html><html><head><title>${title}</title><style>
    body{font-family:system-ui,sans-serif;padding:32px;color:#16233a}
    h1{font-size:18px;margin:0 0 4px}
    p{font-size:12px;color:#5b6b85;margin:0 0 20px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #d5dce8;padding:6px 8px;text-align:left}
    th{background:#eef2f8}
  </style></head><body><h1>${title}</h1><p>LTL Transformer Management Portal · generated ${new Date().toLocaleString()}</p>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
