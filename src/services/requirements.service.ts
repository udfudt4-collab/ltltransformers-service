import { requirements } from "@/mock/dataset";
import type { RequirementRecord } from "@/types";
import { createCrudService } from "./crud.factory";

export const requirementsService = createCrudService<RequirementRecord>(
  requirements,
  "REQ",
  (r) => `${r.provinceCode} ${r.forecastMonth} ${r.rating}`,
);
