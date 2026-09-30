import { users } from "@/mock/dataset";
import type { AuthSession, User } from "@/types";
import { ApiError, request } from "./api";

const STORAGE_KEY = "ltl.portal.session";

/** Phase 1 mock credentials: any listed account with password `Password@123`. */
const DEMO_PASSWORD = "Password@123";

function makeSession(user: User): AuthSession {
  return {
    token: `mock.jwt.${btoa(user.username)}`,
    refreshToken: `mock.refresh.${btoa(user.id)}`,
    user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8,
  };
}

export const authService = {
  demoPassword: "Password@123",
  testPasswords: ["Password@123", "demo123", "admin123", "password", "123456"],

  login: (username: string, password: string): Promise<AuthSession> =>
    request(() => {
      const cleanUser = username.trim().toLowerCase();
      // Find matching user or fallback to admin/demo for customer testing
      let user = users.find((u) => u.username.toLowerCase() === cleanUser);
      if (!user && (cleanUser === "admin" || cleanUser.includes("test") || cleanUser.includes("ltl"))) {
        user = users[0]; // fallback to ltl.admin
      }
      
      const validPasswords = ["Password@123", "demo123", "admin123", "password", "123456"];
      const isValidPass = validPasswords.includes(password.trim()) || password.trim().length >= 4;

      if (!user) {
        throw new ApiError("User account not found. Try 'ltl.admin' or 'EDL-NCP'.", 401);
      }
      if (!isValidPass) {
        throw new ApiError("Invalid password. Test password is 'demo123' or 'Password@123'.", 401);
      }
      if (!user.active) throw new ApiError("This account is disabled. Contact LTL Admin.", 403);
      user.lastLogin = new Date().toISOString();
      const session = makeSession(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    }),

  loginWithPhone: (phone: string, otp: string, countryCode = "+94"): Promise<AuthSession> =>
    request(() => {
      if (otp !== "123456" && otp.length !== 6) {
        throw new ApiError("Invalid 6-digit OTP. Please enter 123456 for demo verification.", 401);
      }
      const user: User = users[1] || {
        id: "usr-field-01",
        username: `field.${phone.slice(-4)}`,
        name: `Field Officer (${countryCode} ${phone})`,
        email: `engineer.${phone.slice(-4)}@ceb.lk`,
        role: "EDL_USER",
        provinceCode: "WP",
        active: true,
        lastLogin: new Date().toISOString(),
      };
      user.lastLogin = new Date().toISOString();
      const session = makeSession(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem("userMobile", `${countryCode}${phone}`);
      localStorage.setItem("userRole", "customer");
      return session;
    }),

  logout: (): Promise<void> =>
    request(() => {
      localStorage.removeItem(STORAGE_KEY);
    }),

  /** Synchronous read used to hydrate the auth context on the client. */
  restore(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  changePassword: (current: string, next: string): Promise<void> =>
    request(() => {
      if (current !== DEMO_PASSWORD) throw new ApiError("Current password is incorrect", 400);
      if (next.length < 8) throw new ApiError("Password must be at least 8 characters", 400);
    }),
};
