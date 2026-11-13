/*
 * ============================================================================
 * EduSync — Stage 8: Parent Portal Mock Data, Helpers & API Contracts
 * ============================================================================
 *
 * Existing Backend API Reference Contracts (Not called in Frontend Preview Mode):
 * - GET   /auth/me
 * - GET   /auth/memberships
 * - GET   /schools/{school_id}/students/{student_id}
 * - GET   /schools/{school_id}/students/{student_id}/guardians
 * - GET   /schools/{school_id}/classes/{class_id}/attendance
 * - GET   /schools/{school_id}/fees/invoices
 * - GET   /schools/{school_id}/fees/balances
 * - GET   /schools/{school_id}/fees/invoices/{invoice_id}/payments
 * - GET   /schools/{school_id}/announcements
 * - GET   /schools/{school_id}/notifications
 * - PATCH /schools/{school_id}/notifications/{notification_id}/read
 *
 * ----------------------------------------------------------------------------
 * MISSING BACKEND API REQUIREMENTS (Flagged for Backend Team — Section 12):
 * ----------------------------------------------------------------------------
 * 1. Dedicated Linked-Children Endpoint for Authenticated Parent/Guardian:
 *    - e.g. GET /schools/{school_id}/parents/me/children
 *    - Reason: Parents must only retrieve the student records linked to their
 *      guardian membership without knowing student_id values ahead of time or
 *      gaining access to school-wide student directories.
 *
 * 2. Parent-Scoped Attendance Retrieval per Linked Child:
 *    - e.g. GET /schools/{school_id}/parents/me/children/{student_id}/attendance
 *    - Reason: GET /schools/{school_id}/classes/{class_id}/attendance returns
 *      full class rosters and must not expose other students' attendance data
 *      to parents.
 *
 * 3. Parent-Scoped Fee Invoices, Balances & Payment History Endpoints:
 *    - e.g. GET /schools/{school_id}/parents/me/fees/invoices
 *           GET /schools/{school_id}/parents/me/fees/balances
 *           GET /schools/{school_id}/parents/me/fees/payments
 *    - Reason: Existing /fees/* endpoints must be strictly filtered on the
 *      server to invoices and payments belonging only to the authenticated
 *      parent's linked children.
 * ============================================================================
 */

import {
  getStoredAnnouncements,
  INITIAL_ANNOUNCEMENTS,
  type AnnouncementPriority,
} from "@/config/announcements-data";
import type { FeeInvoiceRecord, FeePaymentRecord } from "@/config/fee-data";
import type { NotificationRecord } from "@/config/notifications-data";

/* -------------------------------------------------------------------------- */
/*  Parent Profile & Overview Stats                                           */
/* -------------------------------------------------------------------------- */

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address: string;
  occupation: string;
  emergencyContact: string;
}

export const PARENT_PROFILE: ParentProfile = {
  id: "par-001",
  name: "Rajesh Naik",
  email: "parent@institution.in",
  phone: "+91 98230 11223",
  relationship: "Father",
  address: "14, Altinho Residency, Panaji, Goa 403001",
  occupation: "Senior Civil Engineer",
  emergencyContact: "+91 98230 11224 (Kavita Naik — Mother)",
};

export interface ParentOverviewStats {
  totalChildren: number;
  averageAttendance: string;
  pendingFees: number;
  unreadNotifications: number;
}

export const PARENT_OVERVIEW_STATS: ParentOverviewStats = {
  totalChildren: 2,
  averageAttendance: "95.9%",
  pendingFees: 12500,
  unreadNotifications: 3,
};

/* -------------------------------------------------------------------------- */
/*  Linked Children & Attendance Records (Read-Only Parent Scope)             */
/* -------------------------------------------------------------------------- */

export type ParentAttendanceStatus = "present" | "absent" | "late" | "excused";

export interface ChildAttendanceTrendPoint {
  day: string;
  date: string;
  percentage: number;
}

export interface ChildCalendarRecord {
  status: ParentAttendanceStatus;
  remarks?: string;
}

export interface ChildAttendanceHistoryRecord {
  date: string;
  status: ParentAttendanceStatus;
  remarks: string;
}

