/*
 * ============================================================================
 * EduSync — Stage 9: Admin AI Insights & Analytics Mock Data & Contracts
 * ============================================================================
 *
 * Future Backend API Reference Contract (Not called in Frontend Preview Mode):
 * - POST /api/v1/schools/{school_id}/ai-insights/generate
 *
 * Important Architecture Notes:
 * - Current backend analytics are rule-based summaries over authorised
 *   aggregate school records, NOT a trained predictive AI model.
 * - Response schemas for the AI Insights endpoint are not yet finalised, so
 *   all insights, trends, Q&A summaries and reports below run locally via
 *   structured mock aggregates.
 * - Insights strictly avoid sensitive student-level predictions or claiming
 *   reasons for individual absences.
 * ============================================================================
 */

export type DateRangeKey = "7d" | "30d" | "this_month" | "3m";

export const DATE_RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "3m", label: "Last 3 months" },
];

export type InsightCategory = "Attendance" | "Fees" | "School Operations";
export type InsightPriority = "High" | "Medium" | "Low";

export interface AnalyticsOverviewMetrics {
  dateRange: DateRangeKey;
  periodLabel: string;
  attendanceRate: number;
  attendanceDeltaLabel: string;
  attendanceTrend: "up" | "down";
  attendanceThresholdPct: number;
  lowAttendanceStudentsCount: number;
  enrolledStudentsTotal: number;
  feeCollected: number;
  feeExpected: number;
  feeCollectionPct: number;
  feeCollectionDeltaLabel: string;
  feeCollectionTrend: "up" | "down";
  feeOutstanding: number;
  overdueAmount: number;
  overdueInvoicesCount: number;
}

export interface AttendanceTrendPoint {
  label: string;
  dateLabel: string;
  attendancePct: number;
  previousPeriodPct: number;
  isMonday?: boolean;
}

export interface ClassAttendanceComparison {
  classId: string;
  className: string;
  attendancePct: number;
  prevPeriodPct: number;
  studentCount: number;
  belowThresholdCount: number;
}

export interface LowAttendanceStudentRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  attendancePct: number;
  absences: number;
  sessionsRecorded: number;
  status: "Critical" | "Below Threshold" | "Watchlist";
}

export interface FeeTimelinePoint {
  label: string;
  collected: number;
  outstanding: number;
}

export interface ClassOutstandingBreakdown {
  classId: string;
  className: string;
  outstandingAmount: number;
  overdueAmount: number;
  pendingInvoices: number;
}

export interface OverdueInvoiceRow {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: "Overdue" | "Severely Overdue";
}

export interface AiInsightRecord {
  id: string;
  category: InsightCategory;
  title: string;
  explanation: string;
  evidenceMetric: string;
  priority: InsightPriority;
  suggestedAction: string;
  generatedDate: string;
  ruleBasis: string;
  details: string[];
}

export interface RecommendedActionRecord {
  id: string;
  title: string;
  whySuggested: string;
  evidence: string;
  priority: InsightPriority;
  actionLabel: string;
  targetRoute: string;
  ruleSource: string;
  reviewSteps: string[];
}

export interface InsightReportRecord {
  id: string;
  title: string;
  category: InsightCategory | "Comprehensive";
  generatedDate: string;
  periodCovered: string;
  summary: string;
  keyMetrics: { label: string; value: string }[];
  highlights: string[];
}

export interface PeriodAnalyticsBundle {
  overview: AnalyticsOverviewMetrics;
  attendanceTrend: AttendanceTrendPoint[];
  classAttendance: ClassAttendanceComparison[];
  feeTimeline: FeeTimelinePoint[];
  classFeeBreakdown: ClassOutstandingBreakdown[];
}

