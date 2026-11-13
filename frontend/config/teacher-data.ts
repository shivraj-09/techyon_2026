/*
 * ============================================================================
 * EduSync — Teacher Portal Mock Data, Types & Backend Compatibility Contracts
 * ============================================================================
 *
 * Future Backend API Reference Contracts (Not called in Frontend Preview Mode):
 * - GET   /auth/me
 * - GET   /auth/memberships
 * - GET   /schools/{school_id}/classes                      (backend-enforced teacher scope)
 * - GET   /schools/{school_id}/classes/{class_id}/roster
 * - GET   /schools/{school_id}/classes/{class_id}/attendance
 * - POST  /schools/{school_id}/classes/{class_id}/attendance
 * - PATCH /schools/{school_id}/attendance/{attendance_id}
 * - GET   /schools/{school_id}/announcements
 * - POST  /schools/{school_id}/announcements
 * - GET   /schools/{school_id}/notifications
 * - PATCH /schools/{school_id}/notifications/{notification_id}/read
 *
 * Notes:
 * - Strictly scoped to Teacher Priya Nair's 4 assigned classes:
 *   Class 6-A, Class 7-B, Class 8-A, and Class 9-A.
 * - Zero school-wide financial, fee, billing, or admin-only data is exposed.
 * ============================================================================
 */

import type {
  AttendanceEntryRecord,
  AttendanceSessionRecord,
  AttendanceStatus,
} from "@/config/attendance-data";
import {
  getStoredAnnouncements,
  INITIAL_ANNOUNCEMENTS,
  type AnnouncementPriority,
  type AnnouncementStatus,
} from "@/config/announcements-data";
import type { NotificationRecord } from "@/config/notifications-data";
import type { IconName } from "@/components/ui/Icon";

/* -------------------------------------------------------------------------- */
/*  Teacher Profile & Dashboard Overview                                      */
/* -------------------------------------------------------------------------- */

export interface TeacherProfile {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  assignedClasses: string[];
  designation: string;
  academicYear: string;
  phone: string;
}

export const TEACHER_PROFILE: TeacherProfile = {
  id: "tch-014",
  teacherId: "TCH-2026-014",
  name: "Priya Nair",
  email: "priya.nair@institution.in",
  department: "Mathematics",
  subjects: ["Mathematics", "Vedic Math Club"],
  assignedClasses: ["Class 6-A", "Class 7-B", "Class 8-A", "Class 9-A"],
  designation: "Senior Mathematics Faculty",
  academicYear: "2026-2027",
  phone: "+91 98451 22089",
};

export interface TeacherDashboardStats {
  assignedClasses: number;
  totalStudents: number;
  attendanceToday: string;
  pendingAttendance: string;
}

export const TEACHER_DASHBOARD_STATS: TeacherDashboardStats = {
  assignedClasses: 4,
  totalStudents: 156,
  attendanceToday: "92.4%",
  pendingAttendance: "1 Class",
};

/* -------------------------------------------------------------------------- */
/*  Today's Teaching Schedule                                                 */
/* -------------------------------------------------------------------------- */

export interface TodayScheduleItem {
  id: string;
  classId: string;
  className: string;
  subject: string;
  time: string;
  room: string;
  studentCount: number;
  attendanceStatus: "Submitted" | "Pending";
}

export const TODAY_SCHEDULE: TodayScheduleItem[] = [
  {
    id: "sched-1",
    classId: "class-6-a",
    className: "Class 6-A",
    subject: "Mathematics",
    time: "09:00 AM",
    room: "Room 204",
    studentCount: 40,
    attendanceStatus: "Submitted",
  },
  {
    id: "sched-2",
    classId: "class-7-b",
    className: "Class 7-B",
    subject: "Mathematics",
    time: "10:00 AM",
    room: "Room 208",
    studentCount: 39,
    attendanceStatus: "Submitted",
  },
  {
    id: "sched-3",
    classId: "class-8-a",
    className: "Class 8-A",
    subject: "Mathematics",
    time: "11:30 AM",
    room: "Room 301",
    studentCount: 41,
    attendanceStatus: "Submitted",
  },
  {
    id: "sched-4",
    classId: "class-9-a",
    className: "Class 9-A",
    subject: "Mathematics",
    time: "01:00 PM",
    room: "Room 305",
    studentCount: 36,
    attendanceStatus: "Pending",
  },
];

/* -------------------------------------------------------------------------- */
/*  Assigned Classes                                                          */
/* -------------------------------------------------------------------------- */

export interface TeacherClassItem {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
  academicYear: string;
  isClassTeacher: boolean;
  studentCount: number;
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceStatusToday: "Submitted" | "Pending";
  scheduleTime: string;
  room: string;
  recentActivities: string[];
}

