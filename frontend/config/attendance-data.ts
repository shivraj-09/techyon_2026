/*
 * ============================================================================
 * EduSync — Stage 4: Attendance Management Data & Reference API Contracts
 * ============================================================================
 *
 * Structure designed for future integration with backend endpoints:
 * - GET   /schools/{school_id}/classes/{class_id}/roster
 * - GET   /schools/{school_id}/classes/{class_id}/attendance
 * - POST  /schools/{school_id}/classes/{class_id}/attendance      (Batch attendance submission)
 * - PATCH /schools/{school_id}/attendance/{attendance_id}         (Single attendance status update)
 *
 * Supported attendance statuses:
 * - "present"
 * - "absent"
 * - "late"
 * - "excused"
 *
 * Note: Reference contracts only. All state is local mock data (no API calls).
 * ============================================================================
 */

export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type UnmarkedOrStatus = AttendanceStatus | "unmarked";

export interface AttendanceStatCardItem {
  id: string;
  title: string;
  countLabel: string;
  count: number;
  percentage: string;
  status: AttendanceStatus;
}

export const ATTENDANCE_OVERVIEW_STATS: AttendanceStatCardItem[] = [
  {
    id: "present-today",
    title: "Present Today",
    countLabel: "1,180 students",
    count: 1180,
    percentage: "94.6%",
    status: "present",
  },
  {
    id: "absent-today",
    title: "Absent Today",
    countLabel: "45 students",
    count: 45,
    percentage: "3.6%",
    status: "absent",
  },
  {
    id: "late-arrivals",
    title: "Late Arrivals",
    countLabel: "15 students",
    count: 15,
    percentage: "1.2%",
    status: "late",
  },
  {
    id: "excused-today",
    title: "Excused",
    countLabel: "8 students",
    count: 8,
    percentage: "0.6%",
    status: "excused",
  },
];

export const ATTENDANCE_STATUS_META: Record<
  AttendanceStatus,
  {
    label: string;
    shortLabel: string;
    badgeVariant: "success" | "danger" | "warning" | "primary";
    color: string;
  }
> = {
  present: {
    label: "Present",
    shortLabel: "P",
    badgeVariant: "success",
    color: "#16a34a",
  },
  absent: {
    label: "Absent",
    shortLabel: "A",
    badgeVariant: "danger",
    color: "#dc2626",
  },
  late: {
    label: "Late",
    shortLabel: "L",
    badgeVariant: "warning",
    color: "#d97706",
  },
  excused: {
    label: "Excused",
    shortLabel: "E",
    badgeVariant: "primary",
    color: "#0284c7",
  },
};

export interface AttendanceClassOption {
  id: string;
  name: string;
  grade: string;
  section: string;
  totalStudents: number;
  classTeacher: string;
}

export const ATTENDANCE_CLASSES: AttendanceClassOption[] = [
  {
    id: "class-6-a",
    name: "Class 6-A",
    grade: "Class 6",
    section: "A",
    totalStudents: 42,
    classTeacher: "Ananya Iyer",
  },
  {
    id: "class-6-b",
    name: "Class 6-B",
    grade: "Class 6",
    section: "B",
    totalStudents: 38,
    classTeacher: "Rajesh Sharma",
  },
  {
    id: "class-7-a",
    name: "Class 7-A",
    grade: "Class 7",
    section: "A",
    totalStudents: 38,
    classTeacher: "Kavita Menon",
  },
  {
    id: "class-7-b",
    name: "Class 7-B",
    grade: "Class 7",
    section: "B",
    totalStudents: 40,
    classTeacher: "Suresh Patil",
  },
  {
    id: "class-8-a",
    name: "Class 8-A",
    grade: "Class 8",
    section: "A",
    totalStudents: 45,
    classTeacher: "Priya Nair",
  },
  {
    id: "class-8-b",
    name: "Class 8-B",
    grade: "Class 8",
    section: "B",
    totalStudents: 41,
    classTeacher: "Deepak Verma",
  },
  {
    id: "class-9-a",
    name: "Class 9-A",
    grade: "Class 9",
    section: "A",
    totalStudents: 40,
    classTeacher: "Meera Krishnan",
  },
  {
    id: "class-10-a",
    name: "Class 10-A",
    grade: "Class 10",
    section: "A",
    totalStudents: 36,
    classTeacher: "Vikram Kulkarni",
  },
  {
    id: "class-11-a",
    name: "Class 11-A (Empty Roster)",
    grade: "Class 11",
    section: "A",
    totalStudents: 0,
    classTeacher: "Unassigned",
  },
];

