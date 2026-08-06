import { createFileRoute } from "@tanstack/react-router";
import { QuantityModule } from "@/features/records/quantity-module";
import { stockService } from "@/services/stock.service";

export const Route = createFileRoute("/_portal/stock")({
  head: () => ({
    meta: [
      { title: "Transformer Stock | LTL Portal" },
      { name: "description", content: "Monthly transformer stock quantities by kVA rating." },
      { property: "og:title", content: "Transformer Stock | LTL Portal" },
      { property: "og:description", content: "Monthly transformer stock quantities by rating." },
    ],
  }),
  component: () => (
    <QuantityModule
      title="Transformer Stock"
      description="Record closing stock quantities for each transformer rating for the reporting month."
      queryKey="stock"
      service={stockService}
      quantityLabel="Quantity"
    />
  ),
});
