import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { auditService } from "@/services/audit.service";
import type { AuthSession, Role, User } from "@/types";

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (username: string, password: string) => Promise<AuthSession>;
  loginWithPhone: (phone: string, otp: string, countryCode?: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(authService.restore());
    setHydrated(true);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const next = await authService.login(username, password);
    setSession(next);
    void auditService.record({
      user: next.user.username,
      provinceCode: next.user.provinceCode,
      action: "LOGIN",
      entity: "Session",
      ip: "10.20.4.18",
      browser: typeof navigator === "undefined" ? "Unknown" : navigator.userAgent.slice(0, 40),
    });
    return next;
  }, []);

  const loginWithPhone = useCallback(async (phone: string, otp: string, countryCode?: string) => {
    const next = await authService.loginWithPhone(phone, otp, countryCode);
    setSession(next);
    void auditService.record({
      user: next.user.username,
      provinceCode: next.user.provinceCode,
      action: "LOGIN_OTP",
      entity: "Session",
      ip: "10.20.4.18",
      browser: typeof navigator === "undefined" ? "Unknown" : navigator.userAgent.slice(0, 40),
    });
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user.role ?? null,
      isAuthenticated: Boolean(session),
      hydrated,
      login,
      loginWithPhone,
      logout,
    }),
    [session, hydrated, login, loginWithPhone, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
