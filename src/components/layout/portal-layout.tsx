import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/app/auth-context";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

/**
 * Authenticated portal shell. Phase 1 guards on the mock session held in the
 * auth context; Phase 2 swaps this for a token-validating route guard.
 */
export function PortalLayout() {
  const { isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !isAuthenticated) navigate({ to: "/", replace: true });
  }, [hydrated, isAuthenticated, navigate]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <main className="min-w-0 flex-1 space-y-5 p-4 sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
