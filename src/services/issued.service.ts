import { issued } from "@/mock/dataset";
import type { IssuedRecord } from "@/types";
import { createCrudService } from "./crud.factory";

export const issuedService = createCrudService<IssuedRecord>(
  issued,
  "ISS",
  (r) => `${r.provinceCode} ${r.rating} ${r.quantity}`,
);