export interface ParentChildRecord {
  id: string;
  studentId: string;
  fullName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  relationship: string;
  className: string;
  grade: string;
  section: string;
  rollNumber: string;
  academicYear: string;
  enrollmentDate: string;
  enrollmentStatus: "Active" | "Inactive";
  classTeacher: string;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  totalFees: number;
  amountPaid: number;
  outstandingBalance: number;
  nextDueDate: string;
  attendanceTrend30d: ChildAttendanceTrendPoint[];
  calendarRecords: Record<string, ChildCalendarRecord>;
  attendanceHistory: ChildAttendanceHistoryRecord[];
}

const AARAV_CALENDAR_RECORDS: Record<string, ChildCalendarRecord> = {
  "2026-10-01": { status: "present", remarks: "Full day attended" },
  "2026-10-02": { status: "present", remarks: "Full day attended" },
  "2026-10-05": { status: "present", remarks: "Full day attended" },
  "2026-10-06": { status: "present", remarks: "Full day attended" },
  "2026-10-07": { status: "late", remarks: "Arrived 10 mins after morning assembly" },
  "2026-10-08": { status: "present", remarks: "Full day attended" },
  "2026-10-09": { status: "present", remarks: "Full day attended" },
  "2026-10-12": { status: "present", remarks: "Full day attended" },
  "2026-10-13": { status: "absent", remarks: "Sick leave (fever)" },
  "2026-10-14": { status: "absent", remarks: "Medical rest — parent note submitted" },
  "2026-10-15": { status: "present", remarks: "Full day attended" },
  "2026-10-16": { status: "present", remarks: "Full day attended" },
  "2026-10-19": { status: "present", remarks: "Full day attended" },
  "2026-10-20": { status: "present", remarks: "Science lab practical completed" },
  "2026-10-21": { status: "present", remarks: "Full day attended" },
  "2026-10-22": { status: "excused", remarks: "Inter-school debate competition" },
  "2026-10-23": { status: "present", remarks: "Full day attended" },
  "2026-10-26": { status: "present", remarks: "Full day attended" },
  "2026-10-27": { status: "present", remarks: "Full day attended" },
  "2026-10-28": { status: "present", remarks: "Full day attended" },
  "2026-10-29": { status: "absent", remarks: "Family travel" },
  "2026-10-30": { status: "present", remarks: "Full day attended" },
  "2026-11-02": { status: "present", remarks: "Full day attended" },
  "2026-11-03": { status: "present", remarks: "Full day attended" },
  "2026-11-04": { status: "late", remarks: "School bus route traffic delay" },
  "2026-11-05": { status: "present", remarks: "Full day attended" },
  "2026-11-06": { status: "present", remarks: "Full day attended" },
  "2026-11-09": { status: "present", remarks: "Full day attended" },
  "2026-11-10": { status: "present", remarks: "Mathematics unit quiz" },
  "2026-11-11": { status: "absent", remarks: "Mild viral cold" },
  "2026-11-12": { status: "present", remarks: "Full day attended" },
  "2026-11-13": { status: "present", remarks: "Full day attended" },
};

