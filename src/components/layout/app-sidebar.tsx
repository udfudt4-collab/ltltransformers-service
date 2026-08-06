import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  MessageSquareHeart,
  PackageSearch,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/app/auth-context";
import type { Role } from "@/types";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      { title: "Global Search", url: "/search", icon: Search, roles: ["EDL_USER", "LTL_ADMIN"] },
      { title: "Notifications", url: "/notifications", icon: Bell, roles: ["EDL_USER", "LTL_ADMIN"] },
    ],
  },
  {
    label: "Data Modules",
    items: [
      { title: "Transformer Stock", url: "/stock", icon: PackageSearch, roles: ["EDL_USER", "LTL_ADMIN"] },
      { title: "Transformer Issued", url: "/issued", icon: Truck, roles: ["EDL_USER", "LTL_ADMIN"] },
      { title: "Failures", url: "/failures", icon: Zap, roles: ["EDL_USER", "LTL_ADMIN"] },
      { title: "Customer Feedback", url: "/feedback", icon: MessageSquareHeart, roles: ["EDL_USER", "LTL_ADMIN"] },
      { title: "Requirements", url: "/requirements", icon: TrendingUp, roles: ["EDL_USER", "LTL_ADMIN"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Review Queue", url: "/review", icon: ClipboardList, roles: ["LTL_ADMIN"] },
      { title: "Reports", url: "/reports", icon: FileBarChart, roles: ["EDL_USER", "LTL_ADMIN"] },
      { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["LTL_ADMIN"] },
      { title: "User Management", url: "/users", icon: Users, roles: ["LTL_ADMIN"] },
      { title: "Audit Logs", url: "/audit", icon: Activity, roles: ["LTL_ADMIN"] },
      { title: "Settings", url: "/settings", icon: Settings, roles: ["EDL_USER", "LTL_ADMIN"] },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="h-4.5 w-4.5" aria-hidden />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">LTL Portal</p>
              <p className="truncate text-[11px] text-sidebar-foreground/60">
                {user?.provinceCode ?? "Platform Administration"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => {
          const items = group.items.filter((i) => (role ? i.roles.includes(role) : false));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