export interface AttendanceRosterStudent {
  studentId: string;
  studentCode: string;
  fullName: string;
  classId: string;
  className: string;
  section: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
}

export interface AttendanceEntryRecord {
  attendanceId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  status: UnmarkedOrStatus;
  remarks: string;
}

export interface AttendanceSessionRecord {
  id: string;
  classId: string;
  className: string;
  section: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  submittedBy: string;
  submittedAt: string;
  status: "Submitted" | "Pending";
  entries: AttendanceEntryRecord[];
}

const BASE_STUDENT_NAMES: Array<{
  name: string;
  gender: "Male" | "Female";
  guardian: string;
  phone: string;
}> = [
  {
    name: "Aarav Naik",
    gender: "Male",
    guardian: "Sandeep Naik",
    phone: "+91 98230 11204",
  },
  {
    name: "Diya Deshmukh",
    gender: "Female",
    guardian: "Rohan Deshmukh",
    phone: "+91 98201 44510",
  },
  {
    name: "Vivaan Kulkarni",
    gender: "Male",
    guardian: "Mahesh Kulkarni",
    phone: "+91 98450 22319",
  },
  {
    name: "Ananya Joshi",
    gender: "Female",
    guardian: "Prakash Joshi",
    phone: "+91 98112 77823",
  },
  {
    name: "Reyansh Sharma",
    gender: "Male",
    guardian: "Amit Sharma",
    phone: "+91 98901 66542",
  },
  {
    name: "Saanvi Iyer",
    gender: "Female",
    guardian: "Venkatesh Iyer",
    phone: "+91 97654 31209",
  },
  {
    name: "Kabir Menon",
    gender: "Male",
    guardian: "Suresh Menon",
    phone: "+91 98220 88914",
  },
  {
    name: "Myra Patil",
    gender: "Female",
    guardian: "Nitin Patil",
    phone: "+91 99301 55412",
  },
  {
    name: "Ishaan Verma",
    gender: "Male",
    guardian: "Rajeev Verma",
    phone: "+91 98190 33981",
  },
  {
    name: "Aadhya Nair",
    gender: "Female",
    guardian: "Harish Nair",
    phone: "+91 98402 19874",
  },
  {
    name: "Arjun Rao",
    gender: "Male",
    guardian: "Kishore Rao",
    phone: "+91 98861 42015",
  },
  {
    name: "Kavya Gokhale",
    gender: "Female",
    guardian: "Milind Gokhale",
    phone: "+91 98234 90811",
  },
];

export function getRosterForClass(classId: string): AttendanceRosterStudent[] {
  if (!classId || classId === "class-11-a") {
    return [];
  }

  const classMeta = ATTENDANCE_CLASSES.find((c) => c.id === classId) || {
    id: classId,
    name: "Class 8-A",
    grade: "Class 8",
    section: "A",
    totalStudents: 12,
    classTeacher: "Priya Nair",
  };

  const prefix = classMeta.name
    .replace("Class ", "")
    .replace("-", "")
    .toUpperCase();

  return BASE_STUDENT_NAMES.map((student, index) => {
    const num = String(index + 1).padStart(3, "0");
    return {
      studentId: `${classId}-stu-${index + 1}`,
      studentCode: `STU-${prefix}-${num}`,
      fullName: student.name,
      classId: classMeta.id,
      className: classMeta.name,
      section: classMeta.section,
      gender: student.gender,
      guardianName: student.guardian,
      guardianPhone: student.phone,
    };
  });
}

