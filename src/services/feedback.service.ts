import { feedback, feedbackQuestions } from "@/mock/dataset";
import type { FeedbackQuestion, FeedbackRecord } from "@/types";
import { request } from "./api";
import { createCrudService } from "./crud.factory";

const base = createCrudService<FeedbackRecord>(
  feedback,
  "FBK",
  (r) => `${r.provinceCode} ${r.customerName} ${r.comments}`,
);

export const feedbackService = {
  ...base,
  questions: (): Promise<FeedbackQuestion[]> => request(() => feedbackQuestions),
};
