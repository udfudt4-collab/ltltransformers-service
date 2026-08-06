import { notifications } from "@/mock/dataset";
import type { Notification, Role } from "@/types";
import { request } from "./api";

export const notificationService = {
  list: (role: Role): Promise<Notification[]> =>
    request(() => notifications.filter((n) => n.audience === "ALL" || n.audience === role)),
  markRead: (id: string): Promise<void> =>
    request(() => {
      const item = notifications.find((n) => n.id === id);
      if (item) item.read = true;
    }),
  markAllRead: (): Promise<void> =>
    request(() => {
      notifications.forEach((n) => (n.read = true));
    }),
};
