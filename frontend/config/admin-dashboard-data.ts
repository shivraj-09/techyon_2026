import type { IconName } from "@/components/ui/Icon";

export type DashboardRange = "today" | "week" | "month";

export interface OverviewStatItem {
  id: string;
  title: string;
  value: string;
  label: string;
  indicator: string;
  indicatorTone: "positive" | "warning";
  icon: IconName;
}

export const OVERVIEW_STATS_BY_RANGE: Record<
  DashboardRange,
  OverviewStatItem[]
> = {
  today: [
    {
      id: "total-students",
      title: "Total Students",
      value: "1,248",
      label: "Total enrolled students",
      indicator: "+5.2% from last month",
      indicatorTone: "positive",
      icon: "users",
    },
    {
      id: "attendance-today",
      title: "Attendance Today",
      value: "94.6%",
      label: "Overall attendance",
      indicator: "+2.1% from yesterday",
      indicatorTone: "positive",
      icon: "clipboard-check",
    },
    {
      id: "fees-collected",
      title: "Fees Collected",
      value: "₹8,45,000",
      label: "Collected this month",
      indicator: "+8.4% from last month",
      indicatorTone: "positive",
      icon: "wallet",
    },
    {
      id: "pending-fees",
      title: "Pending Fees",
      value: "₹1,25,000",
      label: "Outstanding amount",
      indicator: "32 invoices pending",
      indicatorTone: "warning",
      icon: "indian-rupee",
    },
  ],
  week: [
    {
      id: "total-students",
      title: "Total Students",
      value: "1,248",
      label: "Total enrolled students",
      indicator: "+5.2% from last month",
      indicatorTone: "positive",
      icon: "users",
    },
    {
      id: "attendance-today",
      title: "Attendance Today",
      value: "93.8%",
      label: "Weekly average attendance",
      indicator: "+1.4% from last week",
      indicatorTone: "positive",
      icon: "clipboard-check",
    },
    {
      id: "fees-collected",
      title: "Fees Collected",
      value: "₹8,45,000",
      label: "Collected this month",
      indicator: "+8.4% from last month",
      indicatorTone: "positive",
      icon: "wallet",
    },
    {
      id: "pending-fees",
      title: "Pending Fees",
      value: "₹1,25,000",
      label: "Outstanding amount",
      indicator: "32 invoices pending",
      indicatorTone: "warning",
      icon: "indian-rupee",
    },
  ],
  month: [
    {
      id: "total-students",
      title: "Total Students",
      value: "1,248",
      label: "Total enrolled students",
      indicator: "+5.2% from last month",
      indicatorTone: "positive",
      icon: "users",
    },
    {
      id: "attendance-today",
      title: "Attendance Today",
      value: "94.1%",
      label: "Monthly average attendance",
      indicator: "+1.8% from last month",
      indicatorTone: "positive",
      icon: "clipboard-check",
    },
    {
      id: "fees-collected",
      title: "Fees Collected",
      value: "₹8,45,000",
      label: "Collected this month",
      indicator: "+8.4% from last month",
      indicatorTone: "positive",
      icon: "wallet",
    },
    {
      id: "pending-fees",
      title: "Pending Fees",
      value: "₹1,25,000",
      label: "Outstanding amount",
      indicator: "32 invoices pending",
      indicatorTone: "warning",
      icon: "indian-rupee",
    },
  ],
};

export interface AttendanceDayPoint {
  day: string;
  dateLabel: string;
  percentage: number;
  present: number;
  absent: number;
  late: number;
}

export type AttendanceChartFilter = "7d" | "14d";

export const ATTENDANCE_OVERVIEW_SUMMARY = {
  percentage: "94.6%",
  present: 1181,
  absent: 48,
  late: 19,
};

export const ATTENDANCE_TREND_DATA: Record<
  AttendanceChartFilter,
  AttendanceDayPoint[]