function buildEntriesForSession(
  classId: string,
  sessionId: string,
  absentIndices: number[],
  lateIndices: number[],
  excusedIndices: number[],
): AttendanceEntryRecord[] {
  const roster = getRosterForClass(classId);
  return roster.map((student, idx) => {
    let status: AttendanceStatus = "present";
    let remarks = "";

    if (absentIndices.includes(idx)) {
      status = "absent";
      remarks = "Parent notified via SMS";
    } else if (lateIndices.includes(idx)) {
      status = "late";
      remarks = "Arrived 15 mins after assembly";
    } else if (excusedIndices.includes(idx)) {
      status = "excused";
      remarks = "Medical leave approved";
    }

    return {
      attendanceId: `${sessionId}-att-${idx + 1}`,
      studentId: student.studentId,
      studentCode: student.studentCode,
      fullName: student.fullName,
      status,
      remarks,
    };
  });
}

export const INITIAL_ATTENDANCE_SESSIONS: AttendanceSessionRecord[] = [
  {
    id: "att-session-1",
    classId: "class-6-a",
    className: "Class 6-A",
    section: "A",
    date: "2026-11-14",
    totalStudents: 42,
    presentCount: 40,
    absentCount: 1,
    lateCount: 1,
    excusedCount: 0,
    attendancePercentage: 95.2,
    submittedBy: "Ananya Iyer",
    submittedAt: "08:35 AM",
    status: "Submitted",
    entries: buildEntriesForSession("class-6-a", "att-session-1", [3], [7], []),
  },
  {
    id: "att-session-2",
    classId: "class-7-a",
    className: "Class 7-A",
    section: "A",
    date: "2026-11-14",
    totalStudents: 38,
    presentCount: 35,
    absentCount: 2,
    lateCount: 1,
    excusedCount: 0,
    attendancePercentage: 92.1,
    submittedBy: "Kavita Menon",
    submittedAt: "08:40 AM",
    status: "Submitted",
    entries: buildEntriesForSession(
      "class-7-a",
      "att-session-2",
      [1, 8],
      [4],
      [],
    ),
  },
  {
    id: "att-session-3",
    classId: "class-8-a",
    className: "Class 8-A",
    section: "A",
    date: "2026-11-14",
    totalStudents: 45,
    presentCount: 43,
    absentCount: 1,
    lateCount: 0,
    excusedCount: 1,
    attendancePercentage: 95.6,
    submittedBy: "Priya Nair",
    submittedAt: "08:45 AM",
    status: "Submitted",
    entries: buildEntriesForSession("class-8-a", "att-session-3", [5], [], [9]),
  },
  {
    id: "att-session-4",
    classId: "class-9-a",
    className: "Class 9-A",
    section: "A",
    date: "2026-11-14",
    totalStudents: 40,
    presentCount: 36,
    absentCount: 3,
    lateCount: 1,
    excusedCount: 0,
    attendancePercentage: 90.0,
    submittedBy: "Meera Krishnan",
    submittedAt: "08:50 AM",
    status: "Submitted",
    entries: buildEntriesForSession(
      "class-9-a",
      "att-session-4",
      [2, 6, 10],
      [4],
      [],
    ),
  },
  {
    id: "att-session-5",
    classId: "class-10-a",
    className: "Class 10-A",
    section: "A",
    date: "2026-11-14",
    totalStudents: 36,
    presentCount: 35,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 1,
    attendancePercentage: 97.2,
    submittedBy: "Vikram Kulkarni",
    submittedAt: "08:30 AM",
    status: "Submitted",
    entries: buildEntriesForSession("class-10-a", "att-session-5", [], [], [2]),
  },
  {
    id: "att-session-6",
    classId: "class-6-b",
    className: "Class 6-B",
    section: "B",
    date: "2026-11-14",
    totalStudents: 38,
    presentCount: 36,
    absentCount: 1,
    lateCount: 1,
    excusedCount: 0,
    attendancePercentage: 94.7,
    submittedBy: "Rajesh Sharma",
    submittedAt: "08:42 AM",
    status: "Submitted",
    entries: buildEntriesForSession("class-6-b", "att-session-6", [4], [8], []),
  },
  {
    id: "att-session-7",
    classId: "class-8-a",
    className: "Class 8-A",
    section: "A",
    date: "2026-11-13",
    totalStudents: 45,
    presentCount: 42,
    absentCount: 2,
    lateCount: 1,
    excusedCount: 0,
    attendancePercentage: 93.3,
    submittedBy: "Priya Nair",
    submittedAt: "08:44 AM",
    status: "Submitted",
    entries: buildEntriesForSession(
      "class-8-a",
      "att-session-7",
      [1, 7],
      [3],
      [],
    ),
  },
  {
    id: "att-session-8",
    classId: "class-9-a",
    className: "Class 9-A",
    section: "A",
    date: "2026-11-13",
    totalStudents: 40,
    presentCount: 35,
    absentCount: 4,
    lateCount: 1,
    excusedCount: 0,
    attendancePercentage: 87.5,
    submittedBy: "Meera Krishnan",
    submittedAt: "08:52 AM",
    status: "Submitted",
    entries: buildEntriesForSession(
      "class-9-a",
      "att-session-8",
      [0, 2, 6, 9],
      [5],
      [],
    ),
  },
  {
    id: "att-session-9",
    classId: "class-10-a",
    className: "Class 10-A",
    section: "A",
    date: "2026-11-13",
    totalStudents: 36,
    presentCount: 35,
    absentCount: 1,
    lateCount: 0,
    excusedCount: 0,
    attendancePercentage: 97.2,
    submittedBy: "Vikram Kulkarni",
    submittedAt: "08:32 AM",
    status: "Submitted",
    entries: buildEntriesForSession("class-10-a", "att-session-9", [6], [], []),
  },
  {
    id: "att-session-10",
    classId: "class-7-b",
    className: "Class 7-B",
    section: "B",
    date: "2026-11-12",
    totalStudents: 40,
    presentCount: 38,
    absentCount: 1,
    lateCount: 0,
    excusedCount: 1,
    attendancePercentage: 95.0,
    submittedBy: "Suresh Patil",
    submittedAt: "08:38 AM",
    status: "Submitted",
    entries: buildEntriesForSession(
      "class-7-b",
      "att-session-10",
      [3],
      [],
      [11],
    ),
  },
  {
    id: "att-session-11",
    classId: "class-8-b",
    className: "Class 8-B",
    section: "B",
    date: "2026-11-12",
    totalStudents: 41,
    presentCount: 39,
    absentCount: 1,
    lateCount: 1,
    excusedCount: 0,
    attendancePercentage: 95.1,
    submittedBy: "Deepak Verma",
    submittedAt: "08:47 AM",
    status: "Submitted",
    entries: buildEntriesForSession("class-8-b", "att-session-11", [2], [9], []),
  },
  {
    id: "att-session-12",
    classId: "class-6-a",
    className: "Class 6-A",
    section: "A",
    date: "2026-11-11",
    totalStudents: 42,
    presentCount: 41,
    absentCount: 1,
    lateCount: 0,
    excusedCount: 0,
    attendancePercentage: 97.6,
    submittedBy: "Ananya Iyer",
    submittedAt: "08:36 AM",
    status: "Submitted",
    entries: buildEntriesForSession("class-6-a", "att-session-12", [5], [], []),
  },
];

