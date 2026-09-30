import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShoppingCart,
  User as UserIcon,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/app/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LTL Transformers | Transformer Operations Portal" },
      {
        name: "description",
        content:
          "Manage transformers, power operations, inventory, service and field maintenance across provincial networks.",
      },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  username: z.string().trim().min(3, "Enter your account username").max(64),
  password: z.string().min(4, "Password must be at least 4 characters").max(128),
});

type FormValues = z.infer<typeof schema>;

const DEMO_TEST_ACCOUNTS = [
  { label: "LTL Admin", username: "ltl.admin", role: "Super Admin", password: "Password@123" },
  { label: "North Central", username: "EDL-NCP", role: "Provincial Office", password: "Password@123" },
  { label: "Northern Office", username: "EDL-NP", role: "Provincial Office", password: "Password@123" },
];

function LoginPage() {
  const { login, isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<string>("ltl.admin");

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [hydrated, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "ltl.admin", password: "Password@123" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await login(values.username, values.password);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please verify your credentials.");
    }
  };

  const handleSelectAccount = (username: string, pass: string) => {
    setActiveAccount(username);
    form.setValue("username", username, { shouldValidate: true });
    form.setValue("password", pass, { shouldValidate: true });
    toast.success(`Selected ${username}`, {
      description: `Test credentials loaded. Click Continue to enter.`,
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid lg:grid-cols-[1.25fr_1fr] bg-[#f4f7fb]">
      {/* ---------------------------------------------------- */}
      {/* LEFT PANEL: Transformer Operations Showcase         */}
      {/* ---------------------------------------------------- */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#020b18] via-[#04122b] to-[#010814] p-8 lg:p-11 text-white lg:flex h-full">
        {/* Subtle Background Ambient Tech Glow & Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="pointer-events-none absolute top-10 left-10 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />

        {/* TOP BRANDING BAR: Clean LTL Brand Focus */}
        <div className="relative z-10 flex items-center justify-between">
          {/* LTL Transformers Official Logo Group */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl bg-white p-1.5 shadow-md">
              <img
                src="/ltllogo.jpg"
                alt="LTL Transformers (Pvt) Ltd Official Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black tracking-tight text-white leading-tight">
                LTL
              </span>
              <span className="text-xs font-extrabold tracking-wider text-white leading-none">
                TRANSFORMERS
              </span>
            </div>

            <div className="h-6 w-px bg-white/20 mx-1" />

            <span className="text-xs font-normal text-slate-300">
              Transformer Operations Portal
            </span>
          </div>
        </div>

        {/* CENTRAL HERO CONTENT */}
        <div className="relative z-10 my-auto py-2 flex flex-col justify-center max-w-2xl">
          {/* Headline matching reference image exactly */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl xl:text-[46px] font-extrabold leading-[1.12] tracking-tight text-white">
              Manage Transformers.
              <br />
              <span className="text-[#2563eb]">Power Operations.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Sales, inventory, service and field operations in one place.
            </p>
          </div>

          {/* Three Feature Highlight Pills matching reference image */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {/* Feature 1 */}
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-400 shrink-0">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight">
                  Sales &amp; Inventory
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-normal">
                  Track orders, stock &amp; customer details
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-400 shrink-0">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight">
                  Service &amp; Maintenance
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-normal">
                  Plan service, manage work orders
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight">
                  Failure &amp; Field Operations
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-normal">
                  Resolve issues, track field activities
                </div>
              </div>
            </div>
          </div>

          {/* Transformer Technical Blueprint Visual */}
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-sky-500/25 bg-[#020b18]/70 p-1.5 shadow-2xl backdrop-blur-sm max-h-[36vh]">
            <img
              src="/transformer-hero.jpg"
              alt="Substation Transformer Technical Schematic"
              className="h-full w-full max-h-[34vh] rounded-xl object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[#020b18]/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* BOTTOM MOTTO & TECH PARTNER FOOTER */}
        <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/10">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
            SAFER &nbsp;&nbsp;|&nbsp;&nbsp; SMARTER &nbsp;&nbsp;|&nbsp;&nbsp; SUSTAINABLE
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-medium">
              Technology by
            </span>
            <div className="flex items-center rounded-lg bg-white px-2.5 py-1 shadow-sm">
              <img
                src="/partnerlogo.JPG"
                alt="TopNotch Services Official Logo"
                className="h-5 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* RIGHT PANEL: Crisp Sign-in Card                     */}
      {/* ---------------------------------------------------- */}
      <section className="relative flex items-center justify-center p-6 sm:p-10 h-full overflow-y-auto lg:overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]/40">
        <div className="w-full max-w-[420px] rounded-2xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xl">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Sign in
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Access the LTL Transformers portal.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-3 border-destructive/30 bg-destructive/10 text-xs py-2">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            {/* Username Input */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-slate-700">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="h-11 pl-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-[11px] text-destructive font-medium">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-11 pl-10 pr-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-[11px] text-destructive font-medium">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Continue Button matching reference */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-2 h-11 w-full rounded-lg bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Forgot password link */}
            <div className="text-left pt-1">
              <button
                type="button"
                onClick={() =>
                  toast.info("Password Recovery", {
                    description: "Please use the quick access test accounts below or contact admin@ltl.lk.",
                  })
                }
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Quick Access Pill / Accordion matching reference image */}
            <div className="pt-3">
              <div
                onClick={() => setIsQuickAccessOpen(!isQuickAccessOpen)}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 cursor-pointer hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800">Quick access</div>
                    <div className="text-[11px] text-slate-500">
                      LTL Admin &nbsp;·&nbsp; North Central &nbsp;·&nbsp; Northern Office
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    isQuickAccessOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Collapsible selection pills */}
              {isQuickAccessOpen && (
                <div className="mt-2 grid grid-cols-3 gap-1.5 animate-in fade-in duration-200">
                  {DEMO_TEST_ACCOUNTS.map((acc) => {
                    const isSelected = activeAccount === acc.username;
                    return (
                      <button
                        key={acc.username}
                        type="button"
                        onClick={() => handleSelectAccount(acc.username, acc.password)}
                        className={`flex flex-col items-start rounded-lg border p-1.5 text-left transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/80 shadow-xs"
                            : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800">
                            {acc.label}
                          </span>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-blue-600" />}
                        </div>
                        <span className="text-[9px] text-slate-500">{acc.role}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