const ANANYA_CALENDAR_RECORDS: Record<string, ChildCalendarRecord> = {
  "2026-10-01": { status: "present", remarks: "Full day attended" },
  "2026-10-02": { status: "present", remarks: "Full day attended" },
  "2026-10-05": { status: "present", remarks: "Full day attended" },
  "2026-10-06": { status: "present", remarks: "Full day attended" },
  "2026-10-07": { status: "present", remarks: "Full day attended" },
  "2026-10-08": { status: "present", remarks: "Art & Craft showcase" },
  "2026-10-09": { status: "present", remarks: "Full day attended" },
  "2026-10-12": { status: "present", remarks: "Full day attended" },
  "2026-10-13": { status: "present", remarks: "Full day attended" },
  "2026-10-14": { status: "present", remarks: "Full day attended" },
  "2026-10-15": { status: "absent", remarks: "Dental appointment" },
  "2026-10-16": { status: "present", remarks: "Full day attended" },
  "2026-10-19": { status: "present", remarks: "Full day attended" },
  "2026-10-20": { status: "present", remarks: "Full day attended" },
  "2026-10-21": { status: "late", remarks: "Morning rain delay" },
  "2026-10-22": { status: "present", remarks: "Full day attended" },
  "2026-10-23": { status: "present", remarks: "Full day attended" },
  "2026-10-26": { status: "present", remarks: "Full day attended" },
  "2026-10-27": { status: "present", remarks: "Full day attended" },
  "2026-10-28": { status: "present", remarks: "Full day attended" },
  "2026-10-29": { status: "absent", remarks: "Family travel" },
  "2026-10-30": { status: "present", remarks: "Full day attended" },
  "2026-11-02": { status: "present", remarks: "Full day attended" },
  "2026-11-03": { status: "present", remarks: "Full day attended" },
  "2026-11-04": { status: "present", remarks: "Full day attended" },
  "2026-11-05": { status: "present", remarks: "Reading club participation" },
  "2026-11-06": { status: "present", remarks: "Full day attended" },
  "2026-11-09": { status: "present", remarks: "Full day attended" },
  "2026-11-10": { status: "present", remarks: "Full day attended" },
  "2026-11-11": { status: "present", remarks: "Full day attended" },
  "2026-11-12": { status: "present", remarks: "Full day attended" },
  "2026-11-13": { status: "present", remarks: "Full day attended" },
};

function buildHistoryFromCalendar(
  records: Record<string, ChildCalendarRecord>,
): ChildAttendanceHistoryRecord[] {
  return Object.entries(records)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, item]) => ({
      date,
      status: item.status,
      remarks: item.remarks ?? "Full day attended",
    }));
}

export const PARENT_CHILDREN: ParentChildRecord[] = [
  {
    id: "stu-1024",
    studentId: "STU-1024",
    fullName: "Aarav Naik",
    dateOfBirth: "14 Aug 2012",
    gender: "Male",
    bloodGroup: "O+",
    relationship: "Son",
    className: "Class 8-A",
    grade: "Class 8",
    section: "A",
    rollNumber: "08A-12",
    academicYear: "2026-2027",
    enrollmentDate: "05 Apr 2024",
    enrollmentStatus: "Active",
    classTeacher: "Priya Nair",
    attendancePercentage: 94.6,
    presentDays: 105,
    absentDays: 4,
    lateDays: 2,
    excusedDays: 1,
    totalFees: 48000,
    amountPaid: 35500,
    outstandingBalance: 12500,
    nextDueDate: "25 Nov 2026",
    attendanceTrend30d: [
      { day: "Oct 15", date: "2026-10-15", percentage: 93.2 },
      { day: "Oct 19", date: "2026-10-19", percentage: 93.8 },
      { day: "Oct 22", date: "2026-10-22", percentage: 94.1 },
      { day: "Oct 26", date: "2026-10-26", percentage: 94.5 },
      { day: "Oct 29", date: "2026-10-29", percentage: 93.9 },
      { day: "Nov 02", date: "2026-11-02", percentage: 94.2 },
      { day: "Nov 04", date: "2026-11-04", percentage: 94.0 },
      { day: "Nov 06", date: "2026-11-06", percentage: 94.4 },
      { day: "Nov 10", date: "2026-11-10", percentage: 94.7 },
      { day: "Nov 11", date: "2026-11-11", percentage: 94.1 },
      { day: "Nov 12", date: "2026-11-12", percentage: 94.4 },
      { day: "Nov 13", date: "2026-11-13", percentage: 94.6 },
    ],
    calendarRecords: AARAV_CALENDAR_RECORDS,
    attendanceHistory: buildHistoryFromCalendar(AARAV_CALENDAR_RECORDS),
  },
  {
    id: "stu-1082",
    studentId: "STU-1082",
    fullName: "Ananya Naik",
    dateOfBirth: "22 Mar 2015",
    gender: "Female",
    bloodGroup: "B+",
    relationship: "Daughter",
    className: "Class 5-B",
    grade: "Class 5",
    section: "B",
    rollNumber: "05B-04",
    academicYear: "2026-2027",
    enrollmentDate: "10 Apr 2025",
    enrollmentStatus: "Active",
    classTeacher: "Meera Krishnan",
    attendancePercentage: 97.2,
    presentDays: 109,
    absentDays: 2,
    lateDays: 1,
    excusedDays: 0,
    totalFees: 42000,
    amountPaid: 42000,
    outstandingBalance: 0,
    nextDueDate: "No dues pending",
    attendanceTrend30d: [
      { day: "Oct 15", date: "2026-10-15", percentage: 96.4 },
      { day: "Oct 19", date: "2026-10-19", percentage: 96.8 },
      { day: "Oct 22", date: "2026-10-22", percentage: 96.7 },
      { day: "Oct 26", date: "2026-10-26", percentage: 97.0 },
      { day: "Oct 29", date: "2026-10-29", percentage: 96.3 },
      { day: "Nov 02", date: "2026-11-02", percentage: 96.6 },
      { day: "Nov 04", date: "2026-11-04", percentage: 96.8 },
      { day: "Nov 06", date: "2026-11-06", percentage: 96.9 },
      { day: "Nov 10", date: "2026-11-10", percentage: 97.0 },
      { day: "Nov 11", date: "2026-11-11", percentage: 97.1 },
      { day: "Nov 12", date: "2026-11-12", percentage: 97.1 },
      { day: "Nov 13", date: "2026-11-13", percentage: 97.2 },
    ],
    calendarRecords: ANANYA_CALENDAR_RECORDS,
    attendanceHistory: buildHistoryFromCalendar(ANANYA_CALENDAR_RECORDS),
  },
];

