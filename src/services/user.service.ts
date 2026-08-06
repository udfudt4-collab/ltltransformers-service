import { users } from "@/mock/dataset";
import type { User } from "@/types";
import { nextId, request } from "./api";

export const userService = {
  list: (search?: string): Promise<User[]> =>
    request(() => {
      const term = search?.trim().toLowerCase();
      return users.filter(
        (u) =>
          !term ||
          `${u.username} ${u.fullName} ${u.email} ${u.provinceCode ?? ""}`
            .toLowerCase()
            .includes(term),
      );
    }),
  create: (payload: Omit<User, "id" | "createdAt" | "lastLogin">): Promise<User> =>
    request(() => {
      const user: User = {
        ...payload,
        id: nextId("usr"),
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };
      users.push(user);
      return user;
    }),
  update: (id: string, payload: Partial<User>): Promise<User> =>
    request(() => {
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      Object.assign(user, payload);
      return user;
    }),
  toggleActive: (id: string): Promise<User> =>
    request(() => {
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      user.active = !user.active;
      return user;
    }),
  resetPassword: (id: string): Promise<{ temporaryPassword: string }> =>
    request(() => ({ temporaryPassword: `Ltl@${Math.floor(Math.random() * 900000 + 100000)}` })),
};