export const ANALYTICS_BY_RANGE: Record<DateRangeKey, PeriodAnalyticsBundle> = {
  "7d": {
    overview: {
      dateRange: "7d",
      periodLabel: "Last 7 days (07 Nov – 13 Nov 2026)",
      attendanceRate: 93.1,
      attendanceDeltaLabel: "+0.7% vs previous 7 days",
      attendanceTrend: "up",
      attendanceThresholdPct: 75,
      lowAttendanceStudentsCount: 15,
      enrolledStudentsTotal: 1248,
      feeCollected: 218000,
      feeExpected: 260000,
      feeCollectionPct: 83.8,
      feeCollectionDeltaLabel: "+2.1% vs previous 7 days",
      feeCollectionTrend: "up",
      feeOutstanding: 42000,
      overdueAmount: 24000,
      overdueInvoicesCount: 4,
    },
    attendanceTrend: [
      { label: "Mon", dateLabel: "07 Nov", attendancePct: 90.4, previousPeriodPct: 89.8, isMonday: true },
      { label: "Tue", dateLabel: "08 Nov", attendancePct: 93.2, previousPeriodPct: 92.6 },
      { label: "Wed", dateLabel: "09 Nov", attendancePct: 94.1, previousPeriodPct: 93.1 },
      { label: "Thu", dateLabel: "10 Nov", attendancePct: 93.8, previousPeriodPct: 93.4 },
      { label: "Fri", dateLabel: "11 Nov", attendancePct: 93.5, previousPeriodPct: 92.9 },
      { label: "Sat", dateLabel: "12 Nov", attendancePct: 93.6, previousPeriodPct: 92.7 },
    ],
    classAttendance: [
      { classId: "class-8-a", className: "Class 8-A", attendancePct: 85.4, prevPeriodPct: 86.2, studentCount: 42, belowThresholdCount: 5 },
      { classId: "class-8-b", className: "Class 8-B", attendancePct: 86.9, prevPeriodPct: 87.5, studentCount: 40, belowThresholdCount: 3 },
      { classId: "class-7-b", className: "Class 7-B", attendancePct: 89.8, prevPeriodPct: 90.4, studentCount: 39, belowThresholdCount: 2 },
      { classId: "class-9-b", className: "Class 9-B", attendancePct: 91.5, prevPeriodPct: 91.0, studentCount: 41, belowThresholdCount: 2 },
      { classId: "class-6-b", className: "Class 6-B", attendancePct: 93.4, prevPeriodPct: 92.8, studentCount: 38, belowThresholdCount: 1 },
      { classId: "class-7-a", className: "Class 7-A", attendancePct: 94.6, prevPeriodPct: 94.1, studentCount: 40, belowThresholdCount: 1 },
      { classId: "class-9-a", className: "Class 9-A", attendancePct: 95.8, prevPeriodPct: 95.1, studentCount: 42, belowThresholdCount: 1 },
      { classId: "class-10-a", className: "Class 10-A", attendancePct: 97.1, prevPeriodPct: 96.4, studentCount: 41, belowThresholdCount: 0 },
    ],
    feeTimeline: [
      { label: "07 Nov", collected: 38000, outstanding: 11000 },
      { label: "08 Nov", collected: 44000, outstanding: 8000 },
      { label: "09 Nov", collected: 31000, outstanding: 6000 },
      { label: "10 Nov", collected: 41000, outstanding: 7000 },
      { label: "11 Nov", collected: 36000, outstanding: 5000 },
      { label: "12 Nov", collected: 28000, outstanding: 5000 },
    ],
    classFeeBreakdown: [
      { classId: "class-8-a", className: "Class 8-A", outstandingAmount: 14000, overdueAmount: 9000, pendingInvoices: 2 },
      { classId: "class-9-b", className: "Class 9-B", outstandingAmount: 10000, overdueAmount: 7000, pendingInvoices: 2 },
      { classId: "class-7-b", className: "Class 7-B", outstandingAmount: 8000, overdueAmount: 5000, pendingInvoices: 1 },
      { classId: "class-8-b", className: "Class 8-B", outstandingAmount: 6000, overdueAmount: 3000, pendingInvoices: 1 },
      { classId: "class-6-a", className: "Class 6-A", outstandingAmount: 4000, overdueAmount: 0, pendingInvoices: 1 },
    ],
  },

  "30d": {
    overview: {
      dateRange: "30d",
      periodLabel: "Last 30 days (15 Oct – 13 Nov 2026)",
      attendanceRate: 92.4,
      attendanceDeltaLabel: "-1.4% vs previous 30 days",
      attendanceTrend: "down",
      attendanceThresholdPct: 75,
      lowAttendanceStudentsCount: 18,
      enrolledStudentsTotal: 1248,
      feeCollected: 845000,
      feeExpected: 1080000,
      feeCollectionPct: 78.2,
      feeCollectionDeltaLabel: "-3.8% vs previous 30 days",
      feeCollectionTrend: "down",
      feeOutstanding: 235000,
      overdueAmount: 112000,
      overdueInvoicesCount: 14,
    },
    attendanceTrend: [
      { label: "19 Oct", dateLabel: "Mon 19 Oct", attendancePct: 89.2, previousPeriodPct: 91.6, isMonday: true },
      { label: "22 Oct", dateLabel: "Thu 22 Oct", attendancePct: 93.4, previousPeriodPct: 94.1 },
      { label: "26 Oct", dateLabel: "Mon 26 Oct", attendancePct: 89.6, previousPeriodPct: 91.8, isMonday: true },
      { label: "29 Oct", dateLabel: "Thu 29 Oct", attendancePct: 93.8, previousPeriodPct: 94.5 },
      { label: "02 Nov", dateLabel: "Mon 02 Nov", attendancePct: 89.8, previousPeriodPct: 92.1, isMonday: true },
      { label: "05 Nov", dateLabel: "Thu 05 Nov", attendancePct: 93.6, previousPeriodPct: 94.4 },
      { label: "09 Nov", dateLabel: "Mon 09 Nov", attendancePct: 90.4, previousPeriodPct: 92.0, isMonday: true },
      { label: "13 Nov", dateLabel: "Fri 13 Nov", attendancePct: 94.1, previousPeriodPct: 94.2 },
    ],
    classAttendance: [
      { classId: "class-8-a", className: "Class 8-A", attendancePct: 84.2, prevPeriodPct: 89.4, studentCount: 42, belowThresholdCount: 6 },
      { classId: "class-8-b", className: "Class 8-B", attendancePct: 85.6, prevPeriodPct: 89.8, studentCount: 40, belowThresholdCount: 4 },
      { classId: "class-7-b", className: "Class 7-B", attendancePct: 88.9, prevPeriodPct: 91.2, studentCount: 39, belowThresholdCount: 3 },
      { classId: "class-9-b", className: "Class 9-B", attendancePct: 90.8, prevPeriodPct: 91.9, studentCount: 41, belowThresholdCount: 2 },
      { classId: "class-6-b", className: "Class 6-B", attendancePct: 93.1, prevPeriodPct: 93.5, studentCount: 38, belowThresholdCount: 1 },
      { classId: "class-7-a", className: "Class 7-A", attendancePct: 94.4, prevPeriodPct: 94.6, studentCount: 40, belowThresholdCount: 1 },
      { classId: "class-9-a", className: "Class 9-A", attendancePct: 95.5, prevPeriodPct: 95.8, studentCount: 42, belowThresholdCount: 1 },
      { classId: "class-10-a", className: "Class 10-A", attendancePct: 96.8, prevPeriodPct: 96.4, studentCount: 41, belowThresholdCount: 0 },
    ],
    feeTimeline: [
      { label: "Week 1 (Oct 15–21)", collected: 225000, outstanding: 72000 },
      { label: "Week 2 (Oct 22–28)", collected: 210000, outstanding: 64000 },
      { label: "Week 3 (Oct 29–Nov 4)", collected: 192000, outstanding: 54000 },
      { label: "Week 4 (Nov 5–13)", collected: 218000, outstanding: 45000 },
    ],
    classFeeBreakdown: [
      { classId: "class-8-a", className: "Class 8-A", outstandingAmount: 64000, overdueAmount: 34000, pendingInvoices: 7 },
      { classId: "class-9-b", className: "Class 9-B", outstandingAmount: 52000, overdueAmount: 28000, pendingInvoices: 6 },
      { classId: "class-7-b", className: "Class 7-B", outstandingAmount: 41000, overdueAmount: 20000, pendingInvoices: 5 },
      { classId: "class-8-b", className: "Class 8-B", outstandingAmount: 34000, overdueAmount: 16000, pendingInvoices: 4 },
      { classId: "class-6-a", className: "Class 6-A", outstandingAmount: 24000, overdueAmount: 8000, pendingInvoices: 3 },
      { classId: "class-10-a", className: "Class 10-A", outstandingAmount: 20000, overdueAmount: 6000, pendingInvoices: 2 },
    ],
  },

  this_month: {
    overview: {
      dateRange: "this_month",
      periodLabel: "This month (01 Nov – 13 Nov 2026)",
      attendanceRate: 91.8,
      attendanceDeltaLabel: "-1.9% vs last month to date",
      attendanceTrend: "down",
      attendanceThresholdPct: 75,
      lowAttendanceStudentsCount: 20,
      enrolledStudentsTotal: 1248,
      feeCollected: 495000,
      feeExpected: 650000,
      feeCollectionPct: 76.2,
      feeCollectionDeltaLabel: "-4.5% vs last month to date",
      feeCollectionTrend: "down",
      feeOutstanding: 155000,
      overdueAmount: 74000,
      overdueInvoicesCount: 9,
    },
    attendanceTrend: [
      { label: "02 Nov", dateLabel: "Mon 02 Nov", attendancePct: 89.1, previousPeriodPct: 91.8, isMonday: true },
      { label: "04 Nov", dateLabel: "Wed 04 Nov", attendancePct: 92.2, previousPeriodPct: 93.9 },
      { label: "06 Nov", dateLabel: "Fri 06 Nov", attendancePct: 92.4, previousPeriodPct: 93.6 },
      { label: "09 Nov", dateLabel: "Mon 09 Nov", attendancePct: 89.9, previousPeriodPct: 92.1, isMonday: true },
      { label: "11 Nov", dateLabel: "Wed 11 Nov", attendancePct: 93.1, previousPeriodPct: 94.3 },
      { label: "13 Nov", dateLabel: "Fri 13 Nov", attendancePct: 94.0, previousPeriodPct: 94.6 },
    ],
    classAttendance: [
      { classId: "class-8-a", className: "Class 8-A", attendancePct: 83.8, prevPeriodPct: 88.9, studentCount: 42, belowThresholdCount: 7 },
      { classId: "class-8-b", className: "Class 8-B", attendancePct: 85.1, prevPeriodPct: 89.2, studentCount: 40, belowThresholdCount: 4 },
      { classId: "class-7-b", className: "Class 7-B", attendancePct: 88.4, prevPeriodPct: 90.8, studentCount: 39, belowThresholdCount: 3 },
      { classId: "class-9-b", className: "Class 9-B", attendancePct: 90.2, prevPeriodPct: 91.7, studentCount: 41, belowThresholdCount: 3 },
      { classId: "class-6-b", className: "Class 6-B", attendancePct: 92.9, prevPeriodPct: 93.4, studentCount: 38, belowThresholdCount: 1 },
      { classId: "class-7-a", className: "Class 7-A", attendancePct: 94.0, prevPeriodPct: 94.5, studentCount: 40, belowThresholdCount: 1 },
      { classId: "class-9-a", className: "Class 9-A", attendancePct: 95.2, prevPeriodPct: 95.6, studentCount: 42, belowThresholdCount: 1 },
      { classId: "class-10-a", className: "Class 10-A", attendancePct: 96.4, prevPeriodPct: 96.2, studentCount: 41, belowThresholdCount: 0 },
    ],
    feeTimeline: [
      { label: "Nov 01–04", collected: 148000, outstanding: 52000 },
      { label: "Nov 05–08", collected: 175000, outstanding: 55000 },
      { label: "Nov 09–13", collected: 172000, outstanding: 48000 },
    ],
    classFeeBreakdown: [
      { classId: "class-8-a", className: "Class 8-A", outstandingAmount: 44000, overdueAmount: 23000, pendingInvoices: 5 },
      { classId: "class-9-b", className: "Class 9-B", outstandingAmount: 36000, overdueAmount: 19000, pendingInvoices: 4 },
      { classId: "class-7-b", className: "Class 7-B", outstandingAmount: 27000, overdueAmount: 13000, pendingInvoices: 3 },
      { classId: "class-8-b", className: "Class 8-B", outstandingAmount: 22000, overdueAmount: 10000, pendingInvoices: 3 },
      { classId: "class-6-a", className: "Class 6-A", outstandingAmount: 15000, overdueAmount: 6000, pendingInvoices: 2 },
      { classId: "class-10-a", className: "Class 10-A", outstandingAmount: 11000, overdueAmount: 3000, pendingInvoices: 1 },
    ],
  },

  "3m": {
    overview: {
      dateRange: "3m",
      periodLabel: "Last 3 months (Aug – Nov 2026)",
      attendanceRate: 93.6,
      attendanceDeltaLabel: "+0.9% vs previous 3 months",
      attendanceTrend: "up",
      attendanceThresholdPct: 75,
      lowAttendanceStudentsCount: 12,
      enrolledStudentsTotal: 1248,
      feeCollected: 2460000,
      feeExpected: 2850000,
      feeCollectionPct: 86.3,
      feeCollectionDeltaLabel: "+1.8% vs previous 3 months",
      feeCollectionTrend: "up",
      feeOutstanding: 390000,
      overdueAmount: 148000,
      overdueInvoicesCount: 18,
    },
    attendanceTrend: [
      { label: "Aug W3", dateLabel: "17–22 Aug", attendancePct: 93.8, previousPeriodPct: 92.2 },
      { label: "Sep W1", dateLabel: "01–05 Sep", attendancePct: 94.4, previousPeriodPct: 93.1 },
      { label: "Sep W3", dateLabel: "14–19 Sep", attendancePct: 94.9, previousPeriodPct: 93.4 },
      { label: "Oct W1", dateLabel: "05–10 Oct", attendancePct: 93.9, previousPeriodPct: 93.0 },
      { label: "Oct W3", dateLabel: "19–24 Oct", attendancePct: 92.6, previousPeriodPct: 92.9 },
      { label: "Nov W1", dateLabel: "02–07 Nov", attendancePct: 92.0, previousPeriodPct: 92.4 },
      { label: "Nov W2", dateLabel: "09–13 Nov", attendancePct: 93.1, previousPeriodPct: 92.5 },
    ],
    classAttendance: [
      { classId: "class-8-a", className: "Class 8-A", attendancePct: 87.2, prevPeriodPct: 89.8, studentCount: 42, belowThresholdCount: 4 },
      { classId: "class-8-b", className: "Class 8-B", attendancePct: 88.4, prevPeriodPct: 90.1, studentCount: 40, belowThresholdCount: 3 },
      { classId: "class-7-b", className: "Class 7-B", attendancePct: 91.1, prevPeriodPct: 91.4, studentCount: 39, belowThresholdCount: 2 },
      { classId: "class-9-b", className: "Class 9-B", attendancePct: 92.3, prevPeriodPct: 91.8, studentCount: 41, belowThresholdCount: 1 },
      { classId: "class-6-b", className: "Class 6-B", attendancePct: 94.2, prevPeriodPct: 93.5, studentCount: 38, belowThresholdCount: 1 },
      { classId: "class-7-a", className: "Class 7-A", attendancePct: 95.0, prevPeriodPct: 94.4, studentCount: 40, belowThresholdCount: 1 },
      { classId: "class-9-a", className: "Class 9-A", attendancePct: 96.1, prevPeriodPct: 95.5, studentCount: 42, belowThresholdCount: 0 },
      { classId: "class-10-a", className: "Class 10-A", attendancePct: 97.2, prevPeriodPct: 96.6, studentCount: 41, belowThresholdCount: 0 },
    ],
    feeTimeline: [
      { label: "Aug 2026", collected: 785000, outstanding: 110000 },
      { label: "Sep 2026", collected: 830000, outstanding: 125000 },
      { label: "Oct 2026", collected: 845000, outstanding: 155000 },
    ],
    classFeeBreakdown: [
      { classId: "class-8-a", className: "Class 8-A", outstandingAmount: 108000, overdueAmount: 46000, pendingInvoices: 10 },
      { classId: "class-9-b", className: "Class 9-B", outstandingAmount: 86000, overdueAmount: 36000, pendingInvoices: 8 },
      { classId: "class-7-b", className: "Class 7-B", outstandingAmount: 68000, overdueAmount: 26000, pendingInvoices: 6 },
      { classId: "class-8-b", className: "Class 8-B", outstandingAmount: 54000, overdueAmount: 20000, pendingInvoices: 5 },
      { classId: "class-6-a", className: "Class 6-A", outstandingAmount: 42000, overdueAmount: 12000, pendingInvoices: 4 },
      { classId: "class-10-a", className: "Class 10-A", outstandingAmount: 32000, overdueAmount: 8000, pendingInvoices: 3 },
    ],
  },
};