export function getParentChildById(
  studentId: string,
): ParentChildRecord | undefined {
  return PARENT_CHILDREN.find(
    (child) =>
      child.id === studentId ||
      child.studentId.toLowerCase() === studentId.toLowerCase(),
  );
}

/* -------------------------------------------------------------------------- */
/*  Fee Invoices & Payments (Strictly Linked Children, Read-Only)             */
/* -------------------------------------------------------------------------- */

export const PARENT_INVOICES: FeeInvoiceRecord[] = [
  {
    id: "inv-p-101",
    invoiceId: "INV-2026-P101",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    guardianName: "Rajesh Naik",
    guardianPhone: "+91 98230 11223",
    academicYear: "2026-2027",
    title: "Term I Composite Tuition Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-06-05",
    dueDate: "2026-07-05",
    description: "Term I tuition and academic resource fee for Class 8-A.",
    originalAmount: 24000,
    discount: 0,
    totalAmount: 24000,
    paidAmount: 24000,
    balanceAmount: 0,
    status: "Paid",
  },
  {
    id: "inv-p-102",
    invoiceId: "INV-2026-P102",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    guardianName: "Rajesh Naik",
    guardianPhone: "+91 98230 11223",
    academicYear: "2026-2027",
    title: "Term II Tuition & Science Lab Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-10-01",
    dueDate: "2026-11-25",
    description: "Second term tuition and integrated science laboratory charges.",
    originalAmount: 16000,
    discount: 1000,
    totalAmount: 15000,
    paidAmount: 9500,
    balanceAmount: 5500,
    status: "Partial",
  },
  {
    id: "inv-p-103",
    invoiceId: "INV-2026-P103",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    guardianName: "Rajesh Naik",
    guardianPhone: "+91 98230 11223",
    academicYear: "2026-2027",
    title: "Term II School Bus Transportation Fee",
    category: "Transportation Fee",
    invoiceDate: "2026-10-28",
    dueDate: "2026-11-25",
    description: "Panaji Altinho route morning & afternoon bus service (Term II).",
    originalAmount: 5000,
    discount: 0,
    totalAmount: 5000,
    paidAmount: 0,
    balanceAmount: 5000,
    status: "Pending",
  },
  {
    id: "inv-p-104",
    invoiceId: "INV-2026-P104",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    guardianName: "Rajesh Naik",
    guardianPhone: "+91 98230 11223",
    academicYear: "2026-2027",
    title: "Annual Robotics & Activity Club Fee",
    category: "Activity Fee",
    invoiceDate: "2026-09-18",
    dueDate: "2026-11-05",
    description: "STEM robotics workshop kit and co-curricular club enrollment.",
    originalAmount: 4000,
    discount: 0,
    totalAmount: 4000,
    paidAmount: 2000,
    balanceAmount: 2000,
    status: "Overdue",
  },
  {
    id: "inv-p-105",
    invoiceId: "INV-2026-P105",
    studentId: "stu-1082",
    studentCode: "STU-1082",
    studentName: "Ananya Naik",
    className: "Class 5-B",
    guardianName: "Rajesh Naik",
    guardianPhone: "+91 98230 11223",
    academicYear: "2026-2027",
    title: "Annual Composite Tuition Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-06-08",
    dueDate: "2026-07-10",
    description: "Full academic year 2026-2027 tuition fee for Class 5-B.",
    originalAmount: 38000,
    discount: 2000,
    totalAmount: 36000,
    paidAmount: 36000,
    balanceAmount: 0,
    status: "Paid",
  },
  {
    id: "inv-p-106",
    invoiceId: "INV-2026-P106",
    studentId: "stu-1082",
    studentCode: "STU-1082",
    studentName: "Ananya Naik",
    className: "Class 5-B",
    guardianName: "Rajesh Naik",
    guardianPhone: "+91 98230 11223",
    academicYear: "2026-2027",
    title: "Activity, Art & Library Fee",
    category: "Activity Fee",
    invoiceDate: "2026-09-15",
    dueDate: "2026-10-15",
    description: "Annual library membership, art supplies, and sports day kit.",
    originalAmount: 6000,
    discount: 0,
    totalAmount: 6000,
    paidAmount: 6000,
    balanceAmount: 0,
    status: "Paid",
  },
];

