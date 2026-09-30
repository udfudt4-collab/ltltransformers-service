import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User,
} from "lucide-react";
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

  const roleLabel = role === "LTL_ADMIN" ? "National Admin" : "Provincial Engineer";
  const userDisplayName = user?.fullName || (role === "LTL_ADMIN" ? "System Admin" : user?.username);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-card/85 px-4 backdrop-blur-md transition-colors sm:px-6">
      {/* Left section: Sidebar trigger & Title */}
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="shrink-0 transition-colors hover:bg-muted" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {role === "LTL_ADMIN"
                ? "LTL Administration Console"
                : `${provinceName(user?.provinceCode ?? null)} Operations`}
            </h1>
            <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {role === "LTL_ADMIN"
              ? "Lanka Transformers Limited · Enterprise Transformer Management Portal"
              : `EDL Office ${user?.provinceCode ?? ""} · Monthly Submission & Monitoring`}
          </p>
        </div>
      </div>

      {/* Right section: Search button, Notifications, Theme toggle, User profile */}
      <div className="flex items-center gap-2">
        {/* Quick Search Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/search" })}
          className="hidden h-9 items-center gap-2 rounded-lg border-border/80 bg-background/50 px-3 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-background md:inline-flex"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-normal">Quick search...</span>
          <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {/* Mobile Search Icon */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Global search"
          className="h-9 w-9 md:hidden"
        >
          <Link to="/search">
            <Search className="h-4 w-4" />
          </Link>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-lg hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5 text-foreground/80" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950 shadow-sm">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notifications
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {unread} unread
              </span>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-64 space-y-1 overflow-y-auto py-1">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`flex flex-col gap-0.5 rounded-md p-2 text-xs transition-colors hover:bg-muted/70 ${
                    !n.read ? "bg-muted/40 font-medium" : "text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-muted-foreground">{n.body}</p>
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer justify-center text-center text-xs font-medium text-primary">
              <Link to="/notifications">View all alerts</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="h-9 w-9 rounded-lg hover:bg-muted"
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-9 items-center gap-2 rounded-lg px-2 hover:bg-muted sm:px-2.5"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-xs font-bold text-white shadow-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-28 truncate text-xs font-semibold leading-tight text-foreground">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none">{roleLabel}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-1.5">
            <DropdownMenuLabel className="p-2">
              <p className="truncate text-sm font-semibold text-foreground">{user?.fullName}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{user?.username}</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Shield className="h-3 w-3 text-primary" />
                {role === "LTL_ADMIN" ? "LTL National Administrator" : `EDL ${user?.provinceCode} Office`}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate({ to: "/settings" })}
              className="cursor-pointer gap-2 py-2 text-xs"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Account Settings & Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer gap-2 py-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out from portal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
