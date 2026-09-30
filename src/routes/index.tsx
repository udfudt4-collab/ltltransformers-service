import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  LockKeyhole,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
  Smartphone,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/app/auth-context";
import { authService } from "@/services/auth.service";
import { PROVINCES } from "@/mock/provinces";
import { LtlLogo } from "@/components/common/ltl-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In | LTL Transformer Management Portal" },
      {
        name: "description",
        content:
          "Secure portal for EDL provincial offices to submit transformer data and for LTL to review, analyse, and report.",
      },
      { property: "og:title", content: "Sign In | LTL Transformer Management Portal" },
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
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

type FormValues = z.infer<typeof schema>;

const DEMO_PRESETS = [
  { label: "LTL Admin", username: "ltl.admin", role: "Administrator", badge: "Super Admin" },
  { label: "EDL-NCP", username: "EDL-NCP", role: "North Central", badge: "Provincial" },
  { label: "EDL-NP", username: "EDL-NP", role: "Northern", badge: "Provincial" },
  { label: "EDL-WPS-1", username: "EDL-WPS-1", role: "Western South", badge: "Provincial" },
  { label: "EDL-CP-1", username: "EDL-CP-1", role: "Central Hub", badge: "Provincial" },
];

const COUNTRIES = [
  { name: "Sri Lanka", code: "LK", isd: "+94", phoneLength: 9, placeholder: "77 123 4567" },
  { name: "India", code: "IN", isd: "+91", phoneLength: 10, placeholder: "98765 43210" },
  { name: "Laos (EDL)", code: "LA", isd: "+856", phoneLength: 10, placeholder: "20 5551 2345" },
  { name: "Singapore", code: "SG", isd: "+65", phoneLength: 8, placeholder: "9123 4567" },
  { name: "UAE", code: "AE", isd: "+971", phoneLength: 9, placeholder: "50 123 4567" },
];