export const PARENT_PAYMENTS: FeePaymentRecord[] = [
  {
    id: "pay-p-501",
    paymentId: "PAY-2026-P501",
    invoiceId: "INV-2026-P102",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    amountPaid: 9500,
    paymentDate: "2026-10-18",
    paymentMethod: "UPI",
    transactionRef: "UPI/429103847120/Naik",
    remarks: "First installment of Term II Tuition & Lab fee",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-p-502",
    paymentId: "PAY-2026-P502",
    invoiceId: "INV-2026-P106",
    studentId: "stu-1082",
    studentCode: "STU-1082",
    studentName: "Ananya Naik",
    className: "Class 5-B",
    amountPaid: 6000,
    paymentDate: "2026-10-08",
    paymentMethod: "UPI",
    transactionRef: "UPI/428019284412/Naik",
    remarks: "Full Activity, Art & Library fee settled",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-p-503",
    paymentId: "PAY-2026-P503",
    invoiceId: "INV-2026-P104",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    amountPaid: 2000,
    paymentDate: "2026-09-24",
    paymentMethod: "UPI",
    transactionRef: "UPI/426881092341/Naik",
    remarks: "Partial robotics kit deposit",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-p-504",
    paymentId: "PAY-2026-P504",
    invoiceId: "INV-2026-P105",
    studentId: "stu-1082",
    studentCode: "STU-1082",
    studentName: "Ananya Naik",
    className: "Class 5-B",
    amountPaid: 36000,
    paymentDate: "2026-06-22",
    paymentMethod: "Bank Transfer",
    transactionRef: "NEFT-HDFC0009182041",
    remarks: "Annual composite tuition settlement (early discount applied)",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-p-505",
    paymentId: "PAY-2026-P505",
    invoiceId: "INV-2026-P101",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    amountPaid: 24000,
    paymentDate: "2026-06-18",
    paymentMethod: "Bank Transfer",
    transactionRef: "NEFT-HDFC0009044182",
    remarks: "Term I Composite Tuition settlement",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
];

/* -------------------------------------------------------------------------- */
/*  School & Class Announcements (Read-Only Parent View)                      */
/* -------------------------------------------------------------------------- */

export type ParentAnnouncementCategory = "School Updates" | "Class Updates";

export interface ParentAnnouncementItem {
  id: string;
  title: string;
  category: ParentAnnouncementCategory;
  priority: AnnouncementPriority;
  audience: string;
  childName?: string;
  publishedDate: string;
  publishedBy: string;
  shortDescription: string;
  fullContent: string;
}

export const PARENT_ANNOUNCEMENTS: ParentAnnouncementItem[] = [
  {
    id: "p-ann-1",
    title: "Parent-Teacher Meeting (PTM) — Term II",
    category: "School Updates",
    priority: "Urgent",
    audience: "All Parents & Guardians",
    publishedDate: "2026-11-12",
    publishedBy: "Dr. Sunita Rao (Principal)",
    shortDescription:
      "Term II Parent-Teacher consultations will be held on Saturday, 21 Nov 2026 from 09:00 AM to 01:30 PM.",
    fullContent:
      "Dear Parents and Guardians,\n\nThe Term II Parent-Teacher Meeting (PTM) is scheduled for Saturday, 21 Nov 2026 between 09:00 AM and 01:30 PM across all grade blocks. Class teachers will review mid-term academic progress, attendance consistency, and upcoming examination readiness.\n\nParents with two or more children enrolled may visit Class 8-A (Room 301 — Priya Nair) and Class 5-B (Room 106 — Meera Krishnan) within their preferred morning slot. Kindly carry your parent ID badge at the main gate.",
  },
  {
    id: "p-ann-2",
    title: "Term II Examination Schedule Released",
    category: "School Updates",
    priority: "Important",
    audience: "Parents & Students (Grades 1–10)",
    publishedDate: "2026-11-10",
    publishedBy: "Examination Cell",
    shortDescription:
      "The Term II assessment timetable for Grades 5 to 10 begins on 07 Dec 2026. Morning reporting is 08:30 AM.",
    fullContent:
      "The Term II Examination Schedule for the academic year 2026-2027 has been finalized. Assessments will run from Monday, 07 Dec 2026 through Friday, 18 Dec 2026.\n\nStudents must arrive at school by 08:30 AM in full school uniform with required stationery. Revision worksheets are being shared in class over the next two weeks.",
  },
  {
    id: "p-ann-3",
    title: "Annual Sports Day 2026 — House Track & Field Events",
    category: "School Updates",
    priority: "Important",
    audience: "Entire School & Parents",
    publishedDate: "2026-11-08",
    publishedBy: "Sports & Co-Curricular Dept.",
    shortDescription:
      "Annual Sports Day will take place on 28 Nov 2026 at the Main Athletic Ground. Parents are warmly invited.",
    fullContent:
      "We are excited to invite all parents and guardians to our Annual Sports Day 2026 on Saturday, 28 Nov 2026 starting at 08:15 AM at the EduSync Main Athletic Ground.\n\nEvents include the March Past, 100m/200m sprints, relay races, and primary section novelty games. Refreshment stalls and shaded parent seating will be available near Pavilion B.",
  },
  {
    id: "p-ann-4",
    title: "Class 8-A Science Exhibition Project Guidelines",
    category: "Class Updates",
    priority: "Important",
    audience: "Class 8-A Parents",
    childName: "Aarav Naik",
    publishedDate: "2026-11-06",
    publishedBy: "Priya Nair (Class Teacher, 8-A)",
    shortDescription:
      "Working model outlines for the 02 Dec Science Exhibition are due by 24 Nov 2026.",
    fullContent:
      "Dear Class 8-A Parents,\n\nStudents are preparing group working models on Renewable Energy, Water Conservation, and Smart Agriculture for the upcoming Science Exhibition on 02 Dec 2026. Project proposal sheets must be signed and submitted by 24 Nov 2026.\n\nAll materials should be safe, low-voltage, and reusable.",
  },
  {
    id: "p-ann-5",
    title: "School Holiday Notice — Regional Festival & Winter Break",
    category: "School Updates",
    priority: "Normal",
    audience: "Entire School",
    publishedDate: "2026-11-03",
    publishedBy: "School Administration",
    shortDescription:
      "School remains closed on 19 Dec 2026 (Goa Liberation Day) and winter recess runs from 24 Dec 2026 to 03 Jan 2027.",
    fullContent:
      "Please take note of upcoming scheduled holidays:\n• Saturday, 19 Dec 2026 — Goa Liberation Day (School Closed)\n• Thursday, 24 Dec 2026 to Sunday, 03 Jan 2027 — Winter Break\n\nClasses will resume as normal on Monday, 04 Jan 2027 at 08:30 AM.",
  },
  {
    id: "p-ann-6",
    title: "Class 5-B Botanical Garden Field Trip Schedule",
    category: "Class Updates",
    priority: "Normal",
    audience: "Class 5-B Parents",
    childName: "Ananya Naik",
    publishedDate: "2026-10-30",
    publishedBy: "Meera Krishnan (Class Teacher, 5-B)",
    shortDescription:
      "Class 5-B educational nature walk on Friday, 27 Nov 2026 from 09:00 AM to 01:00 PM.",
    fullContent:
      "Class 5-B students will visit the State Botanical Garden for an environmental studies walk on Friday, 27 Nov 2026. School buses will depart at 09:00 AM and return by 01:00 PM.\n\nStudents should wear house T-shirts, comfortable walking shoes, and carry a water bottle and light snack.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Parent Notifications & Preferences (sessionStorage Persistence)           */
/* -------------------------------------------------------------------------- */

export interface ParentNotificationItem extends NotificationRecord {
  childName?: string;
}

export const PARENT_NOTIFICATIONS: ParentNotificationItem[] = [
  {
    id: "p-notif-1",
    title: "Attendance update for Aarav",
    description:
      "Aarav Naik (Class 8-A) was marked Present on 13 Nov 2026. Current term attendance stands at 94.6%.",
    timestamp: "35 mins ago",
    category: "Attendance",
    read: false,
    targetHref: "/parent/attendance",
    childName: "Aarav Naik",
  },
  {
    id: "p-notif-2",
    title: "Fee payment reminder",
    description:
      "Pending balance of ₹12,500 across Term II Tuition, Bus Transport, and Robotics fees for Aarav Naik (due 25 Nov 2026).",
    timestamp: "2 hours ago",
    category: "Fees",
    read: false,
    targetHref: "/parent/fees",
    childName: "Aarav Naik",
  },
  {
    id: "p-notif-3",
    title: "New parent-teacher meeting announcement",
    description:
      "Dr. Sunita Rao published Term II PTM schedule for Saturday, 21 Nov 2026 (09:00 AM – 01:30 PM).",
    timestamp: "4 hours ago",
    category: "Announcement",
    read: false,
    targetHref: "/parent/announcements",
  },
  {
    id: "p-notif-4",
    title: "School holiday notification",
    description:
      "Academic calendar updated with Goa Liberation Day (19 Dec) and Winter Break dates (24 Dec – 03 Jan).",
    timestamp: "Yesterday",
    category: "Announcement",
    read: true,
    targetHref: "/parent/announcements",
  },
  {
    id: "p-notif-5",
    title: "Fee invoice generated",
    description:
      "Invoice INV-2026-P103 (₹5,000 — Term II School Bus Transportation Fee) has been issued for Aarav Naik.",
    timestamp: "2 days ago",
    category: "Fees",
    read: true,
    targetHref: "/parent/fees",
    childName: "Aarav Naik",
  },
  {
    id: "p-notif-6",
    title: "Important school update — Science Exhibition & Field Trip",
    description:
      "Class 5-B Botanical Garden field trip schedule and Term II exam timetable are now available to view.",
    timestamp: "4 days ago",
    category: "Announcement",
    read: true,
    targetHref: "/parent/announcements",
    childName: "Ananya Naik",
  },
];

export interface ParentNotificationPreferences {
  attendanceAlerts: boolean;
  feeReminders: boolean;
  schoolAnnouncements: boolean;
  classUpdates: boolean;
  emailDigest: boolean;
}

export const DEFAULT_PARENT_NOTIFICATION_PREFERENCES: ParentNotificationPreferences =
  {
    attendanceAlerts: true,
    feeReminders: true,
    schoolAnnouncements: true,
    classUpdates: true,
    emailDigest: false,
  };

const PARENT_NOTIFICATIONS_KEY = "edusync_parent_notifications_v1";
const PARENT_SELECTED_CHILD_KEY = "edusync_parent_selected_child_v1";
const PARENT_PREFERENCES_KEY = "edusync_parent_preferences_v1";

export function getStoredParentNotifications(): ParentNotificationItem[] {
  if (typeof window === "undefined") {
    return PARENT_NOTIFICATIONS;
  }
  try {
    const raw = window.sessionStorage.getItem(PARENT_NOTIFICATIONS_KEY);
    if (!raw) return PARENT_NOTIFICATIONS;
    const parsed = JSON.parse(raw) as ParentNotificationItem[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : PARENT_NOTIFICATIONS;
  } catch {
    return PARENT_NOTIFICATIONS;
  }
}

export function saveStoredParentNotifications(
  items: ParentNotificationItem[],
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PARENT_NOTIFICATIONS_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}

export function getSelectedChildId(): string {
  const defaultId = PARENT_CHILDREN[0]?.id ?? "stu-1024";
  if (typeof window === "undefined") {
    return defaultId;
  }
  try {
    const stored = window.sessionStorage.getItem(PARENT_SELECTED_CHILD_KEY);
    if (stored && PARENT_CHILDREN.some((c) => c.id === stored)) {
      return stored;
    }
    return defaultId;
  } catch {
    return defaultId;
  }
}

export function saveSelectedChildId(childId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PARENT_SELECTED_CHILD_KEY, childId);
  } catch {
    // Ignore storage quota errors in preview mode
  }
}

export function getStoredParentPreferences(): ParentNotificationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PARENT_NOTIFICATION_PREFERENCES;
  }
  try {
    const raw = window.sessionStorage.getItem(PARENT_PREFERENCES_KEY);
    if (!raw) return DEFAULT_PARENT_NOTIFICATION_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<ParentNotificationPreferences>;
    return {
      ...DEFAULT_PARENT_NOTIFICATION_PREFERENCES,
      ...parsed,
    };
  } catch {
    return DEFAULT_PARENT_NOTIFICATION_PREFERENCES;
  }
}