export interface AttendanceTrend30DayPoint {
  dayLabel: string;
  date: string;
  percentage: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export const ATTENDANCE_30D_TREND: AttendanceTrend30DayPoint[] = [
  { dayLabel: "16 Oct", date: "2026-10-16", percentage: 93.4, present: 1166, absent: 54, late: 18, excused: 10 },
  { dayLabel: "17 Oct", date: "2026-10-17", percentage: 92.8, present: 1158, absent: 60, late: 20, excused: 10 },
  { dayLabel: "19 Oct", date: "2026-10-19", percentage: 94.1, present: 1174, absent: 48, late: 16, excused: 10 },
  { dayLabel: "20 Oct", date: "2026-10-20", percentage: 94.8, present: 1183, absent: 42, late: 15, excused: 8 },
  { dayLabel: "21 Oct", date: "2026-10-21", percentage: 93.9, present: 1172, absent: 50, late: 17, excused: 9 },
  { dayLabel: "22 Oct", date: "2026-10-22", percentage: 95.2, present: 1188, absent: 38, late: 14, excused: 8 },
  { dayLabel: "23 Oct", date: "2026-10-23", percentage: 94.5, present: 1179, absent: 44, late: 16, excused: 9 },
  { dayLabel: "24 Oct", date: "2026-10-24", percentage: 91.6, present: 1143, absent: 72, late: 22, excused: 11 },
  { dayLabel: "26 Oct", date: "2026-10-26", percentage: 93.7, present: 1169, absent: 52, late: 18, excused: 9 },
  { dayLabel: "27 Oct", date: "2026-10-27", percentage: 94.4, present: 1178, absent: 46, late: 15, excused: 9 },
  { dayLabel: "28 Oct", date: "2026-10-28", percentage: 95.0, present: 1186, absent: 40, late: 14, excused: 8 },
  { dayLabel: "29 Oct", date: "2026-10-29", percentage: 94.2, present: 1176, absent: 48, late: 15, excused: 9 },
  { dayLabel: "30 Oct", date: "2026-10-30", percentage: 93.5, present: 1167, absent: 55, late: 17, excused: 9 },
  { dayLabel: "31 Oct", date: "2026-10-31", percentage: 92.1, present: 1149, absent: 68, late: 20, excused: 11 },
  { dayLabel: "02 Nov", date: "2026-11-02", percentage: 94.0, present: 1173, absent: 49, late: 17, excused: 9 },
  { dayLabel: "03 Nov", date: "2026-11-03", percentage: 94.9, present: 1184, absent: 41, late: 15, excused: 8 },
  { dayLabel: "04 Nov", date: "2026-11-04", percentage: 95.4, present: 1191, absent: 36, late: 13, excused: 8 },
  { dayLabel: "05 Nov", date: "2026-11-05", percentage: 94.6, present: 1181, absent: 44, late: 15, excused: 8 },
  { dayLabel: "06 Nov", date: "2026-11-06", percentage: 93.8, present: 1171, absent: 51, late: 17, excused: 9 },
  { dayLabel: "07 Nov", date: "2026-11-07", percentage: 93.2, present: 1163, absent: 56, late: 19, excused: 10 },
  { dayLabel: "08 Nov", date: "2026-11-08", percentage: 91.8, present: 1146, absent: 70, late: 21, excused: 11 },
  { dayLabel: "09 Nov", date: "2026-11-09", percentage: 93.9, present: 1172, absent: 50, late: 17, excused: 9 },
  { dayLabel: "10 Nov", date: "2026-11-10", percentage: 94.0, present: 1173, absent: 48, late: 18, excused: 9 },
  { dayLabel: "11 Nov", date: "2026-11-11", percentage: 95.1, present: 1187, absent: 39, late: 14, excused: 8 },
  { dayLabel: "12 Nov", date: "2026-11-12", percentage: 93.6, present: 1168, absent: 52, late: 19, excused: 9 },
  { dayLabel: "13 Nov", date: "2026-11-13", percentage: 92.5, present: 1154, absent: 63, late: 21, excused: 10 },
  { dayLabel: "14 Nov", date: "2026-11-14", percentage: 94.6, present: 1180, absent: 45, late: 15, excused: 8 },
];

export interface ClassAttendanceBarItem {
  classId: string;
  className: string;
  percentage: number;
  present: number;
  total: number;
}

export const CLASS_ATTENDANCE_COMPARISON: ClassAttendanceBarItem[] = [
  { classId: "class-10-a", className: "Class 10-A", percentage: 97.2, present: 35, total: 36 },
  { classId: "class-8-a", className: "Class 8-A", percentage: 95.6, present: 43, total: 45 },
  { classId: "class-6-a", className: "Class 6-A", percentage: 95.2, present: 40, total: 42 },
  { classId: "class-8-b", className: "Class 8-B", percentage: 95.1, present: 39, total: 41 },
  { classId: "class-7-b", className: "Class 7-B", percentage: 95.0, present: 38, total: 40 },
  { classId: "class-6-b", className: "Class 6-B", percentage: 94.7, present: 36, total: 38 },
  { classId: "class-7-a", className: "Class 7-A", percentage: 92.1, present: 35, total: 38 },
  { classId: "class-9-a", className: "Class 9-A", percentage: 90.0, present: 36, total: 40 },
];

export const ATTENDANCE_DISTRIBUTION_DATA = {
  present: { count: 1180, percentage: 94.6, color: "#16a34a", label: "Present" },
  absent: { count: 45, percentage: 3.6, color: "#dc2626", label: "Absent" },
  late: { count: 15, percentage: 1.2, color: "#d97706", label: "Late" },
  excused: { count: 8, percentage: 0.6, color: "#0284c7", label: "Excused" },
};

export interface LowAttendanceStudentItem {
  id: string;
  studentId: string;
  fullName: string;
  className: string;
  attendancePercentage: number;
  daysAbsent: number;
  totalDays: number;
  status: "Critical" | "Warning";
  guardianPhone: string;
}

export const LOW_ATTENDANCE_STUDENTS: LowAttendanceStudentItem[] = [
  {
    id: "low-1",
    studentId: "STU-2026-014",
    fullName: "RohanSawant",
    className: "Class 9-A",
    attendancePercentage: 64.5,
    daysAbsent: 22,
    totalDays: 62,
    status: "Critical",
    guardianPhone: "+91 98231 44012",
  },
  {
    id: "low-2",
    studentId: "STU-2026-029",
    fullName: "Tanvi Chavan",
    className: "Class 8-B",
    attendancePercentage: 67.7,
    daysAbsent: 20,
    totalDays: 62,
    status: "Critical",
    guardianPhone: "+91 98204 81920",
  },
  {
    id: "low-3",
    studentId: "STU-2026-042",
    fullName: "Aditya Bhosale",
    className: "Class 9-A",
    attendancePercentage: 69.4,
    daysAbsent: 19,
    totalDays: 62,
    status: "Critical",
    guardianPhone: "+91 98902 55318",
  },
  {
    id: "low-4",
    studentId: "STU-2026-058",
    fullName: "Neha Shinde",
    className: "Class 7-A",
    attendancePercentage: 71.0,
    daysAbsent: 18,
    totalDays: 62,
    status: "Warning",
    guardianPhone: "+91 98119 67234",
  },
  {
    id: "low-5",
    studentId: "STU-2026-073",
    fullName: "Karan Jadhav",
    className: "Class 6-B",
    attendancePercentage: 72.6,
    daysAbsent: 17,
    totalDays: 62,
    status: "Warning",
    guardianPhone: "+91 97650 11298",
  },
  {
    id: "low-6",
    studentId: "STU-2026-089",
    fullName: "Pooja Malhotra",
    className: "Class 10-A",
    attendancePercentage: 74.2,
    daysAbsent: 16,
    totalDays: 62,
    status: "Warning",
    guardianPhone: "+91 98452 30911",
  },
];

const ATTENDANCE_STORAGE_KEY = "edusync_attendance_sessions_v1";

export function getStoredAttendanceSessions(): AttendanceSessionRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_ATTENDANCE_SESSIONS;
  }
  try {
    const raw = sessionStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) return INITIAL_ATTENDANCE_SESSIONS;
    const parsed = JSON.parse(raw) as AttendanceSessionRecord[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : INITIAL_ATTENDANCE_SESSIONS;
  } catch {
    return INITIAL_ATTENDANCE_SESSIONS;
  }
}

export function saveStoredAttendanceSessions(
  sessions: AttendanceSessionRecord[],
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore storage quota errors in preview mode
  }
}