function LoginPage() {
  const { login, loginWithPhone, isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // OTP State
  const [authMode, setAuthMode] = useState<"credentials" | "otp">("credentials");
  const [selectedCountry, setSelectedCountry] = useState("LK");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const country = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
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
      setError(err instanceof Error ? err.message : "Unable to sign in. Please verify your credentials.");
    }
  };

  const quickFill = (username: string) => {
    setActivePreset(username);
    form.setValue("username", username, { shouldValidate: true });
    form.setValue("password", authService.demoPassword, { shouldValidate: true });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < country.phoneLength) {
      setError(`Please enter a valid ${country.phoneLength}-digit phone number for ${country.name}.`);
      return;
    }
    setOtpLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setOtpLoading(false);
    setOtpSent(true);
    setOtp("123456");
    toast.success("Verification Code Sent!", {
      description: `Sent to ${country.isd} ${cleanPhone}. Demo verification OTP is 123456.`,
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpLoading(true);
    try {
      await loginWithPhone(phone, otp, country.isd);
      toast.success("Identity Verified via Mobile OTP");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      {/* Left Showcase Hero Panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a152e] to-[#021326] p-12 text-slate-100 lg:flex">
        {/* Background Ambient Glow & Grid */}
        <div className="pointer-events-none absolute inset-0 bg-energy-grid opacity-30" />
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <LtlLogo
            size={42}
            showText={true}
            showPartner={true}
            textClassName="text-white text-lg font-bold"
            subtitleClassName="text-sky-200/70 text-xs"
          />
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Grid Telemetry Active
          </div>
        </div>

        {/* Central Core Message & Pillars */}
        <div className="relative z-10 my-auto max-w-xl space-y-8 py-10">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2.5 py-1 text-xs font-semibold tracking-wide text-sky-300 uppercase">
              National Transformer Infrastructure
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Precision transformer management across every province.
            </h1>
            <p className="text-base leading-relaxed text-slate-300/80">
              Consolidating monthly inventory, distribution tracking, failure diagnostics, and
              quarterly forecasting between provincial EDL offices and LTL engineering specialists.
            </p>
          </div>

          {/* Key Feature Tiles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-500/20 text-sky-400">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Failure Analytics</h3>
                  <p className="text-xs text-slate-400">Root-cause & tripping telemetry</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Audit Verification</h3>
                  <p className="text-xs text-slate-400">6-stage approval workflow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <dl className="grid grid-cols-3 gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div>
              <dt className="text-xs font-medium text-slate-400">EDL Provinces</dt>
              <dd className="mt-1 text-2xl font-bold text-white numeric">{PROVINCES.length}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">Core Modules</dt>
              <dd className="mt-1 text-2xl font-bold text-sky-400 numeric">5</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">System Accuracy</dt>
              <dd className="mt-1 text-2xl font-bold text-emerald-400 numeric">99.9%</dd>
            </div>
          </dl>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Lanka Transformers Limited. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <LockKeyhole className="h-3.5 w-3.5 text-sky-400" />
            ISO 27001 Certified Security
          </p>
        </div>
      </section>

      {/* Right Sign-in Form Panel */}
      <section className="relative flex items-center justify-center bg-background px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 lg:hidden">
            <LtlLogo size={32} showText={true} />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Shield className="h-3 w-3" />
              Authorized Access
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sign in to Portal
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Select your authentication mode to access transformer management and field maintenance.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Authentication Mode Tabs */}
          <Tabs
            value={authMode}
            onValueChange={(val) => {
              setAuthMode(val as "credentials" | "otp");
              setError(null);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="credentials" className="text-xs gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5" />
                Staff Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="text-xs gap-1.5">
                <Smartphone className="h-3.5 w-3.5" />
                Field Mobile OTP
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Password Login */}
            <TabsContent value="credentials" className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold">
                    Account Username
                  </Label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      autoComplete="username"
                      placeholder="e.g. ltl.admin or EDL-NCP"
                      className="pl-9 h-10 transition-colors focus-visible:ring-primary text-xs"
                      {...form.register("username")}
                    />
                  </div>
                  {form.formState.errors.username && (
                    <p className="text-xs font-medium text-destructive">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold">
                      Password
                    </Label>
                    <span className="text-[11px] text-muted-foreground">Demo: {authService.demoPassword}</span>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      className="pl-9 pr-10 h-10 transition-colors focus-visible:ring-primary text-xs"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs font-medium text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-10.5 w-full font-semibold shadow-sm transition-all hover:shadow text-xs"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Enter Workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Interactive One-Click Prototype Accounts */}
              <div className="rounded-xl border border-border/80 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Quick Select Prototype Accounts
                  </span>
                  <span className="text-[10px] text-muted-foreground">Click to fill</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DEMO_PRESETS.map((preset) => {
                    const isSelected = activePreset === preset.username;
                    return (
                      <button
                        key={preset.username}
                        type="button"
                        onClick={() => quickFill(preset.username)}
                        className={`group relative flex flex-col items-start rounded-lg border p-2 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-border/60 bg-background/60 hover:border-primary/40 hover:bg-accent/40"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-semibold text-xs text-foreground group-hover:text-primary">
                            {preset.label}
                          </span>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-primary" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{preset.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Mobile OTP Login */}
            <TabsContent value="otp" className="space-y-4">
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Country / Region</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={otpSent}>
                    <SelectTrigger className="text-xs h-10">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-xs">
                          {c.name} ({c.isd})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Registered Phone Number</Label>
                  <div className="flex gap-2">
                    <span className="h-10 px-3 rounded-md border bg-muted flex items-center text-xs font-mono text-muted-foreground">
                      {country.isd}
                    </span>
                    <Input
                      type="tel"
                      placeholder={country.placeholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={otpSent}
                      className="text-xs h-10 font-mono"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Matches technician or utility operations roster.
                  </span>
                </div>

                {otpSent && (
                  <div className="space-y-1.5 p-3 rounded-lg border bg-primary/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                        <KeyRound className="h-3.5 w-3.5" />
                        Enter 6-Digit OTP Code
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-mono">Demo: 123456</span>
                    </div>
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="text-center font-mono tracking-widest text-base h-11"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  {!otpSent ? (
                    <Button type="submit" className="w-full text-xs h-10 gap-1.5" disabled={otpLoading}>
                      {otpLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending One-Time Password...
                        </>
                      ) : (
                        <>
                          Send Verification OTP
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button type="submit" className="w-full text-xs h-10 gap-1.5" disabled={otpLoading}>
                        {otpLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify &amp; Enter Workspace
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                      >
                        Change Phone Number
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            Protected under Lanka Transformers Limited Security Protocol. Unauthorized attempts are monitored.
          </p>
        </div>
      </section>
    </div>
  );
}