export const LOW_ATTENDANCE_STUDENTS: LowAttendanceStudentRecord[] = [
  {
    id: "stu-104",
    studentId: "STU-2026-004",
    studentName: "Devansh Kulkarni",
    classId: "class-8-a",
    className: "Class 8-A",
    attendancePct: 62.5,
    absences: 9,
    sessionsRecorded: 24,
    status: "Critical",
  },
  {
    id: "stu-105",
    studentId: "STU-2026-005",
    studentName: "Meera Sawant",
    classId: "class-8-a",
    className: "Class 8-A",
    attendancePct: 66.7,
    absences: 8,
    sessionsRecorded: 24,
    status: "Below Threshold",
  },
  {
    id: "stu-106",
    studentId: "STU-2026-006",
    studentName: "Rohan Deshpande",
    classId: "class-8-b",
    className: "Class 8-B",
    attendancePct: 68.0,
    absences: 8,
    sessionsRecorded: 25,
    status: "Below Threshold",
  },
  {
    id: "stu-107",
    studentId: "STU-2026-007",
    studentName: "Tanvi Kamat",
    classId: "class-7-b",
    className: "Class 7-B",
    attendancePct: 70.8,
    absences: 7,
    sessionsRecorded: 24,
    status: "Below Threshold",
  },
  {
    id: "stu-108",
    studentId: "STU-2026-008",
    studentName: "Siddharth Parab",
    classId: "class-8-a",
    className: "Class 8-A",
    attendancePct: 72.0,
    absences: 7,
    sessionsRecorded: 25,
    status: "Below Threshold",
  },
  {
    id: "stu-103",
    studentId: "STU-2026-003",
    studentName: "Karan Joshi",
    classId: "class-9-b",
    className: "Class 9-B",
    attendancePct: 73.9,
    absences: 6,
    sessionsRecorded: 23,
    status: "Below Threshold",
  },
  {
    id: "stu-102",
    studentId: "STU-2026-002",
    studentName: "Ananya Verma",
    classId: "class-8-b",
    className: "Class 8-B",
    attendancePct: 78.3,
    absences: 5,
    sessionsRecorded: 23,
    status: "Watchlist",
  },
  {
    id: "stu-101",
    studentId: "STU-2026-001",
    studentName: "Aarav Sharma",
    classId: "class-7-b",
    className: "Class 7-B",
    attendancePct: 79.2,
    absences: 5,
    sessionsRecorded: 24,
    status: "Watchlist",
  },
];

