import { createFileRoute } from "@tanstack/react-router";
import { PortalLayout } from "@/components/layout/portal-layout";

export const Route = createFileRoute("/_portal")({
  component: PortalLayout,
});
