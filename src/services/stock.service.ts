import { stock } from "@/mock/dataset";
import type { StockRecord } from "@/types";
import { createCrudService } from "./crud.factory";

export const stockService = createCrudService<StockRecord>(
  stock,
  "STK",
  (r) => `${r.provinceCode} ${r.rating} ${r.quantity}`,
);
