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
  KeyRound,
  Loader2,
  Lock,
  Smartphone,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [activeTab, setActiveTab] = useState<"credentials" | "otp">("credentials");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // OTP State
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < country.phoneLength) {
      setError(`Please enter a valid ${country.phoneLength}-digit phone number.`);
      return;
    }
    setOtpLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setOtpLoading(false);
    setOtpSent(true);
    setOtp("123456");
    toast.success("Verification Code Sent!", {
      description: `Sent to ${country.isd} ${cleanPhone}. Demo test OTP is 123456.`,
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
    <div className="grid min-h-screen lg:grid-cols-[1.18fr_1fr] bg-[#f8fafc]">
      {/* ---------------------------------------------------- */}
      {/* LEFT SHOWCASE PANEL: Blue Transformer Tech Blueprint */}
      {/* ---------------------------------------------------- */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#061838] via-[#04122b] to-[#020b18] p-10 lg:p-14 text-white lg:flex">
        {/* Ambient Grid Lines & Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        {/* Top Branding Bar */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Real LTL Transformers Logo */}
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2 shadow-lg">
            <img
              src="/ltllogo.jpg"
              alt="LTL Transformers Logo"
              className="h-8 w-auto object-contain"
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

          {/* Powered by Topnotch Services Badge */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-300/80 font-medium">
              Powered by
            </span>
            <div className="mt-0.5 flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 shadow-sm">
              <span className="h-3 w-1 bg-red-600 rounded-xs" />
              <span className="text-xs font-black tracking-tight text-red-600 leading-none">
                TOPNOTCH
              </span>
              <span className="text-[10px] font-semibold text-slate-600 leading-none">
                Services
              </span>
            </div>
          </div>
        </div>

        {/* Central Core Hero Headline & Visual */}
        <div className="relative z-10 my-auto py-6 max-w-xl">
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-[#38bdf8]">
              TRANSFORMER OPERATIONS PORTAL
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.12] tracking-tight text-white">
              Manage your
              <br />
              transformer network.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Inventory, service and field operations in one place.
            </p>
          </div>

          {/* Transformer Blueprint Graphic */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-sky-500/20 bg-[#020b18]/60 p-2 shadow-2xl backdrop-blur-sm group">
            <img
              src="/transformer-hero.jpg"
              alt="Substation Transformer Technical Schematic"
              className="h-auto w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[#04122b]/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* Bottom Footer Details */}
        <div className="relative z-10 pt-4">
          <div className="h-1 w-9 bg-[#38bdf8] rounded-full mb-2" />
          <div className="text-sm font-semibold text-white">LTL Transformers</div>
          <div className="text-xs text-slate-400">Enterprise Service Portal</div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* RIGHT SIGN IN PANEL: Crisp White Card               */}
      {/* ---------------------------------------------------- */}
      <section className="relative flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[460px] rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Sign in
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              Access the LTL Transformers portal.
            </p>
          </div>

          {/* Error Banner if any */}
          {error && (
            <Alert variant="destructive" className="mt-4 border-destructive/30 bg-destructive/10 text-xs">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Segmented Mode Selector Tabs */}
          <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("credentials");
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                activeTab === "credentials"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              Staff Password
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("otp");
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                activeTab === "otp"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Field OTP
            </button>
          </div>

          {/* TAB 1: USERNAME & PASSWORD LOGIN */}
          {activeTab === "credentials" && (
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
                    className="h-11 pl-10 text-sm border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg"
                    {...form.register("username")}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-xs text-destructive font-medium">
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
                    className="h-11 pl-10 pr-10 text-sm border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg"
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
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign In Submit Button */}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="mt-2 h-11 w-full rounded-lg bg-[#0d59b8] hover:bg-[#0a4691] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
                  onClick={() => toast.info("Password Recovery", { description: "Please contact admin@ltl.lk or use the test credentials below." })}
                  className="text-xs font-semibold text-[#0d59b8] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="my-5 border-t border-slate-100" />

              {/* One-Click Quick Test Accounts for Customer Review */}
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Customer Test Credentials
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">1-Click Fill</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {DEMO_TEST_ACCOUNTS.map((acc) => {
                    const isSelected = selectedPreset === acc.username;
                    return (
                      <button
                        key={acc.username}
                        type="button"
                        onClick={() => handleQuickFill(acc.username, acc.password)}
                        className={`flex flex-col items-start rounded-lg border p-2 text-left transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/80 shadow-xs"
                            : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            {acc.label}
                          </span>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-blue-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500">{acc.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Notice */}
              <p className="pt-2 text-center text-xs text-slate-400">
                Need access? Contact your LTL administrator.
              </p>
            </form>
          )}

          {/* TAB 2: FIELD OTP LOGIN */}
          {activeTab === "otp" && (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Country / Region</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={otpSent}>
                  <SelectTrigger className="h-11 text-xs border-slate-200">
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
                <Label className="text-xs font-semibold text-slate-700">Phone Number</Label>
                <div className="flex gap-2">
                  <span className="h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-100 flex items-center text-xs font-mono text-slate-700">
                    {country.isd}
                  </span>
                  <Input
                    type="tel"
                    placeholder={country.placeholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                    className="h-11 text-xs font-mono border-slate-200 focus-visible:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-blue-700" />
                      Enter 6-Digit OTP Code
                    </Label>
                    <span className="text-[11px] font-mono text-blue-700 font-bold">Demo: 123456</span>
                  </div>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-11 text-center font-mono tracking-widest text-base bg-white"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={otpLoading}
                className="mt-2 h-11 w-full rounded-lg bg-[#0d59b8] hover:bg-[#0a4691] text-white font-semibold text-sm shadow-md"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : otpSent ? (
                  <>
                    Verify &amp; Sign in
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Send Verification OTP
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
                >
                  Change phone number
                </button>
              )}

              <p className="pt-2 text-center text-xs text-slate-400">
                Need access? Contact your LTL administrator.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