export const TEACHER_ASSIGNED_CLASSES: TeacherClassItem[] = [
  {
    id: "class-6-a",
    name: "Class 6-A",
    grade: "Class 6",
    section: "A",
    subject: "Mathematics",
    academicYear: "2026-2027",
    isClassTeacher: true,
    studentCount: 40,
    attendanceRate: 95.0,
    presentCount: 38,
    absentCount: 1,
    lateCount: 1,
    attendanceStatusToday: "Submitted",
    scheduleTime: "09:00 AM",
    room: "Room 204",
    recentActivities: [
      "Morning attendance submitted at 09:12 AM (38 Present, 1 Absent, 1 Late).",
      "Fractions & Decimals worksheet announcement shared with Class 6-A.",
      "Class Teacher parent-teacher slot schedule confirmed for Saturday.",
    ],
  },
  {
    id: "class-7-b",
    name: "Class 7-B",
    grade: "Class 7",
    section: "B",
    subject: "Mathematics",
    academicYear: "2026-2027",
    isClassTeacher: false,
    studentCount: 39,
    attendanceRate: 92.3,
    presentCount: 36,
    absentCount: 2,
    lateCount: 1,
    attendanceStatusToday: "Submitted",
    scheduleTime: "10:00 AM",
    room: "Room 208",
    recentActivities: [
      "Period 2 attendance submitted at 10:08 AM (36 Present, 2 Absent, 1 Late).",
      "Linear Equations practice quiz scheduled for Friday morning.",
      "Updated enrollment record for newly transferred student Devika Rao.",
    ],
  },
  {
    id: "class-8-a",
    name: "Class 8-A",
    grade: "Class 8",
    section: "A",
    subject: "Mathematics",
    academicYear: "2026-2027",
    isClassTeacher: true,
    studentCount: 41,
    attendanceRate: 95.1,
    presentCount: 39,
    absentCount: 1,
    lateCount: 1,
    attendanceStatusToday: "Submitted",
    scheduleTime: "11:30 AM",
    room: "Room 301",
    recentActivities: [
      "Morning attendance submitted at 11:38 AM (39 Present, 1 Absent, 1 Late).",
      "Algebraic Identities mock test graded and shared with students.",
      "2 students nominated for Regional Mathematics Olympiad warm-up.",
    ],
  },
  {
    id: "class-9-a",
    name: "Class 9-A",
    grade: "Class 9",
    section: "A",
    subject: "Mathematics",
    academicYear: "2026-2027",
    isClassTeacher: false,
    studentCount: 36,
    attendanceRate: 86.1,
    presentCount: 31,
    absentCount: 5,
    lateCount: 0,
    attendanceStatusToday: "Pending",
    scheduleTime: "01:00 PM",
    room: "Room 305",
    recentActivities: [
      "Afternoon Mathematics session attendance is pending submission for today.",
      "Coordinate Geometry lab assignment due next Monday.",
      "Parent follow-up noted for 2 students below 80% monthly attendance.",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  7-Day Attendance Trend & Recent Teacher Activities                        */
/* -------------------------------------------------------------------------- */

export interface TeacherAttendanceTrendPoint {
  date: string;
  label: string;
  percentage: number;
  present: number;
  absent: number;
  late: number;
}

export const TEACHER_ATTENDANCE_TREND: TeacherAttendanceTrendPoint[] = [
  {
    date: "2026-11-06",
    label: "Nov 06",
    percentage: 91.0,
    present: 142,
    absent: 10,
    late: 4,
  },
  {
    date: "2026-11-07",
    label: "Nov 07",
    percentage: 93.6,
    present: 146,
    absent: 7,
    late: 3,
  },
  {
    date: "2026-11-08",
    label: "Nov 08",
    percentage: 90.4,
    present: 141,
    absent: 11,
    late: 4,
  },
  {
    date: "2026-11-10",
    label: "Nov 10",
    percentage: 92.9,
    present: 145,
    absent: 8,
    late: 3,
  },
  {
    date: "2026-11-11",
    label: "Nov 11",
    percentage: 94.2,
    present: 147,
    absent: 6,
    late: 3,
  },
  {
    date: "2026-11-12",
    label: "Nov 12",
    percentage: 91.7,
    present: 143,
    absent: 9,
    late: 4,
  },
  {
    date: "2026-11-13",
    label: "Nov 13",
    percentage: 92.4,
    present: 144,
    absent: 9,
    late: 3,
  },
];

export const TEACHER_ATTENDANCE_SUMMARY = {
  percentage: "92.4%",
  present: 144,
  absent: 9,
  late: 3,
  total: 156,
};

export interface TeacherRecentActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: IconName;
  badgeText: string;
  badgeVariant: "success" | "primary" | "warning" | "neutral";
  href: string;
}

export const TEACHER_RECENT_ACTIVITIES: TeacherRecentActivityItem[] = [
  {
    id: "act-1",
    title: "Attendance submitted for Class 8-A",
    detail: "39 Present, 1 Absent, 1 Late recorded for morning Mathematics.",
    time: "28 mins ago",
    icon: "check-circle",
    badgeText: "Submitted",
    badgeVariant: "success",
    href: "/teacher/classes/class-8-a",
  },
  {
    id: "act-2",
    title: "Attendance pending for Class 9-A",
    detail: "01:00 PM Mathematics session roster is ready for marking.",
    time: "Due 01:00 PM",
    icon: "clock",
    badgeText: "Pending",
    badgeVariant: "warning",
    href: "/teacher/attendance?classId=class-9-a",
  },
  {
    id: "act-3",
    title: "New announcement received",
    detail: "Annual Sports Day circular published by School Admin.",
    time: "2 hours ago",
    icon: "megaphone",
    badgeText: "School Notice",
    badgeVariant: "primary",
    href: "/teacher/announcements",
  },
  {
    id: "act-4",
    title: "Student enrollment updated",
    detail: "Devika Rao joined Class 7-B Mathematics section roster.",
    time: "Yesterday",
    icon: "user-plus",
    badgeText: "Roster",
    badgeVariant: "neutral",
    href: "/teacher/students",
  },
];

/* -------------------------------------------------------------------------- */
/*  Scoped Student Roster (ONLY Class 6-A, 7-B, 8-A, 9-A — No Fee Fields)     */
/* -------------------------------------------------------------------------- */

export interface TeacherStudentAttendanceEntry {
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface TeacherStudentItem {
  id: string;
  studentId: string;
  fullName: string;
  classId: "class-6-a" | "class-7-b" | "class-8-a" | "class-9-a";
  className: "Class 6-A" | "Class 7-B" | "Class 8-A" | "Class 9-A";
  section: string;
  rollNumber: string;
  gender: "Male" | "Female";
  guardianName: string;
  guardianPhone: string;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  status: "Active" | "Inactive";
  recentAttendance: TeacherStudentAttendanceEntry[];
}

export const TEACHER_STUDENTS: TeacherStudentItem[] = [
  {
    id: "stu-6a-01",
    studentId: "STU-2026-101",
    fullName: "Aarav Naik",
    classId: "class-6-a",
    className: "Class 6-A",
    section: "A",
    rollNumber: "01",
    gender: "Male",
    guardianName: "Sandeep Naik",
    guardianPhone: "+91 98230 11204",
    attendancePercentage: 96,
    presentDays: 46,
    absentDays: 1,
    lateDays: 1,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "late", remarks: "Bus delay" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-6a-02",
    studentId: "STU-2026-102",
    fullName: "Diya Deshmukh",
    classId: "class-6-a",
    className: "Class 6-A",
    section: "A",
    rollNumber: "02",
    gender: "Female",
    guardianName: "Rohan Deshmukh",
    guardianPhone: "+91 98201 44510",
    attendancePercentage: 98,
    presentDays: 47,
    absentDays: 1,
    lateDays: 0,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "absent", remarks: "Family travel" },
    ],
  },
  {
    id: "stu-6a-03",
    studentId: "STU-2026-103",
    fullName: "Vivaan Kulkarni",
    classId: "class-6-a",
    className: "Class 6-A",
    section: "A",
    rollNumber: "03",
    gender: "Male",
    guardianName: "Mahesh Kulkarni",
    guardianPhone: "+91 98450 22319",
    attendancePercentage: 90,
    presentDays: 43,
    absentDays: 3,
    lateDays: 2,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "late", remarks: "Arrived 10 mins late" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "absent", remarks: "Seasonal fever" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-6a-04",
    studentId: "STU-2026-104",
    fullName: "Ananya Joshi",
    classId: "class-6-a",
    className: "Class 6-A",
    section: "A",
    rollNumber: "04",
    gender: "Female",
    guardianName: "Prakash Joshi",
    guardianPhone: "+91 98112 77823",
    attendancePercentage: 94,
    presentDays: 45,
    absentDays: 2,
    lateDays: 1,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-7b-01",
    studentId: "STU-2026-201",
    fullName: "Reyansh Sharma",
    classId: "class-7-b",
    className: "Class 7-B",
    section: "B",
    rollNumber: "01",
    gender: "Male",
    guardianName: "Amit Sharma",
    guardianPhone: "+91 98901 66542",
    attendancePercentage: 92,
    presentDays: 44,
    absentDays: 3,
    lateDays: 1,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "absent", remarks: "Dental appointment" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-7b-02",
    studentId: "STU-2026-202",
    fullName: "Saanvi Iyer",
    classId: "class-7-b",
    className: "Class 7-B",
    section: "B",
    rollNumber: "02",
    gender: "Female",
    guardianName: "Venkatesh Iyer",
    guardianPhone: "+91 97654 31209",
    attendancePercentage: 96,
    presentDays: 46,
    absentDays: 2,
    lateDays: 0,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-7b-03",
    studentId: "STU-2026-203",
    fullName: "Kabir Menon",
    classId: "class-7-b",
    className: "Class 7-B",
    section: "B",
    rollNumber: "03",
    gender: "Male",
    guardianName: "Suresh Menon",
    guardianPhone: "+91 98220 88914",
    attendancePercentage: 73,
    presentDays: 35,
    absentDays: 10,
    lateDays: 3,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "absent", remarks: "Unwell" },
      { date: "2026-11-12", status: "absent", remarks: "Unwell" },
      { date: "2026-11-11", status: "late" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-7b-04",
    studentId: "STU-2026-204",
    fullName: "Devika Rao",
    classId: "class-7-b",
    className: "Class 7-B",
    section: "B",
    rollNumber: "04",
    gender: "Female",
    guardianName: "Kishore Rao",
    guardianPhone: "+91 98861 42015",
    attendancePercentage: 95,
    presentDays: 19,
    absentDays: 1,
    lateDays: 0,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-8a-01",
    studentId: "STU-2026-301",
    fullName: "Myra Patil",
    classId: "class-8-a",
    className: "Class 8-A",
    section: "A",
    rollNumber: "01",
    gender: "Female",
    guardianName: "Nitin Patil",
    guardianPhone: "+91 99301 55412",
    attendancePercentage: 98,
    presentDays: 47,
    absentDays: 0,
    lateDays: 1,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-8a-02",
    studentId: "STU-2026-302",
    fullName: "Ishaan Verma",
    classId: "class-8-a",
    className: "Class 8-A",
    section: "A",
    rollNumber: "02",
    gender: "Male",
    guardianName: "Rajeev Verma",
    guardianPhone: "+91 98190 33981",
    attendancePercentage: 91,
    presentDays: 44,
    absentDays: 2,
    lateDays: 2,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "late", remarks: "Traffic delay" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-8a-03",
    studentId: "STU-2026-303",
    fullName: "Aadhya Nair",
    classId: "class-8-a",
    className: "Class 8-A",
    section: "A",
    rollNumber: "03",
    gender: "Female",
    guardianName: "Harish Nair",
    guardianPhone: "+91 98402 19874",
    attendancePercentage: 94,
    presentDays: 45,
    absentDays: 2,
    lateDays: 1,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "excused", remarks: "Inter-school debate" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
    ],
  },
  {
    id: "stu-8a-04",
    studentId: "STU-2026-304",
    fullName: "Arjun Gokhale",
    classId: "class-8-a",
    className: "Class 8-A",
    section: "A",
    rollNumber: "04",
    gender: "Male",
    guardianName: "Milind Gokhale",
    guardianPhone: "+91 98211 70432",
    attendancePercentage: 88,
    presentDays: 42,
    absentDays: 4,
    lateDays: 2,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-13", status: "absent", remarks: "Parent note received" },
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "late" },
    ],
  },
  {
    id: "stu-9a-01",
    studentId: "STU-2026-401",
    fullName: "Kavya Hegde",
    classId: "class-9-a",
    className: "Class 9-A",
    section: "A",
    rollNumber: "01",
    gender: "Female",
    guardianName: "Subhash Hegde",
    guardianPhone: "+91 98455 31908",
    attendancePercentage: 95,
    presentDays: 45,
    absentDays: 2,
    lateDays: 1,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
      { date: "2026-11-07", status: "present" },
    ],
  },
  {
    id: "stu-9a-02",
    studentId: "STU-2026-402",
    fullName: "Rohan Bhat",
    classId: "class-9-a",
    className: "Class 9-A",
    section: "A",
    rollNumber: "02",
    gender: "Male",
    guardianName: "Pradeep Bhat",
    guardianPhone: "+91 99002 64120",
    attendancePercentage: 83,
    presentDays: 40,
    absentDays: 6,
    lateDays: 2,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-12", status: "absent", remarks: "Medical leave" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "absent" },
      { date: "2026-11-07", status: "present" },
    ],
  },
  {
    id: "stu-9a-03",
    studentId: "STU-2026-403",
    fullName: "Meera Subramanian",
    classId: "class-9-a",
    className: "Class 9-A",
    section: "A",
    rollNumber: "03",
    gender: "Female",
    guardianName: "Lakshmi Subramanian",
    guardianPhone: "+91 98409 81245",
    attendancePercentage: 96,
    presentDays: 46,
    absentDays: 1,
    lateDays: 1,
    status: "Active",
    recentAttendance: [
      { date: "2026-11-12", status: "present" },
      { date: "2026-11-11", status: "present" },
      { date: "2026-11-10", status: "present" },
      { date: "2026-11-08", status: "present" },
      { date: "2026-11-07", status: "present" },
    ],
  },
  {
    id: "stu-9a-04",
    studentId: "STU-2026-404",
    fullName: "Siddharth Menon",
    classId: "class-9-a",
    className: "Class 9-A",
    section: "A",
    rollNumber: "04",
    gender: "Male",
    guardianName: "Raghu Menon",
    guardianPhone: "+91 98180 51923",
    attendancePercentage: 78,
    presentDays: 37,
    absentDays: 8,
    lateDays: 3,
    status: "Inactive",
    recentAttendance: [
      { date: "2026-11-12", status: "absent", remarks: "Extended leave" },
      { date: "2026-11-11", status: "absent", remarks: "Extended leave" },
      { date: "2026-11-10", status: "late" },
      { date: "2026-11-08", status: "present" },
      { date: "2026-11-07", status: "present" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Teacher-Scoped Announcements                                              */
/* -------------------------------------------------------------------------- */

export type TeacherAudienceOption =
  | "Class 6-A"
  | "Class 7-B"
  | "Class 8-A"
  | "Class 9-A"
  | "All My Classes"
  | "Parents of Assigned Classes";

export const TEACHER_AUDIENCE_OPTIONS: TeacherAudienceOption[] = [
  "Class 6-A",
  "Class 7-B",
  "Class 8-A",
  "Class 9-A",
  "All My Classes",
  "Parents of Assigned Classes",
];

export interface TeacherAnnouncementRecord {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  scope: "School Notice" | "Class Update";
  targetAudience: TeacherAudienceOption | "Entire School" | "Teachers";
  createdBy: string;
  createdByRole: string;
  publishedDate: string;
  attachmentName?: string;
}

export const TEACHER_ANNOUNCEMENTS: TeacherAnnouncementRecord[] = [
  {
    id: "t-ann-101",
    title: "Algebraic Identities Unit Practice Test",
    shortDescription:
      "Class 8-A mathematics revision worksheet and 30-minute practice test scheduled for Monday morning.",
    content:
      "Dear Class 8-A Students,\n\nPlease complete Exercise 9.3 (Questions 1 to 12) before Monday's morning class. We will conduct a short 30-minute practice check covering standard algebraic identities and factorization.\n\nBring your graph notebooks and geometry box to Room 301.",
    status: "Published",
    priority: "Important",
    scope: "Class Update",
    targetAudience: "Class 8-A",
    createdBy: "Priya Nair",
    createdByRole: "Teacher",
    publishedDate: "2026-11-13",
    attachmentName: "Class_8A_Algebra_Practice_Sheet.pdf",
  },
  {
    id: "t-ann-102",
    title: "Annual Sports Day",
    shortDescription:
      "Track and field events, house march-past, and prize distribution ceremony at the main sports complex on November 28.",
    content:
      "Dear Faculty, Students, and Parents,\n\nOur Annual Sports Day for the 2026-2027 session will be held on Saturday, November 28, 2026, starting at 8:30 AM at the Main School Ground. Homeroom and class teachers are requested to coordinate house reporting by 7:45 AM.",
    status: "Published",
    priority: "Important",
    scope: "School Notice",
    targetAudience: "Entire School",
    createdBy: "Arjun Mehta",
    createdByRole: "School Admin",
    publishedDate: "2026-11-12",
    attachmentName: "Annual_Sports_Day_Schedule_2026.pdf",
  },
  {
    id: "t-ann-103",
    title: "Vedic Math Club & Olympiad Prep Session",
    shortDescription:
      "Optional quantitative reasoning and mental math workshop for interested students across Classes 6-A, 7-B, 8-A, and 9-A.",
    content:
      "Hello everyone,\n\nThis Thursday from 2:15 PM to 3:15 PM in Room 301, we will hold an interactive Vedic Math & Quantitative Reasoning session focusing on speed arithmetic and logic puzzles.\n\nStudents from all my assigned Mathematics sections are welcome to attend.",
    status: "Published",
    priority: "Normal",
    scope: "Class Update",
    targetAudience: "All My Classes",
    createdBy: "Priya Nair",
    createdByRole: "Teacher",
    publishedDate: "2026-11-11",
  },
  {
    id: "t-ann-104",
    title: "Parent-Teacher Meeting — Term 1 Progress",
    shortDescription:
      "Term 1 academic progress review and attendance feedback sessions scheduled for Classes 6 to 10 this Saturday.",
    content:
      "Dear Parents & Teachers,\n\nThe Term 1 Parent-Teacher Meeting will take place this Saturday from 9:00 AM to 1:30 PM. Class Teachers for Class 6-A and Class 8-A will share term attendance summaries and subject progress cards in their respective homerooms.",
    status: "Published",
    priority: "Urgent",
    scope: "School Notice",
    targetAudience: "Parents of Assigned Classes",
    createdBy: "Arjun Mehta",
    createdByRole: "School Admin",
    publishedDate: "2026-11-10",
  },
  {
    id: "t-ann-105",
    title: "Coordinate Geometry Graph Lab Reminder",
    shortDescription:
      "Class 9-A students must bring millimeter graph sheets and ruler sets for Friday's plotting lab.",
    content:
      "Dear Class 9-A,\n\nWe will complete the Cartesian plane and linear graph plotting activity during tomorrow's 01:00 PM period in Room 305. Please ensure you carry two millimeter graph sheets and a sharpened pencil.",
    status: "Scheduled",
    priority: "Normal",
    scope: "Class Update",
    targetAudience: "Class 9-A",
    createdBy: "Priya Nair",
    createdByRole: "Teacher",
    publishedDate: "2026-11-14",
  },
];

const TEACHER_ANNOUNCEMENTS_KEY = "edusync_teacher_announcements_v1";

export function getStoredTeacherAnnouncements(): TeacherAnnouncementRecord[] {
  if (typeof window === "undefined") {
    return TEACHER_ANNOUNCEMENTS;
  }
  let baseList: TeacherAnnouncementRecord[] = TEACHER_ANNOUNCEMENTS;
  try {
    const raw = window.sessionStorage.getItem(TEACHER_ANNOUNCEMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TeacherAnnouncementRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        baseList = parsed;
      }
    }
  } catch {
    baseList = TEACHER_ANNOUNCEMENTS;
  }

  const initialIds = new Set(INITIAL_ANNOUNCEMENTS.map((a) => a.id));
  const assignedClassNames = new Set(
    TEACHER_ASSIGNED_CLASSES.map((c) => c.name),
  );
  const existingSyncedIds = new Set(baseList.map((t) => t.id));
  const syncedFromAdmin: TeacherAnnouncementRecord[] = getStoredAnnouncements()
    .filter((rec) => {
      if (rec.status !== "Published") return false;
      if (initialIds.has(rec.id)) return false;
      if (existingSyncedIds.has(`synced-${rec.id}`)) return false;
      const targetsTeachers =
        rec.audiences.includes("Entire School") ||
        rec.audiences.includes("Teachers");
      const targetsAssignedClass =
        rec.audiences.includes("Specific Class") &&
        Boolean(rec.specificClass && assignedClassNames.has(rec.specificClass));
      return targetsTeachers || targetsAssignedClass;
    })
    .map((rec) => {
      const resolvedTarget: TeacherAnnouncementRecord["targetAudience"] =
        rec.specificClass &&
        (TEACHER_AUDIENCE_OPTIONS as readonly string[]).includes(
          rec.specificClass,
        )
          ? (rec.specificClass as TeacherAudienceOption)
          : rec.audiences.includes("Teachers")
            ? "Teachers"
            : "Entire School";

      return {
        id: `synced-${rec.id}`,
        title: rec.title,
        shortDescription: rec.shortDescription,
        content: rec.content,
        status: rec.status,
        priority: rec.priority,
        scope: rec.specificClass ? "Class Update" : "School Notice",
        targetAudience: resolvedTarget,
        createdBy: rec.createdBy,
        createdByRole: rec.createdByRole,
        publishedDate: rec.publishedDate,
        attachmentName: rec.attachmentName,
      };
    });

  return [...syncedFromAdmin, ...baseList];
}

export function saveStoredTeacherAnnouncements(
  items: TeacherAnnouncementRecord[],
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      TEACHER_ANNOUNCEMENTS_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}

/* -------------------------------------------------------------------------- */
/*  Teacher Notifications (Compatible with @/components/notifications)        */
/* -------------------------------------------------------------------------- */

export const TEACHER_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "t-notif-101",
    title: "Attendance pending for Class 9-A",
    description:
      "Today's 01:00 PM Mathematics session attendance for Class 9-A (36 students) has not been submitted yet.",
    timestamp: "15 mins ago",
    category: "Attendance",
    read: false,
    targetHref: "/teacher/attendance?classId=class-9-a",
  },
  {
    id: "t-notif-102",
    title: "New school announcement published",
    description:
      "School Admin published 'Annual Sports Day' circular for Students and Parents with house reporting instructions.",
    timestamp: "1 hour ago",
    category: "Announcement",
    read: false,
    targetHref: "/teacher/announcements",
  },
  {
    id: "t-notif-103",
    title: "Attendance submitted for Class 8-A",
    description:
      "Morning Mathematics attendance recorded for Class 8-A: 39 Present, 1 Absent, 1 Late.",
    timestamp: "2 hours ago",
    category: "Attendance",
    read: true,
    targetHref: "/teacher/classes/class-8-a",
  },
  {
    id: "t-notif-104",
    title: "Student enrollment updated in Class 7-B",
    description:
      "Devika Rao (STU-2026-204) was added to the Class 7-B Mathematics roster with verified guardian contact.",
    timestamp: "Yesterday, 3:40 PM",
    category: "Student",
    read: true,
    targetHref: "/teacher/students/stu-7b-04",
  },
  {
    id: "t-notif-105",
    title: "Low attendance notice for Class 7-B",
    description:
      "Kabir Menon (STU-2026-203) is currently at 73% attendance after two consecutive sick-leave absences.",
    timestamp: "Nov 11, 11:20 AM",
    category: "Attendance",
    read: true,
    targetHref: "/teacher/students/stu-7b-03",
  },
  {
    id: "t-notif-106",
    title: "Term 1 PTM room schedule confirmed",
    description:
      "Class Teacher homerooms Room 204 (Class 6-A) and Room 301 (Class 8-A) are assigned for Saturday PTM.",
    timestamp: "Nov 10, 9:30 AM",
    category: "System",
    read: true,
    targetHref: "/teacher/profile",
  },
];

