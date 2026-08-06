import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/app/auth-context";
import { useTheme } from "@/app/theme-context";
import { notificationService } from "@/services/notification.service";
import { provinceName } from "@/mock/provinces";

export function AppHeader() {
  const { user, role, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => notificationService.list(role ?? "EDL_USER"),
    enabled: Boolean(role),
  });
  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await logout();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/90 px-3 backdrop-blur sm:px-4">
      <SidebarTrigger className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {role === "LTL_ADMIN" ? "LTL Administration" : provinceName(user?.provinceCode ?? null)}
        </p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          Enterprise Transformer Management Portal
        </p>
      </div>

      <Button variant="ghost" size="icon" asChild aria-label="Global search">
        <Link to="/search">
          <Search className="h-4.5 w-4.5" />
        </Link>
      </Button>

      <Button variant="ghost" size="icon" asChild aria-label="Notifications" className="relative">
        <Link to="/notifications">
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <UserCircle2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="truncate text-sm">{user?.fullName}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{user?.username}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            Account settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
