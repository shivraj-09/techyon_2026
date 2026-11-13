import type { IconName } from "@/components/ui/Icon";

export type UserRole = "admin" | "teacher" | "parent" | "counsellor";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  badge?: string;
}

export interface RoleProfileConfig {
  role: UserRole;
  roleLabel: string;
  defaultUserName: string;
  defaultUserEmail: string;
  navItems: NavItemConfig[];
}

export const ROLE_NAVIGATION: Record<UserRole, RoleProfileConfig> = {
  admin: {
    role: "admin",
    roleLabel: "School Admin",
    defaultUserName: "Arjun Mehta",
    defaultUserEmail: "admin@institution.in",
    navItems: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: "layout-dashboard",
      },
      {
        id: "students",
        label: "Students",
        href: "/dashboard/students",
        icon: "graduation-cap",
      },
      {
        id: "classes",
        label: "Classes",
        href: "/dashboard/classes",
        icon: "book-open",
      },
      {
        id: "attendance",
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: "calendar-check",
      },
      {
        id: "fees",
        label: "Fees",
        href: "/dashboard/fees",
        icon: "credit-card",
      },
      {
        id: "announcements",
        label: "Announcements",
        href: "/dashboard/announcements",
        icon: "megaphone",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: "bell",
        badge: "3",
      },
      {
        id: "ai-insights",
        label: "AI Insights",
        href: "/admin/ai-insights",
        icon: "sparkles",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/dashboard/settings",
        icon: "settings",
      },
    ],
  },
  teacher: {
    role: "teacher",
    roleLabel: "Teacher",
    defaultUserName: "Priya Nair",
    defaultUserEmail: "priya.nair@institution.in",
    navItems: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/teacher/dashboard",
        icon: "layout-dashboard",
      },
      {
        id: "my-classes",
        label: "My Classes",
        href: "/teacher/classes",
        icon: "book-open",
      },
      {
        id: "students",
        label: "Students",
        href: "/teacher/students",
        icon: "graduation-cap",
      },
      {
        id: "attendance",
        label: "Attendance",
        href: "/teacher/attendance",
        icon: "calendar-check",
      },
      {
        id: "announcements",
        label: "Announcements",
        href: "/teacher/announcements",
        icon: "megaphone",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/teacher/notifications",
        icon: "bell",
        badge: "2",
      },
    ],
  },
  counsellor: {
    role: "counsellor",
    roleLabel: "School Counsellor",
    defaultUserName: "Counsellor",
    defaultUserEmail: "counsellor@institution.in",
    navItems: [
      { id: "dashboard", label: "Counsellor Dashboard", href: "/counsellor/dashboard", icon: "layout-dashboard" },
      { id: "referrals", label: "Referrals", href: "/counsellor/dashboard#referrals", icon: "inbox" },
      { id: "cases", label: "Confidential Cases", href: "/counsellor/dashboard#cases", icon: "file-text" },
      { id: "sessions", label: "Sessions & Notices", href: "/counsellor/dashboard#sessions", icon: "calendar-check" },
      { id: "student-voice", label: "Student Voice", href: "/counsellor/dashboard#student-voice", icon: "users" },
    ],
  },
  parent: {
    role: "parent",
    roleLabel: "Parent / Guardian",
    defaultUserName: "Rajesh Naik",
    defaultUserEmail: "rajesh.naik@institution.in",
    navItems: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/parent/dashboard",
        icon: "layout-dashboard",
      },
      {
        id: "my-children",
        label: "My Children",
        href: "/parent/children",
        icon: "users",
      },
      {
        id: "attendance",
        label: "Attendance",
        href: "/parent/attendance",
        icon: "calendar-check",
      },
      {
        id: "fee-details",
        label: "Fee Details",
        href: "/parent/fees",
        icon: "credit-card",
      },
      {
        id: "announcements",
        label: "Announcements",
        href: "/parent/announcements",
        icon: "megaphone",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/parent/notifications",
        icon: "bell",
        badge: "3",
      },
    ],
  },
};