> = {
  "7d": [
    {
      day: "Fri",
      dateLabel: "07 Nov",
      percentage: 93.2,
      present: 1163,
      absent: 62,
      late: 23,
    },
    {
      day: "Sat",
      dateLabel: "08 Nov",
      percentage: 91.8,
      present: 1146,
      absent: 76,
      late: 26,
    },
    {
      day: "Mon",
      dateLabel: "10 Nov",
      percentage: 94.0,
      present: 1173,
      absent: 54,
      late: 21,
    },
    {
      day: "Tue",
      dateLabel: "11 Nov",
      percentage: 95.1,
      present: 1187,
      absent: 44,
      late: 17,
    },
    {
      day: "Wed",
      dateLabel: "12 Nov",
      percentage: 93.6,
      present: 1168,
      absent: 58,
      late: 22,
    },
    {
      day: "Thu",
      dateLabel: "13 Nov",
      percentage: 92.5,
      present: 1154,
      absent: 69,
      late: 25,
    },
    {
      day: "Today",
      dateLabel: "14 Nov",
      percentage: 94.6,
      present: 1181,
      absent: 48,
      late: 19,
    },
  ],
  "14d": [
    {
      day: "W1 Mon",
      dateLabel: "02 Nov",
      percentage: 92.4,
      present: 1153,
      absent: 71,
      late: 24,
    },
    {
      day: "W1 Wed",
      dateLabel: "04 Nov",
      percentage: 93.5,
      present: 1167,
      absent: 59,
      late: 22,
    },
    {
      day: "W1 Fri",
      dateLabel: "06 Nov",
      percentage: 92.9,
      present: 1159,
      absent: 66,
      late: 23,
    },
    {
      day: "W2 Mon",
      dateLabel: "09 Nov",
      percentage: 94.0,
      present: 1173,
      absent: 54,
      late: 21,
    },
    {
      day: "W2 Tue",
      dateLabel: "10 Nov",
      percentage: 95.1,
      present: 1187,
      absent: 44,
      late: 17,
    },
    {
      day: "W2 Thu",
      dateLabel: "12 Nov",
      percentage: 93.6,
      present: 1168,
      absent: 58,
      late: 22,
    },
    {
      day: "Today",
      dateLabel: "14 Nov",
      percentage: 94.6,
      present: 1181,
      absent: 48,
      late: 19,
    },
  ],
};

export interface FeeMonthData {
  month: string;
  collected: number; // in INR
  pending: number; // in INR
}

export const FEE_COLLECTION_SUMMARY = {
  totalCollectedThisMonth: "₹8,45,000",
  outstandingAmount: "₹1,25,000",
  monthlyTrend: "+8.4% vs last month",
};

export const FEE_COLLECTION_SIX_MONTHS: FeeMonthData[] = [
  { month: "Jun", collected: 720000, pending: 165000 },
  { month: "Jul", collected: 760000, pending: 145000 },
  { month: "Aug", collected: 740000, pending: 155000 },
  { month: "Sep", collected: 795000, pending: 138000 },
  { month: "Oct", collected: 780000, pending: 140000 },
  { month: "Nov", collected: 845000, pending: 125000 },
];

export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export function formatINRLakhs(amount: number): string {
  const lakhs = amount / 100000;
  return `₹${lakhs.toFixed(2)}L`;
}

export interface ClassAttendanceRow {
  className: string;
  totalStudents: number;
  present: number;
  absent: number;
  attendancePct: number;
}

export const CLASS_WISE_ATTENDANCE: ClassAttendanceRow[] = [
  {
    className: "Class 6-A",
    totalStudents: 42,
    present: 40,
    absent: 2,
    attendancePct: 95.2,
  },
  {
    className: "Class 7-A",
    totalStudents: 38,
    present: 35,
    absent: 3,
    attendancePct: 92.1,
  },
  {
    className: "Class 8-A",
    totalStudents: 45,
    present: 43,
    absent: 2,
    attendancePct: 95.6,
  },
  {
    className: "Class 9-A",
    totalStudents: 40,
    present: 36,
    absent: 4,
    attendancePct: 90.0,
  },
  {
    className: "Class 10-A",
    totalStudents: 36,
    present: 35,
    absent: 1,
    attendancePct: 97.2,
  },
];

