import type { IconName } from "@/components/ui/Icon";

export type UserRole =
  | "admin"
  | "teacher"
  | "parent"
  | "counsellor"
  | "student";

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
        id: "student-voice-linking",
        label: "Student Voice Linking",
        href: "/admin/student-voice-linking",
        icon: "link",
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
      {
        id: "refer-student",
        label: "Refer a Student",
        href: "/teacher/referrals/new",
        icon: "file-plus",
      },
      {
        id: "my-referrals",
        label: "My Referrals",
        href: "/teacher/referrals",
        icon: "clipboard-check",
      },
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
  counsellor: {
    role: "counsellor",
    roleLabel: "Counsellor",
    defaultUserName: "Dr. Meenakshi Kulkarni",
    defaultUserEmail: "counsellor@institution.in",
    navItems: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/counsellor/dashboard",
        icon: "layout-dashboard",
      },
      {
        id: "referral-inbox",
        label: "Referral Inbox",
        href: "/counsellor/referrals",
        icon: "inbox",
      },
      {
        id: "counselling-cases",
        label: "Counselling Cases",
        href: "/counsellor/cases",
        icon: "shield",
      },
      {
        id: "sessions",
        label: "Sessions",
        href: "/counsellor/sessions",
        icon: "calendar",
      },
      {
        id: "notices",
        label: "Notices",
        href: "/counsellor/notices",
        icon: "megaphone",
      },
      {
        id: "student-voice",
        label: "Student Voice",
        href: "/counsellor/student-voice",
        icon: "message-square",
      },
      {
        id: "meeting-requests",
        label: "Meeting Requests",
        href: "/counsellor/meeting-requests",
        icon: "user-check",
      },
    ],
  },
  student: {
    role: "student",
    roleLabel: "Student Voice",
    defaultUserName: "Student · SV-2041",
    defaultUserEmail: "student.voice@institution.in",
    navItems: [
      {
        id: "student-voice",
        label: "Student Voice",
        href: "/student/voice",
        icon: "heart",
      },
      {
        id: "my-conversations",
        label: "My Conversations",
        href: "/student/voice/conversations",
        icon: "message-square",
      },
      {
        id: "meeting-requests",
        label: "Meeting Requests",
        href: "/student/voice/meeting-requests",
        icon: "calendar-check",
      },
      {
        id: "notices",
        label: "Notices",
        href: "/student/voice/notices",
        icon: "megaphone",
      },
    ],
  },
};