export const OVERDUE_INVOICE_ROWS: OverdueInvoiceRow[] = [
  {
    id: "inv-2026-1001",
    invoiceNo: "INV-2026-1001",
    studentId: "stu-104",
    studentName: "Devansh Kulkarni",
    className: "Class 8-A",
    amount: 18500,
    dueDate: "15 Oct 2026",
    daysOverdue: 29,
    status: "Severely Overdue",
  },
  {
    id: "inv-2026-1002",
    invoiceNo: "INV-2026-1002",
    studentId: "stu-103",
    studentName: "Karan Joshi",
    className: "Class 9-B",
    amount: 16500,
    dueDate: "20 Oct 2026",
    daysOverdue: 24,
    status: "Severely Overdue",
  },
  {
    id: "inv-2026-1003",
    invoiceNo: "INV-2026-1003",
    studentId: "stu-105",
    studentName: "Meera Sawant",
    className: "Class 8-A",
    amount: 15500,
    dueDate: "25 Oct 2026",
    daysOverdue: 19,
    status: "Overdue",
  },
  {
    id: "inv-2026-1004",
    invoiceNo: "INV-2026-1004",
    studentId: "stu-107",
    studentName: "Tanvi Kamat",
    className: "Class 7-B",
    amount: 14000,
    dueDate: "30 Oct 2026",
    daysOverdue: 14,
    status: "Overdue",
  },
  {
    id: "inv-2026-1005",
    invoiceNo: "INV-2026-1005",
    studentId: "stu-106",
    studentName: "Rohan Deshpande",
    className: "Class 8-B",
    amount: 16000,
    dueDate: "02 Nov 2026",
    daysOverdue: 11,
    status: "Overdue",
  },
  {
    id: "inv-2026-1006",
    invoiceNo: "INV-2026-1006",
    studentId: "stu-108",
    studentName: "Siddharth Parab",
    className: "Class 9-B",
    amount: 11500,
    dueDate: "05 Nov 2026",
    daysOverdue: 8,
    status: "Overdue",
  },
  {
    id: "inv-2026-1007",
    invoiceNo: "INV-2026-1007",
    studentId: "stu-101",
    studentName: "Neha Rane",
    className: "Class 6-A",
    amount: 8000,
    dueDate: "08 Nov 2026",
    daysOverdue: 5,
    status: "Overdue",
  },
  {
    id: "inv-2026-1008",
    invoiceNo: "INV-2026-1008",
    studentId: "stu-102",
    studentName: "Pranav Gaonkar",
    className: "Class 10-A",
    amount: 12000,
    dueDate: "10 Nov 2026",
    daysOverdue: 3,
    status: "Overdue",
  },
];

