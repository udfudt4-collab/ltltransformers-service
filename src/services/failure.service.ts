import { failures } from "@/mock/dataset";
import type { FailureRecord } from "@/types";
import { createCrudService } from "./crud.factory";

export const failureService = createCrudService<FailureRecord>(
  failures,
  "FLR",
  (r) => `${r.provinceCode} ${r.serialNumber} ${r.capacity} ${r.cause} ${r.remarks}`,
);