const TEACHER_NOTIFICATIONS_KEY = "edusync_teacher_notifications_v1";

export function getStoredTeacherNotifications(): NotificationRecord[] {
  if (typeof window === "undefined") {
    return TEACHER_NOTIFICATIONS;
  }
  try {
    const raw = window.sessionStorage.getItem(TEACHER_NOTIFICATIONS_KEY);
    if (!raw) return TEACHER_NOTIFICATIONS;
    const parsed = JSON.parse(raw) as NotificationRecord[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : TEACHER_NOTIFICATIONS;
  } catch {
    return TEACHER_NOTIFICATIONS;
  }
}

export function saveStoredTeacherNotifications(
  items: NotificationRecord[],
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      TEACHER_NOTIFICATIONS_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}

/* -------------------------------------------------------------------------- */
/*  Teacher Attendance Sessions & Per-Class Rosters                           */
/* -------------------------------------------------------------------------- */

export interface TeacherAttendanceSessionRecord extends AttendanceSessionRecord {
  subject: string;
}

function buildEntriesForClass(
  classId: TeacherStudentItem["classId"],
  sessionKey: string,
  statusOverrides: Record<string, { status: AttendanceEntryRecord["status"]; remarks?: string }> = {},
  defaultStatus: AttendanceEntryRecord["status"] = "present",
): AttendanceEntryRecord[] {
  const students = TEACHER_STUDENTS.filter((s) => s.classId === classId);
  return students.map((student) => {
    const override = statusOverrides[student.id];
    return {
      attendanceId: `${sessionKey}-${student.id}`,
      studentId: student.id,
      studentCode: student.studentId,
      fullName: student.fullName,
      status: override ? override.status : defaultStatus,
      remarks: override?.remarks ?? "",
    };
  });
}

export function getTeacherClassRosterEntries(
  classId: TeacherStudentItem["classId"],
  date: string,
): AttendanceEntryRecord[] {
  return buildEntriesForClass(classId, `${classId}-${date}`, {}, "unmarked");
}

export const TEACHER_CLASS_ATTENDANCE_RECORDS: TeacherAttendanceSessionRecord[] =
  [
    {
      id: "t-att-20261113-6a",
      classId: "class-6-a",
      className: "Class 6-A",
      section: "A",
      subject: "Mathematics",
      date: "2026-11-13",
      totalStudents: 40,
      presentCount: 38,
      absentCount: 1,
      lateCount: 1,
      excusedCount: 0,
      attendancePercentage: 95.0,
      submittedBy: "Priya Nair",
      submittedAt: "09:12 AM",
      status: "Submitted",
      entries: buildEntriesForClass("class-6-a", "t-att-20261113-6a", {
        "stu-6a-03": { status: "late", remarks: "Arrived 10 mins late" },
      }),
    },
    {
      id: "t-att-20261113-7b",
      classId: "class-7-b",
      className: "Class 7-B",
      section: "B",
      subject: "Mathematics",
      date: "2026-11-13",
      totalStudents: 39,
      presentCount: 36,
      absentCount: 2,
      lateCount: 1,
      excusedCount: 0,
      attendancePercentage: 92.3,
      submittedBy: "Priya Nair",
      submittedAt: "10:08 AM",
      status: "Submitted",
      entries: buildEntriesForClass("class-7-b", "t-att-20261113-7b", {
        "stu-7b-03": { status: "absent", remarks: "Unwell" },
      }),
    },
    {
      id: "t-att-20261113-8a",
      classId: "class-8-a",
      className: "Class 8-A",
      section: "A",
      subject: "Mathematics",
      date: "2026-11-13",
      totalStudents: 41,
      presentCount: 39,
      absentCount: 1,
      lateCount: 1,
      excusedCount: 0,
      attendancePercentage: 95.1,
      submittedBy: "Priya Nair",
      submittedAt: "11:38 AM",
      status: "Submitted",
      entries: buildEntriesForClass("class-8-a", "t-att-20261113-8a", {
        "stu-8a-04": { status: "absent", remarks: "Parent note received" },
      }),
    },
    {
      id: "t-att-20261113-9a",
      classId: "class-9-a",
      className: "Class 9-A",
      section: "A",
      subject: "Mathematics",
      date: "2026-11-13",
      totalStudents: 36,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      attendancePercentage: 0,
      submittedBy: "Priya Nair",
      submittedAt: "Pending",
      status: "Pending",
      entries: buildEntriesForClass(
        "class-9-a",
        "t-att-20261113-9a",
        {},
        "unmarked",
      ),
    },
    {
      id: "t-att-20261112-9a",
      classId: "class-9-a",
      className: "Class 9-A",
      section: "A",
      subject: "Mathematics",
      date: "2026-11-12",
      totalStudents: 36,
      presentCount: 32,
      absentCount: 3,
      lateCount: 1,
      excusedCount: 0,
      attendancePercentage: 88.9,
      submittedBy: "Priya Nair",
      submittedAt: "01:14 PM",
      status: "Submitted",
      entries: buildEntriesForClass("class-9-a", "t-att-20261112-9a", {
        "stu-9a-02": { status: "absent", remarks: "Medical leave" },
        "stu-9a-04": { status: "absent", remarks: "Extended leave" },
      }),
    },
    {
      id: "t-att-20261112-8a",
      classId: "class-8-a",
      className: "Class 8-A",
      section: "A",
      subject: "Mathematics",
      date: "2026-11-12",
      totalStudents: 41,
      presentCount: 38,
      absentCount: 2,
      lateCount: 1,
      excusedCount: 0,
      attendancePercentage: 92.7,
      submittedBy: "Priya Nair",
      submittedAt: "11:40 AM",
      status: "Submitted",
      entries: buildEntriesForClass("class-8-a", "t-att-20261112-8a", {
        "stu-8a-02": { status: "late", remarks: "Traffic delay" },
      }),
    },
    {
      id: "t-att-20261112-6a",
      classId: "class-6-a",
      className: "Class 6-A",
      section: "A",
      subject: "Mathematics",
      date: "2026-11-12",
      totalStudents: 40,
      presentCount: 37,
      absentCount: 2,
      lateCount: 1,
      excusedCount: 0,
      attendancePercentage: 92.5,
      submittedBy: "Priya Nair",
      submittedAt: "09:15 AM",
      status: "Submitted",
      entries: buildEntriesForClass("class-6-a", "t-att-20261112-6a"),
    },
    {
      id: "t-att-20261112-7b",
      classId: "class-7-b",
      className: "Class 7-B",
      section: "B",
      subject: "Mathematics",
      date: "2026-11-12",
      totalStudents: 39,
      presentCount: 35,
      absentCount: 3,
      lateCount: 1,
      excusedCount: 0,
      attendancePercentage: 89.7,
      submittedBy: "Priya Nair",
      submittedAt: "10:11 AM",
      status: "Submitted",
      entries: buildEntriesForClass("class-7-b", "t-att-20261112-7b", {
        "stu-7b-03": { status: "absent", remarks: "Unwell" },
      }),
    },
  ];

const TEACHER_ATTENDANCE_KEY = "edusync_teacher_attendance_v1";

export function getStoredTeacherAttendance(): TeacherAttendanceSessionRecord[] {
  if (typeof window === "undefined") {
    return TEACHER_CLASS_ATTENDANCE_RECORDS;
  }
  try {
    const raw = window.sessionStorage.getItem(TEACHER_ATTENDANCE_KEY);
    if (!raw) return TEACHER_CLASS_ATTENDANCE_RECORDS;
    const parsed = JSON.parse(raw) as TeacherAttendanceSessionRecord[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : TEACHER_CLASS_ATTENDANCE_RECORDS;
  } catch {
    return TEACHER_CLASS_ATTENDANCE_RECORDS;
  }
}

export function saveStoredTeacherAttendance(
  items: TeacherAttendanceSessionRecord[],
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      TEACHER_ATTENDANCE_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}