export const AI_INSIGHTS_CATALOG: AiInsightRecord[] = [
  {
    id: "ins-att-1",
    category: "Attendance",
    title: "Attendance has declined in Class 8 compared with the previous month.",
    explanation:
      "Combined attendance across Class 8-A and Class 8-B dropped by 4.7 percentage points compared with the preceding 30-day baseline.",
    evidenceMetric: "Class 8-A: 84.2% (-5.2 pts) · Class 8-B: 85.6% (-4.2 pts)",
    priority: "High",
    suggestedAction: "Schedule a class-level attendance review with Class 8 teachers.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Class period-over-period delta >= 3.0 percentage points",
    details: [
      "Class 8-A recorded 6 students below the configured 75% attendance threshold.",
      "Class 8-B recorded 4 students below the configured 75% attendance threshold.",
      "Aggregate figures highlight sections needing administrative verification only; they do not establish individual reasons for absence.",
    ],
  },
  {
    id: "ins-att-2",
    category: "Attendance",
    title: "Monday attendance is consistently lower than the weekly average.",
    explanation:
      "School-wide Monday attendance averaged 89.8% over the last four Mondays, compared with 93.7% across Tuesday–Friday.",
    evidenceMetric: "Monday avg: 89.8% vs Mid-week avg: 93.7% (-3.9 pts)",
    priority: "Medium",
    suggestedAction: "Review morning roll-call submission timings and Monday schedule circulars.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Weekday variance exceeds 2.5 percentage points over 4 consecutive weeks",
    details: [
      "Lower Monday rates occurred consistently on 19 Oct (89.2%), 26 Oct (89.6%), 02 Nov (89.8%), and 09 Nov (90.4%).",
      "Comparing aggregate day-of-week attendance helps administration verify timetable or communication patterns.",
    ],
  },
  {
    id: "ins-att-3",
    category: "Attendance",
    title: "Several classes have attendance below the configured 90% school benchmark.",
    explanation:
      "Three classes (Class 8-A, Class 8-B, and Class 7-B) are currently tracking below the 90% section attendance target.",
    evidenceMetric: "3 of 8 tracked senior sections below 90% target (18 students < 75%)",
    priority: "Medium",
    suggestedAction: "Send section-level attendance summaries to respective class teachers.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Section aggregate below configured 90% school target",
    details: [
      "Class 8-A (84.2%), Class 8-B (85.6%), and Class 7-B (88.9%) fall below the 90% benchmark.",
      "Across the school, 18 students are currently below the 75% minimum attendance threshold.",
    ],
  },
  {
    id: "ins-fee-1",
    category: "Fees",
    title: "Fee collection is lower than the previous period.",
    explanation:
      "Current 30-day fee collection rate stands at 78.2% (₹8,45,000 of ₹10,80,000 expected), down 3.8% from the previous 30-day cycle.",
    evidenceMetric: "₹8,45,000 collected (78.2%) · -3.8% vs previous cycle",
    priority: "High",
    suggestedAction: "Send automated due-date payment reminders to guardians with open invoices.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Collection rate drop >= 3.0% compared with prior cycle",
    details: [
      "Week 3 collections dipped to ₹1,92,000 before recovering slightly to ₹2,18,000 in Week 4.",
      "Total remaining balance across all open invoices is ₹2,35,000.",
    ],
  },
  {
    id: "ins-fee-2",
    category: "Fees",
    title: "A significant portion of outstanding fees is concentrated in two classes.",
    explanation:
      "Class 8-A and Class 9-B together account for ₹1,16,000 out of ₹2,35,000 in total outstanding fees (49.4%).",
    evidenceMetric: "Class 8-A: ₹64,000 + Class 9-B: ₹52,000 (49.4% of ₹2,35,000)",
    priority: "High",
    suggestedAction: "Review pending fee balances for Class 8-A and Class 9-B in Fee Management.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Top 2 sections represent >= 45% of total school outstanding balance",
    details: [
      "Class 8-A carries 7 pending invoices totalling ₹64,000 (₹34,000 overdue).",
      "Class 9-B carries 6 pending invoices totalling ₹52,000 (₹28,000 overdue).",
    ],
  },
  {
    id: "ins-fee-3",
    category: "Fees",
    title: "Several invoices have passed their due dates.",
    explanation:
      "14 fee invoices totalling ₹1,12,000 have crossed their scheduled due dates within the last 30 days.",
    evidenceMetric: "14 overdue invoices · ₹1,12,000 (47.7% of outstanding fees)",
    priority: "Medium",
    suggestedAction: "Audit overdue ledger entries and verify follow-up status with the accounts desk.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Invoice status = Overdue and overdue share > 35% of balance",
    details: [
      "Two high-value invoices exceed 20 days overdue (INV-2026-1001 and INV-2026-1002).",
      "Remaining ₹1,23,000 in outstanding fees corresponds to upcoming or non-overdue billing cycles.",
    ],
  },
  {
    id: "ins-ops-1",
    category: "School Operations",
    title: "Some classes have consistently higher attendance than others.",
    explanation:
      "Class 10-A (96.8%) and Class 9-A (95.5%) consistently lead attendance benchmarks by over 11 percentage points compared with Class 8-A.",
    evidenceMetric: "Top spread: Class 10-A (96.8%) vs Class 8-A (84.2%)",
    priority: "Low",
    suggestedAction: "Review daily attendance workflows shared by senior section teachers.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Inter-section spread exceeds 10 percentage points",
    details: [
      "Class 10-A has maintained zero students below the 75% threshold throughout the selected window.",
      "Class 9-A maintained > 95% across all four weekly checkpoints.",
    ],
  },
  {
    id: "ins-ops-2",
    category: "School Operations",
    title: "Fee collection and attendance trends can be reviewed together at an aggregate level.",
    explanation:
      "Class 8-A currently appears in the highest-attention tier for both attendance (84.2%) and outstanding fees (₹64,000).",
    evidenceMetric: "Overlap detected in Class 8-A across Attendance & Fee ledgers",
    priority: "Medium",
    suggestedAction: "Coordinate weekly operational status check between class coordinator and accounts team.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Section flagged in top 2 for both low attendance and outstanding balances",
    details: [
      "Correlation is highlighted strictly as an operational workload overlap at the class level.",
      "Does not imply causal linkage or infer individual family circumstances.",
    ],
  },
  {
    id: "ins-ops-3",
    category: "School Operations",
    title: "Administrators may benefit from reviewing recurring operational patterns.",
    explanation:
      "Mid-month Mondays and Week 3 billing windows repeatedly show softer metrics across the past 60 days.",
    evidenceMetric: "Observed across 4 Monday cycles & 2 monthly billing windows",
    priority: "Low",
    suggestedAction: "Schedule reminder circulars on Friday afternoons before Monday attendance and fee due dates.",
    generatedDate: "13 Nov 2026",
    ruleBasis: "Rule: Recurring calendar pattern across >= 2 billing cycles",
    details: [
      "Bundling fee reminders with weekly parent announcements has historically stabilised Week 4 collections.",
    ],
  },
];