export interface RecentActivityItem {
  id: string;
  description: string;
  timestamp: string;
  icon: IconName;
  tone: "primary" | "success" | "warning" | "neutral";
}

export const RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: "act-1",
    description: "New student registered — Aarav Naik.",
    timestamp: "14 minutes ago",
    icon: "user-plus",
    tone: "primary",
  },
  {
    id: "act-2",
    description: "Attendance submitted — Class 8-A.",
    timestamp: "42 minutes ago",
    icon: "clipboard-check",
    tone: "success",
  },
  {
    id: "act-3",
    description: "Fee payment received — ₹5,000 from Riya's guardian.",
    timestamp: "1 hour ago",
    icon: "indian-rupee",
    tone: "success",
  },
  {
    id: "act-4",
    description: "New announcement published — Annual Sports Day.",
    timestamp: "2 hours ago",
    icon: "megaphone",
    tone: "warning",
  },
  {
    id: "act-5",
    description: "Teacher assigned — Class 7-B.",
    timestamp: "4 hours ago",
    icon: "book-open",
    tone: "neutral",
  },
  {
    id: "act-6",
    description: "Attendance submitted — Class 10-A.",
    timestamp: "5 hours ago",
    icon: "clipboard-check",
    tone: "success",
  },
  {
    id: "act-7",
    description: "Fee receipt generated — Term II installment #1042.",
    timestamp: "Yesterday, 4:15 PM",
    icon: "file-text",
    tone: "neutral",
  },
];

export interface QuickActionItem {
  id: string;
  label: string;
  subtitle: string;
  icon: IconName;
  href: string;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "add-student",
    label: "Add Student",
    subtitle: "Enroll new student",
    icon: "user-plus",
    href: "/dashboard/students",
  },
  {
    id: "create-class",
    label: "Create Class",
    subtitle: "Configure section",
    icon: "book-open",
    href: "/dashboard/classes",
  },
  {
    id: "mark-attendance",
    label: "Mark Attendance",
    subtitle: "Daily roll call",
    icon: "clipboard-check",
    href: "/dashboard/attendance",
  },
  {
    id: "record-fee",
    label: "Record Fee Payment",
    subtitle: "Log fee receipt",
    icon: "indian-rupee",
    href: "/dashboard/fees",
  },
  {
    id: "publish-announcement",
    label: "Publish Announcement",
    subtitle: "Send school notice",
    icon: "megaphone",
    href: "/dashboard/announcements",
  },
];

export interface AnnouncementPreviewItem {
  id: string;
  title: string;
  description: string;
  publishedDate: string;
  audience: string;
  audienceVariant: "primary" | "neutral" | "warning";
}

export const ANNOUNCEMENTS_PREVIEW: AnnouncementPreviewItem[] = [
  {
    id: "ann-1",
    title: "Annual Sports Day",
    description:
      "Track and field trials for Grades 6 to 12 will commence next Monday on the main school ground.",
    publishedDate: "Published today",
    audience: "All School",
    audienceVariant: "primary",
  },
  {
    id: "ann-2",
    title: "Parent-Teacher Meeting",
    description:
      "Mid-term academic progress review scheduled for Saturday between 9:00 AM and 1:00 PM.",
    publishedDate: "Published yesterday",
    audience: "Parents & Teachers",
    audienceVariant: "neutral",
  },
  {
    id: "ann-3",
    title: "School Holiday Notice",
    description:
      "The institution will remain closed on Friday in observance of the regional public holiday.",
    publishedDate: "Published 3 days ago",
    audience: "Students & Parents",
    audienceVariant: "warning",
  },
];

export interface AiInsightItem {
  id: string;
  text: string;
  category: string;
  severity: "warning" | "success";
}

export const AI_SCHOOL_INSIGHTS: AiInsightItem[] = [
  {
    id: "ai-1",
    text: "Class 9-A has shown a 6% decline in attendance over the last two weeks.",
    category: "Attendance Alert",
    severity: "warning",
  },
  {
    id: "ai-2",
    text: "Fee collection is progressing steadily, with 87% of monthly invoices paid.",
    category: "Finance Forecast",
    severity: "success",
  },
];

