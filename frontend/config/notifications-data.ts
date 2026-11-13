/*
 * ============================================================================
 * EduSync — Stage 6: Notifications Mock Data, Helpers & API Contracts
 * ============================================================================
 *
 * Future Backend API Reference Contracts (Not called in Frontend Preview Mode):
 *
 * - GET   /schools/{school_id}/notifications
 * - PATCH /schools/{school_id}/notifications/{notification_id}/read
 *
 * Notes:
 * - Logically separate from Announcements data (`@/config/announcements-data`).
 * - Supports read/unread state persistence in sessionStorage and UI-only
 *   notification preference toggles.
 * ============================================================================
 */

import type { IconName } from "@/components/ui/Icon";

export type NotificationCategory =
  | "Student"
  | "Attendance"
  | "Fees"
  | "Announcement"
  | "AI Insight"
  | "System";

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "Student",
  "Attendance",
  "Fees",
  "Announcement",
  "AI Insight",
  "System",
];

export const NOTIFICATION_CATEGORY_ICONS: Record<
  NotificationCategory,
  IconName
> = {
  Student: "user-plus",
  Attendance: "clipboard-check",
  Fees: "indian-rupee",
  Announcement: "megaphone",
  "AI Insight": "sparkles",
  System: "settings",
};

export interface NotificationRecord {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
  targetHref?: string;
}

export interface NotificationPreferences {
  studentRegistration: boolean;
  attendanceAlerts: boolean;
  feePaymentAlerts: boolean;
  overdueFeeAlerts: boolean;
  announcementUpdates: boolean;
  aiInsightAlerts: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  studentRegistration: true,
  attendanceAlerts: true,
  feePaymentAlerts: true,
  overdueFeeAlerts: true,
  announcementUpdates: true,
  aiInsightAlerts: true,
};

export const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif-201",
    title: "New student registration completed",
    description:
      "Aarav Sharma (STU-2026-015) has been enrolled in Class 7-A and guardian contact details were verified.",
    timestamp: "10 mins ago",
    category: "Student",
    read: false,
    targetHref: "/dashboard/students",
  },
  {
    id: "notif-202",
    title: "Attendance submitted for Class 8-A",
    description:
      "Priya Nair recorded morning attendance for Class 8-A: 39 Present, 2 Absent, 1 Late.",
    timestamp: "28 mins ago",
    category: "Attendance",
    read: false,
    targetHref: "/dashboard/attendance/history",
  },
  {
    id: "notif-203",
    title: "Fee payment of ₹5,000 received",
    description:
      "Partial payment of ₹5,000 via UPI received for Invoice INV-2026-104 (Ananya Verma, Class 8-B).",
    timestamp: "1 hour ago",
    category: "Fees",
    read: false,
    targetHref: "/dashboard/fees/payments",
  },
  {
    id: "notif-204",
    title: "New announcement published",
    description:
      "Annual Sports Day circular has been published to Students and Parents with schedule attachment.",
    timestamp: "2 hours ago",
    category: "Announcement",
    read: false,
    targetHref: "/dashboard/announcements",
  },
  {
    id: "notif-205",
    title: "Several invoices are overdue",
    description:
      "18 student fee invoices totaling ₹45,000 have crossed their due date and require follow-up reminders.",
    timestamp: "3 hours ago",
    category: "Fees",
    read: false,
    targetHref: "/dashboard/fees/balances",
  },
  {
    id: "notif-206",
    title: "AI attendance insight generated",
    description:
      "Weekly AI insight flagged a 6.4% dip in Monday first-period attendance across Class 9-B.",
    timestamp: "Yesterday, 4:45 PM",
    category: "AI Insight",
    read: true,
    targetHref: "/dashboard/ai-insights",
  },
  {
    id: "notif-207",
    title: "Teacher assignment updated",
    description:
      "Vikram Singh was assigned as Science faculty lead for Class 9-A and Class 10-A for Term 2.",
    timestamp: "Yesterday, 1:20 PM",
    category: "System",
    read: true,
    targetHref: "/dashboard/classes",
  },
  {
    id: "notif-208",
    title: "Parent-Teacher Meeting circular live",
    description:
      "Term 1 PTM schedule for Classes 6 to 10 was delivered to 1,140 parent contacts.",
    timestamp: "Nov 11, 11:15 AM",
    category: "Announcement",
    read: true,
    targetHref: "/dashboard/announcements",
  },
  {
    id: "notif-209",
    title: "Low attendance threshold alert",
    description:
      "3 students in Class 7-B dropped below the 75% monthly attendance benchmark.",
    timestamp: "Nov 10, 3:05 PM",
    category: "Attendance",
    read: true,
    targetHref: "/dashboard/attendance",
  },
  {
    id: "notif-210",
    title: "Academic records sync completed",
    description:
      "Nightly school roster and fee ledger integrity check finished with 0 discrepancies.",
    timestamp: "Nov 9, 9:00 AM",
    category: "System",
    read: true,
    targetHref: "/dashboard/settings",
  },
];

const NOTIFICATIONS_STORAGE_KEY = "edusync_notifications_v1";

export function getStoredNotifications(): NotificationRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_NOTIFICATIONS;
  }
  try {
    const raw = window.sessionStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return INITIAL_NOTIFICATIONS;
    const parsed = JSON.parse(raw) as NotificationRecord[];
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(items: NotificationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}