export const RECOMMENDED_ACTIONS: RecommendedActionRecord[] = [
  {
    id: "act-1",
    title: "Review attendance in Class 8",
    whySuggested:
      "Class 8-A (84.2%) and Class 8-B (85.6%) recorded the sharpest month-over-month drop and account for 10 of 18 students below 75%.",
    evidence: "Class 8 combined: 84.9% (-4.7 pts vs previous period) · 10 students < 75%",
    priority: "High",
    actionLabel: "Open Attendance",
    targetRoute: "/admin/attendance",
    ruleSource: "Rule-based threshold check (< 90% class average & >= 3% drop)",
    reviewSteps: [
      "Open Attendance Management and filter registers by Class 8-A and Class 8-B.",
      "Confirm daily roll-call submissions are complete with no missing teacher entries.",
      "Coordinate with Class 8 homeroom teachers to share routine guardian notices for low-attendance counts.",
    ],
  },
  {
    id: "act-2",
    title: "Follow up on overdue fee invoices",
    whySuggested:
      "14 invoices totalling ₹1,12,000 are past due, representing 47.7% of all pending fees.",
    evidence: "14 overdue invoices · ₹1,12,000 overdue across 6 classes",
    priority: "High",
    actionLabel: "View Balances",
    targetRoute: "/admin/fees/balances",
    ruleSource: "Rule-based billing check (Overdue invoices > 10)",
    reviewSteps: [
      "Inspect overdue entries in Fee Management -> Outstanding Balances.",
      "Prioritise invoices > 15 days overdue starting with INV-2026-1001 and INV-2026-1002.",
      "Verify whether partial payments or bank transfers are awaiting manual reconciliation.",
    ],
  },
  {
    id: "act-3",
    title: "Review classes with declining attendance",
    whySuggested:
      "Class 7-B dropped 2.3 percentage points to 88.9% alongside recurring Monday dips across middle school sections.",
    evidence: "Class 7-B: 88.9% (-2.3 pts) · Monday school avg: 89.8%",
    priority: "Medium",
    actionLabel: "Inspect Class List",
    targetRoute: "/admin/classes",
    ruleSource: "Rule-based trend comparison (Prev 30d vs Current 30d)",
    reviewSteps: [
      "Review Class 7-B roster and Monday attendance submissions in Classes -> Class Detail.",
      "Ensure substitute teachers have attendance marking access when homeroom teachers are away.",
    ],
  },
  {
    id: "act-4",
    title: "Monitor fee collection progress this month",
    whySuggested:
      "Collection rate for the current period is 78.2%, trailing the prior cycle benchmark by 3.8 percentage points.",
    evidence: "₹8,45,000 collected of ₹10,80,000 billed · ₹2,35,000 remaining",
    priority: "Medium",
    actionLabel: "Open Invoices",
    targetRoute: "/admin/fees/invoices",
    ruleSource: "Rule-based collection pacing monitor (< 80% mid-cycle target)",
    reviewSteps: [
      "Review upcoming due dates before 25 Nov 2026 in Fee Invoices.",
      "Publish a school-wide fee reminder circular via Announcements if needed.",
    ],
  },
];