export function saveStoredParentPreferences(
  prefs: ParentNotificationPreferences,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PARENT_PREFERENCES_KEY,
      JSON.stringify(prefs),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}

export function getSyncedParentAnnouncements(): ParentAnnouncementItem[] {
  if (typeof window === "undefined") {
    return PARENT_ANNOUNCEMENTS;
  }

  const initialIds = new Set(INITIAL_ANNOUNCEMENTS.map((a) => a.id));
  const linkedClassNames = new Set(PARENT_CHILDREN.map((c) => c.className));
  const adminRecords = getStoredAnnouncements();

  const syncedFromAdmin: ParentAnnouncementItem[] = adminRecords
    .filter((rec) => {
      if (rec.status !== "Published") return false;
      if (initialIds.has(rec.id)) return false;
      const targetsParents =
        rec.audiences.includes("Entire School") ||
        rec.audiences.includes("Parents");
      const targetsLinkedChildClass =
        rec.audiences.includes("Specific Class") &&
        Boolean(rec.specificClass && linkedClassNames.has(rec.specificClass));
      return targetsParents || targetsLinkedChildClass;
    })
    .map((rec) => {
      const matchedChild = rec.specificClass
        ? PARENT_CHILDREN.find((c) => c.className === rec.specificClass)
        : undefined;
      return {
        id: `synced-${rec.id}`,
        title: rec.title,
        category: matchedChild ? "Class Updates" : "School Updates",
        priority: rec.priority,
        audience: rec.specificClass
          ? `${rec.specificClass} Parents`
          : rec.audiences.join(", "),
        childName: matchedChild?.fullName,
        publishedDate: rec.publishedDate,
        publishedBy: `${rec.createdBy} (${rec.createdByRole})`,
        shortDescription: rec.shortDescription,
        fullContent: rec.content,
      };
    });

  return [...syncedFromAdmin, ...PARENT_ANNOUNCEMENTS];
}
