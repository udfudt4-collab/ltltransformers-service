import { createFileRoute } from "@tanstack/react-router";
import { RecordListPage } from "@/features/records/record-list-page";
import { failureService } from "@/services/failure.service";
import type { FailureRecord } from "@/types";

export const Route = createFileRoute("/_portal/failures")({
  head: () => ({
    meta: [
      { title: "Transformer Failures | LTL Portal" },
      { name: "description", content: "Register of transformer failures with causes and remarks." },
      { property: "og:title", content: "Transformer Failures | LTL Portal" },
      { property: "og:description", content: "Failure register with serial numbers and causes." },
    ],
  }),
  component: () => (
    <RecordListPage<FailureRecord>
      title="Transformer Failures"
      description="Failure register capturing serial number, capacity, date, cause and remarks."
      queryKey="failures"
      service={failureService}
      showRating={false}
      columns={[
        { key: "serial", header: "Serial No", cell: (r) => r.serialNumber, primary: true },
        { key: "capacity", header: "Capacity", cell: (r) => r.capacity },
        { key: "date", header: "Failure date", cell: (r) => r.failureDate },
        { key: "cause", header: "Cause", cell: (r) => r.cause },
        {
          key: "remarks",
          header: "Remarks",
          cell: (r) => <span className="text-muted-foreground">{r.remarks}</span>,
        },
      ]}
      exportColumns={["Province", "Serial No", "Capacity", "Date", "Cause", "Status"]}
      exportRow={(r) => [r.provinceCode, r.serialNumber, r.capacity, r.failureDate, r.cause, r.status]}
    />
  ),
});
