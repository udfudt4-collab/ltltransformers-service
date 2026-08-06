import { createFileRoute } from "@tanstack/react-router";
import { RecordListPage } from "@/features/records/record-list-page";
import { requirementsService } from "@/services/requirements.service";
import type { RequirementRecord } from "@/types";

export const Route = createFileRoute("/_portal/requirements")({
  head: () => ({
    meta: [
      { title: "Transformer Requirements | LTL Portal" },
      { name: "description", content: "Quarterly transformer requirement forecasts by province." },
      { property: "og:title", content: "Transformer Requirements | LTL Portal" },
      { property: "og:description", content: "Quarterly forecast quantities by transformer rating." },
    ],
  }),
  component: () => (
    <RecordListPage<RequirementRecord>
      title="Transformer Requirements"
      description="Quarterly forecast of transformer requirements, submitted once every three months."
      queryKey="requirements"
      service={requirementsService}
      showRating
      columns={[
        { key: "forecast", header: "Forecast month", cell: (r) => r.forecastMonth, primary: true },
        { key: "rating", header: "Rating", cell: (r) => r.rating },
        {
          key: "quantity",
          header: "Quantity",
          cell: (r) => <span className="numeric font-medium">{r.quantity}</span>,
        },
      ]}
      exportColumns={["Province", "Forecast Month", "Rating", "Quantity", "Status"]}
      exportRow={(r) => [r.provinceCode, r.forecastMonth, r.rating, r.quantity, r.status]}
    />
  ),
});