export const INSIGHT_HISTORY_REPORTS: InsightReportRecord[] = [
  {
    id: "rep-nov-w2",
    title: "Weekly Attendance & Collection Digest — Nov Week 2",
    category: "Comprehensive",
    generatedDate: "13 Nov 2026, 09:00 AM",
    periodCovered: "15 Oct – 13 Nov 2026",
    summary:
      "Summary across 1,248 enrolled students: 92.4% overall attendance (-1.4% vs prior 30d) and 78.2% fee collection (₹8,45,000 collected; ₹2,35,000 outstanding).",
    keyMetrics: [
      { label: "Attendance Rate", value: "92.4%" },
      { label: "Students < 75%", value: "18" },
      { label: "Fees Collected", value: "₹8,45,000" },
      { label: "Overdue Invoices", value: "14 (₹1,12,000)" },
    ],
    highlights: [
      "Class 8-A (84.2%) and Class 8-B (85.6%) flagged for administrative review.",
      "Monday average attendance tracked 3.9 percentage points below mid-week averages.",
      "49.4% of outstanding fees are concentrated in Class 8-A and Class 9-B.",
    ],
  },
  {
    id: "rep-oct-fee",
    title: "Monthly Fee Reconciliation Summary — October 2026",
    category: "Fees",
    generatedDate: "01 Nov 2026, 08:30 AM",
    periodCovered: "01 Oct – 31 Oct 2026",
    summary:
      "October collections reached 82.0% of scheduled invoices, with 11 invoices transitioning to overdue status at month-end.",
    keyMetrics: [
      { label: "Collected (Oct)", value: "₹9,10,000" },
      { label: "Collection Rate", value: "82.0%" },
      { label: "Month-End Balance", value: "₹2,00,000" },
      { label: "Overdue Count", value: "11 invoices" },
    ],
    highlights: [
      "UPI and Bank Transfer accounted for the majority of settled Tuition Fee invoices.",
      "Class 8-A and Class 9-B had the largest carried-forward pending balances.",
    ],
  },
  {
    id: "rep-oct-att",
    title: "Mid-Term Attendance Threshold Audit",
    category: "Attendance",
    generatedDate: "28 Oct 2026, 10:15 AM",
    periodCovered: "01 Oct – 27 Oct 2026",
    summary:
      "Evaluated section-level attendance compliance against the 75% threshold across Classes 6 to 10.",
    keyMetrics: [
      { label: "School Average", value: "93.2%" },
      { label: "Highest Class", value: "Class 10-A (96.5%)" },
      { label: "Lowest Class", value: "Class 8-A (86.1%)" },
      { label: "Below 75%", value: "15 students" },
    ],
    highlights: [
      "Senior board sections (Class 10-A, Class 9-A) maintained > 95% consistency.",
      "Recommended early register checks on Monday mornings across Grade 8.",
    ],
  },
  {
    id: "rep-ops-sep",
    title: "Quarter-Start Operational Patterns Overview",
    category: "School Operations",
    generatedDate: "05 Oct 2026, 09:00 AM",
    periodCovered: "01 Sep – 30 Sep 2026",
    summary:
      "Aggregate operational summary comparing attendance submission cadence and billing cycle response times.",
    keyMetrics: [
      { label: "Attendance Rate", value: "94.1%" },
      { label: "Fee Collection", value: "87.4%" },
      { label: "Daily Submission", value: "98.5% on time" },
      { label: "Flagged Sections", value: "1 section" },
    ],
    highlights: [
      "Friday parent circular reminders improved Week 4 invoice settlement speed.",
      "Roll-call submission compliance remained above 98% across primary and middle grades.",
    ],
  },
];

