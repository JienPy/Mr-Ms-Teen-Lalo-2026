export const FULL_ADMIN_TABS = [
  "Overview",
  "Candidates",
  "Tickets",
  "Announcements",
  "Gallery",
  "Videos",
  "Sponsors",
  "Officials",
  "Settings",
] as const;

export const CONTENT_ADMIN_TABS = [
  "Overview",
  "Announcements",
  "Gallery",
  "Videos",
] as const;

export type Tab = (typeof FULL_ADMIN_TABS)[number];
export type DashboardRole = "admin" | "chairman" | "content_admin";

export function dashboardTabsForRole(role: DashboardRole): readonly Tab[] {
  if (role === "admin") return FULL_ADMIN_TABS;
  if (role === "chairman")
    return FULL_ADMIN_TABS.filter((tab) => tab !== "Tickets");
  return CONTENT_ADMIN_TABS;
}

export function canAccessDashboardTab(role: DashboardRole, tab: Tab) {
  return dashboardTabsForRole(role).includes(tab);
}

export function dashboardRoleFromRows(
  rows: Array<{ role: string }> | null | undefined,
): DashboardRole | null {
  if (rows?.some((row) => row.role === "admin")) return "admin";
  if (rows?.some((row) => row.role === "chairman")) return "chairman";
  if (rows?.some((row) => row.role === "content_admin")) return "content_admin";
  return null;
}
