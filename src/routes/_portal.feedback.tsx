import { createFileRoute } from "@tanstack/react-router";
import { RecordListPage } from "@/features/records/record-list-page";
import { feedbackService } from "@/services/feedback.service";
import type { FeedbackRecord } from "@/types";

export const Route = createFileRoute("/_portal/feedback")({
  head: () => ({
    meta: [
      { title: "Customer Feedback | LTL Portal" },
      { name: "description", content: "Customer satisfaction questionnaire responses and ratings." },
      { property: "og:title", content: "Customer Feedback | LTL Portal" },
      { property: "og:description", content: "Questionnaire responses and satisfaction ratings." },
    ],
  }),
  component: () => (
    <RecordListPage<FeedbackRecord>
      title="Customer Feedback"
      description="Questionnaire responses collected from customers, scored 1–5 per question."
      queryKey="feedback"
      service={feedbackService}
      columns={[
        { key: "customer", header: "Customer", cell: (r) => r.customerName, primary: true },
        {
          key: "rating",
          header: "Average rating",
          cell: (r) => <span className="numeric font-medium">{r.averageRating}</span>,
        },
        {
          key: "comments",
          header: "Comments",
          cell: (r) => <span className="text-muted-foreground">{r.comments}</span>,
        },
      ]}
      exportColumns={["Province", "Customer", "Average Rating", "Comments", "Status"]}
      exportRow={(r) => [r.provinceCode, r.customerName, r.averageRating, r.comments, r.status]}
    />
  ),
});
