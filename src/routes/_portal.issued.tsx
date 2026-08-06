import { createFileRoute } from "@tanstack/react-router";
import { QuantityModule } from "@/features/records/quantity-module";
import { issuedService } from "@/services/issued.service";
import type { StockRecord } from "@/types";
import type { CrudService } from "@/services/crud.factory";

export const Route = createFileRoute("/_portal/issued")({
  head: () => ({
    meta: [
      { title: "Transformers Issued | LTL Portal" },
      { name: "description", content: "Monthly transformer issuance quantities by kVA rating." },
      { property: "og:title", content: "Transformers Issued | LTL Portal" },
      { property: "og:description", content: "Monthly transformer issuance by rating." },
    ],
  }),
  component: () => (
    <QuantityModule
      title="Transformers Issued"
      description="Record transformers issued to the field during the reporting month."
      queryKey="issued"
      service={issuedService as unknown as CrudService<StockRecord>}
      quantityLabel="Issued Qty"
    />
  ),
});
