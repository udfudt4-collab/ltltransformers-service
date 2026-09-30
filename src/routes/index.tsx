import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Sparkles,
  User as UserIcon,
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
      { title: "Sign In | LTL Transformers Portal" },
      {
        name: "description",
        content:
          "Secure portal for EDL provincial offices and LTL engineering specialists to manage transformer operations.",
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
  { label: "EDL-NCP", username: "EDL-NCP", role: "North Central", password: "Password@123" },
  { label: "EDL-NP", username: "EDL-NP", role: "Northern Office", password: "Password@123" },
];

function LoginPage() {
  const { login, isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("ltl.admin");

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

  const handleQuickFill = (username: string, pass: string) => {
    setSelectedPreset(username);
    form.setValue("username", username, { shouldValidate: true });
    form.setValue("password", pass, { shouldValidate: true });
    toast.success(`Selected ${username}`, {
      description: `Pre-filled test credentials for instant evaluation.`,
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid lg:grid-cols-[1.15fr_1fr] bg-[#f8fafc]">
      {/* ---------------------------------------------------- */}
      {/* LEFT SHOWCASE PANEL: Fits 100% in viewport          */}
      {/* ---------------------------------------------------- */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#061838] via-[#04122b] to-[#020b18] p-8 lg:p-10 text-white lg:flex h-full">
        {/* Ambient Grid Lines & Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

        {/* Top Branding Bar with Official Logos */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Real LTL Transformers Logo */}
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-1.5 shadow-md">
            <img
              src="/ltllogo.jpg"
              alt="LTL Transformers Logo"
              className="h-9 w-auto object-contain"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight text-[#071f43] leading-none">
                LTL
              </span>
              <span className="text-[10px] font-extrabold tracking-wider text-[#071f43] leading-none mt-0.5">
                TRANSFORMERS
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/20" />

          {/* Real Official Topnotch Services Logo */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-300/80 font-medium">
              Powered by
            </span>
            <div className="mt-0.5 flex items-center rounded-xl bg-white px-3 py-1.5 shadow-md">
              <img
                src="/partnerlogo.JPG"
                alt="Topnotch Services"
                className="h-6.5 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Central Core Hero Headline & Visual */}
        <div className="relative z-10 my-auto py-2 max-w-xl flex flex-col justify-center">
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#38bdf8]">
              TRANSFORMER OPERATIONS PORTAL
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-[42px] font-extrabold leading-[1.15] tracking-tight text-white">
              Manage your
              <br />
              transformer network.
            </h1>
            <p className="text-sm sm:text-base text-slate-300/90 font-normal leading-relaxed max-w-lg">
              Inventory, service and field operations in one place.
            </p>
          </div>

          {/* Transformer Blueprint Graphic - Scaled for 1-screen fit */}
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-sky-500/25 bg-[#020b18]/70 p-2 shadow-2xl backdrop-blur-sm group max-h-[38vh]">
            <img
              src="/transformer-hero.jpg"
              alt="Substation Transformer Technical Schematic"
              className="h-full w-full max-h-[35vh] rounded-xl object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[#04122b]/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* Bottom Footer Details */}
        <div className="relative z-10 pt-2">
          <div className="h-1 w-8 bg-[#38bdf8] rounded-full mb-1.5" />
          <div className="text-xs font-semibold text-white">LTL Transformers</div>
          <div className="text-[11px] text-slate-400">Enterprise Service Portal</div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* RIGHT SIGN IN PANEL: Single Screen Centered Card    */}
      {/* ---------------------------------------------------- */}
      <section className="relative flex items-center justify-center p-6 sm:p-8 lg:p-10 h-full overflow-y-auto lg:overflow-hidden">
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

          {/* Error Banner if any */}
          {error && (
            <Alert variant="destructive" className="mt-3 border-destructive/30 bg-destructive/10 text-xs py-2">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Clean Username & Password Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-3.5" noValidate>
            {/* Username Input */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs font-semibold text-slate-700">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="h-10 pl-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg"
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
            <div className="space-y-1">
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
                  className="h-10 pl-10 pr-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg"
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

            {/* Sign In Submit Button */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-1 h-10.5 w-full rounded-lg bg-[#0d59b8] hover:bg-[#0a4691] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Forgot password link */}
            <div className="text-left">
              <button
                type="button"
                onClick={() =>
                  toast.info("Password Recovery", {
                    description: "Please use the test credentials below or contact admin@ltl.lk.",
                  })
                }
                className="text-xs font-semibold text-[#0d59b8] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <div className="my-4 border-t border-slate-100" />

            {/* Customer Test Credentials: 1-Click Fill */}
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Customer Test Accounts
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Click to fill</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {DEMO_TEST_ACCOUNTS.map((acc) => {
                  const isSelected = selectedPreset === acc.username;
                  return (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleQuickFill(acc.username, acc.password)}
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
            </div>

            {/* Footer Notice */}
            <p className="pt-1 text-center text-[11px] text-slate-400">
              Need access? Contact your LTL administrator.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