export const ASK_EDUSYNC_SUGGESTIONS: string[] = [
  "Which classes had the lowest attendance this month?",
  "How much fee remains outstanding?",
  "Summarise attendance trends over the last 30 days.",
  "Which classes need attendance follow-up?",
  "How does this month's fee collection compare with last month?",
];

export function resolveMockAnalyticsResponse(
  question: string,
  activeRange: DateRangeKey,
): { answer: string; matched: boolean; scopeNote: string } {
  const q = question.toLowerCase().trim();
  const bundle = ANALYTICS_BY_RANGE[activeRange];

  if (
    q.includes("lowest attendance") ||
    (q.includes("which class") && q.includes("lowest"))
  ) {
    return {
      matched: true,
      scopeNote: `Rule-based summary (${bundle.overview.periodLabel})`,
      answer:
        "Based on recorded class registers for This month, **Class 8-A (83.8%)** and **Class 8-B (85.1%)** had the lowest attendance, followed by **Class 7-B (88.4%)**. In comparison, Class 10-A recorded the highest attendance at 96.4%.",
    };
  }

  if (
    q.includes("outstanding") ||
    q.includes("how much fee") ||
    q.includes("overdue") ||
    q.includes("pending fee")
  ) {
    return {
      matched: true,
      scopeNote: `Rule-based fee ledger summary (${bundle.overview.periodLabel})`,
      answer:
        "For the Last 30 days window, **₹2,35,000** remains outstanding out of ₹10,80,000 expected fees (collection rate: **78.2%**). Within that outstanding balance, **₹1,12,000** across **14 invoices** is currently **overdue**, with Class 8-A (₹64,000) and Class 9-B (₹52,000) representing 49.4% of total unpaid balances.",
    };
  }

  if (
    q.includes("trend") ||
    q.includes("last 30 days") ||
    q.includes("summarise attendance") ||
    q.includes("summarize attendance")
  ) {
    return {
      matched: true,
      scopeNote: "Rule-based attendance summary (15 Oct – 13 Nov 2026)",
      answer:
        "Over the last 30 days, school-wide attendance averaged **92.4%**, representing a **-1.4% dip** compared with the preceding 30 days. Mid-week attendance remained steady around **93.6%–94.1%**, whereas Monday attendance consistently dipped to **89.2%–90.4%**, and 18 students are currently below the 75% threshold.",
    };
  }

  if (
    q.includes("follow-up") ||
    q.includes("follow up") ||
    q.includes("below") ||
    q.includes("need attendance")
  ) {
    return {
      matched: true,
      scopeNote: `Rule-based section threshold check (< 90% target)`,
      answer:
        "Three sections currently fall below the 90% school attendance benchmark and are queued for administrative follow-up: **Class 8-A** (84.2%, 6 students < 75%), **Class 8-B** (85.6%, 4 students < 75%), and **Class 7-B** (88.9%, 3 students < 75%). Note: These figures show aggregate participation counts only and do not establish reasons for absence.",
    };
  }

  if (
    q.includes("compare") ||
    q.includes("last month") ||
    q.includes("fee collection")
  ) {
    return {
      matched: true,
      scopeNote: "Rule-based period comparison (Nov MTD vs Oct comparison)",
      answer:
        "This month's fee collection stands at **₹4,95,000 collected of ₹6,50,000 billed (76.2%)**, which is **4.5 percentage points lower** than last month's to-date pace. Over the full 30-day window, collection is **78.2%** (₹8,45,000), down **3.8%** from the prior 30-day cycle.",
    };
  }

  if (q.includes("class 8") || q.includes("class 9") || q.includes("highest")) {
    return {
      matched: true,
      scopeNote: `Rule-based aggregate summary (${bundle.overview.periodLabel})`,
      answer:
        `In ${bundle.overview.periodLabel}, overall school attendance is **${bundle.overview.attendanceRate}%** (${bundle.overview.attendanceDeltaLabel}) and fee collection is **${bundle.overview.feeCollectionPct}%**. Class 10-A leads attendance at ${bundle.classAttendance[bundle.classAttendance.length - 1]?.attendancePct}%, while Class 8-A requires priority review for both attendance and pending fee balances.`,
    };
  }

  return {
    matched: false,
    scopeNote: "Available aggregate data limitation",
    answer:
      "I can only summarise available rule-based school aggregates for **attendance rates, class comparisons, threshold counts, fee collections, and overdue balances** in this preview. Questions outside these datasets (such as individual academic grades, teacher evaluations, or reasons behind student absences) cannot be answered from the mock data.",
  };
}

