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
  TrendingUp,
  Truck,
  Users,
  Zap,
  Wrench,
  ShieldCheck,
  MapPin,
  Sparkles,
  Code2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { LtlLogo } from "@/components/common/ltl-logo";
import type { Role } from "@/types";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  badge?: string;
  badgeTone?: "default" | "amber" | "emerald";
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
      {
        title: "Global Search",
        url: "/search",
        icon: Search,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        roles: ["EDL_USER", "LTL_ADMIN"],
        badge: "2",
        badgeTone: "amber",
      },
    ],
  },
  {
    label: "Data Modules",
    items: [
      {
        title: "Transformer Stock",
        url: "/stock",
        icon: PackageSearch,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      {
        title: "Transformer Issued",
        url: "/issued",
        icon: Truck,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      {
        title: "Failures & Tripping",
        url: "/failures",
        icon: Zap,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      {
        title: "Customer Feedback",
        url: "/feedback",
        icon: MessageSquareHeart,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      {
        title: "Requirements",
        url: "/requirements",
        icon: TrendingUp,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
    ],
  },
  {
    label: "Service360 & Maintenance",
    items: [
      {
        title: "Transformer Services",
        url: "/services-hub",
        icon: Sparkles,
        roles: ["EDL_USER", "LTL_ADMIN"],
        badge: "Elite",
        badgeTone: "emerald",
      },
      {
        title: "Service Requests",
        url: "/service-requests",
        icon: Wrench,
        roles: ["EDL_USER", "LTL_ADMIN"],
        badge: "3",
        badgeTone: "amber",
      },
      {
        title: "Warranty & Assets",
        url: "/register-warranty",
        icon: ShieldCheck,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      {
        title: "Site & Operations",
        url: "/site-operations",
        icon: MapPin,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
    ],
  },
  {
    label: "Developer & Integration",
    items: [
      {
        title: "Developer API Hub",
        url: "/developer",
        icon: Code2,
        roles: ["EDL_USER", "LTL_ADMIN"],
        badge: "v1.2",
        badgeTone: "amber",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Review Queue",
        url: "/review",
        icon: ClipboardList,
        roles: ["LTL_ADMIN"],
        badge: "4",
        badgeTone: "emerald",
      },
      {
        title: "Reports & Exports",
        url: "/reports",
        icon: FileBarChart,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        roles: ["LTL_ADMIN"],
      },
      {
        title: "User Management",
        url: "/users",
        icon: Users,
        roles: ["LTL_ADMIN"],
      },
      {
        title: "Audit Logs",
        url: "/audit",
        icon: Activity,
        roles: ["LTL_ADMIN"],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["EDL_USER", "LTL_ADMIN"],
      },
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
      <SidebarHeader className="border-b border-sidebar-border/80 px-3.5 py-3">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <LtlLogo
            size={28}
            showText={!collapsed}
            textClassName="text-sidebar-foreground font-bold"
            subtitleClassName="text-sidebar-foreground/60 text-[10px]"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2">
        {GROUPS.map((group) => {
          const items = group.items.filter((i) => (role ? i.roles.includes(role) : false));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label} className="py-1.5">
              {!collapsed && (
                <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <Link to={item.url} className="flex w-full items-center gap-2.5">
                            <item.icon
                              className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                                isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70"
                              }`}
                              aria-hidden
                            />
                            {!collapsed && (
                              <span className="min-w-0 flex-1 truncate">{item.title}</span>
                            )}
                            {!collapsed && item.badge && (
                              <span
                                className={`ml-auto rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                  item.badgeTone === "amber"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 p-3">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="rounded-lg bg-sidebar-accent/50 p-2.5 text-xs text-sidebar-foreground/80">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sidebar-foreground">Grid Network</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synchronized
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-sidebar-foreground/60">
                {user?.provinceCode ? `Hub: ${user.provinceCode}` : "All 15 Provincial Hubs"}
              </p>
            </div>

            {/* Official Partner Brand Strip */}
            <div className="rounded-lg bg-white p-1.5 shadow-xs border border-sidebar-border/40 flex items-center justify-center">
              <img
                src="/partnerlogo.JPG"
                alt="Partner Brand"
                className="h-6 w-auto object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Grid Synchronized" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
