import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/app/auth-context";
import { authService } from "@/services/auth.service";
import { PROVINCES } from "@/mock/provinces";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in | LTL Transformer Management Portal" },
      {
        name: "description",
        content:
          "Sign in to the LTL Transformer Management Portal to submit or review monthly EDL transformer data.",
      },
      { property: "og:title", content: "Sign in | LTL Transformer Management Portal" },
      {
        property: "og:description",
        content: "Secure access for EDL provincial offices and LTL administrators.",
      },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  username: z.string().trim().min(3, "Enter your account username").max(64),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const { login, isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [hydrated, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await login(values.username, values.password);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  };

  const quickFill = (username: string) => {
    form.setValue("username", username);
    form.setValue("password", authService.demoPassword);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">LTL Transformer Portal</p>
            <p className="text-xs text-sidebar-foreground/60">Lanka Transformers Limited</p>
          </div>
        </div>

        <div className="max-w-lg space-y-4">
          <h2 className="text-3xl leading-tight font-semibold">
            Monthly transformer operations, consolidated across every EDL province.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Stock, issuance, failures, customer feedback and quarterly forecasts — captured by
            provincial offices, reviewed and approved by LTL.
          </p>
          <dl className="grid grid-cols-3 gap-4 pt-4">
            {[
              { k: "Provinces", v: String(PROVINCES.length) },
              { k: "Modules", v: "5" },
              { k: "Workflow states", v: "6" },
            ].map((item) => (
              <div key={item.k}>
                <dt className="text-xs text-sidebar-foreground/60">{item.k}</dt>
                <dd className="numeric text-2xl font-semibold">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          Authorised use only. All activity is recorded in the audit trail.
        </p>
      </section>

      <section className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-4.5 w-4.5" aria-hidden />
            </span>
            <p className="font-semibold">LTL Transformer Portal</p>
          </div>

          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your EDL office account or LTL administrator credentials.
          </p>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="EDL-NCP"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-md border border-dashed border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Phase 1 prototype accounts · password {authService.demoPassword}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => quickFill("ltl.admin")}>
                LTL Admin
              </Button>
              {PROVINCES.slice(0, 4).map((p) => (
                <Button
                  key={p.code}
                  size="sm"
                  variant="outline"
                  onClick={() => quickFill(p.code)}
                >
                  {p.code}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
