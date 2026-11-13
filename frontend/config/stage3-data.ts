/*
 * ============================================================================
 * EduSync — Stage 3: Student Management & Class Management Mock Data & Contracts
 * ============================================================================
 *
 * Future Backend API Reference Contracts (Not called in Frontend Preview Mode):
 *
 * Students:
 * - GET    /schools/{school_id}/students
 * - POST   /schools/{school_id}/students
 * - GET    /schools/{school_id}/students/{student_id}
 * - PATCH  /schools/{school_id}/students/{student_id}
 * - POST   /schools/{school_id}/students/{student_id}/enrollments
 * - GET    /schools/{school_id}/students/{student_id}/guardians
 *
 * Classes:
 * - GET    /schools/{school_id}/classes
 * - POST   /schools/{school_id}/classes
 * - PATCH  /schools/{school_id}/classes/{class_id}
 * - DELETE /schools/{school_id}/classes/{class_id}
 *
 * Teacher Assignments:
 * - POST   /schools/{school_id}/classes/{class_id}/teachers
 * - DELETE /schools/{school_id}/classes/{class_id}/teachers/{teacher_user_id}
 * ============================================================================
 */

export const STUDENT_DIRECTORY_STATS = {
  totalStudents: 1248,
  activeStudents: 1210,
  newlyRegistered: 24,
  unassignedStudents: 14,
};

export const CLASS_DIRECTORY_STATS = {
  totalClasses: 32,
  totalEnrolledStudents: 1248,
  assignedTeachers: 28,
  classesWithoutTeachers: 4,
};

export const ACADEMIC_YEARS = ["2026-2027", "2025-2026"];

export const GRADE_OPTIONS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
];

export interface ClassOptionItem {
  id: string;
  name: string;
  grade: string;
  section: string;
}

export const CLASS_OPTIONS: ClassOptionItem[] = [
  { id: "class-6-a", name: "Class 6-A", grade: "Class 6", section: "A" },
  { id: "class-6-b", name: "Class 6-B", grade: "Class 6", section: "B" },
  { id: "class-7-a", name: "Class 7-A", grade: "Class 7", section: "A" },
  { id: "class-7-b", name: "Class 7-B", grade: "Class 7", section: "B" },
  { id: "class-8-a", name: "Class 8-A", grade: "Class 8", section: "A" },
  { id: "class-8-b", name: "Class 8-B", grade: "Class 8", section: "B" },
  { id: "class-9-a", name: "Class 9-A", grade: "Class 9", section: "A" },
  { id: "class-9-b", name: "Class 9-B", grade: "Class 9", section: "B" },
  { id: "class-10-a", name: "Class 10-A", grade: "Class 10", section: "A" },
  { id: "class-10-b", name: "Class 10-B", grade: "Class 10", section: "B" },
];

export interface GuardianRecord {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address?: string;
  isPrimary?: boolean;
}

export interface StudentAttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late";
  remarks?: string;
}

export interface StudentFeePaymentRecord {
  id: string;
  receiptNo: string;
  date: string;
  installment: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending";
}

export interface StudentRecord {
  id: string;
  studentId: string;
  fullName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup?: string;
  address: string;
  academicYear: string;
  classId: string;
  className: string;
  enrollmentDate: string;
  admissionNumber: string;
  status: "Active" | "Inactive";
  guardians: GuardianRecord[];
  attendanceSummary: {
    percentage: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    history: StudentAttendanceRecord[];
  };
  feeSummary: {
    totalFees: number;
    amountPaid: number;
    outstandingAmount: number;
    payments: StudentFeePaymentRecord[];
  };
}

export interface ClassTeacherAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  email: string;
  subject: string;
  role: "Class Teacher" | "Subject Teacher";
  status: "Active" | "Pending";
  assignedDate: string;
}

export interface ClassRecord {
  id: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  enrolledCount: number;
  capacity: number;
  classTeacher: string;
  status: "Active" | "Draft";
  description?: string;
  attendanceRate: number;
  presentToday: number;
  absentToday: number;
  assignedTeachers: ClassTeacherAssignment[];
}

export interface TeacherDirectoryItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  department: string;
}

export const AVAILABLE_TEACHERS: TeacherDirectoryItem[] = [
  {
    id: "tch-101",
    name: "Priya Nair",
    email: "priya.nair@institution.in",
    subject: "Mathematics",
    department: "Middle & Senior Mathematics",
  },
  {
    id: "tch-102",
    name: "Rajesh Sharma",
    email: "rajesh.sharma@institution.in",
    subject: "Physics",
    department: "Natural Sciences",
  },
  {
    id: "tch-103",
    name: "Ananya Deshpande",
    email: "ananya.deshpande@institution.in",
    subject: "English Literature",
    department: "Languages & Humanities",
  },
  {
    id: "tch-104",
    name: "Vikram Kulkarni",
    email: "vikram.kulkarni@institution.in",
    subject: "Chemistry",
    department: "Natural Sciences",
  },
  {
    id: "tch-105",
    name: "Meera Krishnan",
    email: "meera.krishnan@institution.in",
    subject: "History & Civics",
    department: "Social Sciences",
  },
  {
    id: "tch-106",
    name: "Siddharth Verma",
    email: "siddharth.verma@institution.in",
    subject: "Computer Science",
    department: "Information Technology",
  },
  {
    id: "tch-107",
    name: "Kavita Joshi",
    email: "kavita.joshi@institution.in",
    subject: "Biology",
    department: "Natural Sciences",
  },
  {
    id: "tch-108",
    name: "Suresh Iyer",
    email: "suresh.iyer@institution.in",
    subject: "Geography & Economics",
    department: "Social Sciences",
  },
  {
    id: "tch-109",
    name: "Neha Gokhale",
    email: "neha.gokhale@institution.in",
    subject: "Hindi & Sanskrit",
    department: "Languages & Humanities",
  },
  {
    id: "tch-110",
    name: "Arvind Menon",
    email: "arvind.menon@institution.in",
    subject: "Physical Education",
    department: "Sports & Athletics",
  },
];

const DEFAULT_ATTENDANCE_HISTORY: StudentAttendanceRecord[] = [
  { date: "14 Nov 2026", status: "Present", remarks: "On time (08:15 AM)" },
  { date: "13 Nov 2026", status: "Present", remarks: "On time (08:12 AM)" },
  { date: "12 Nov 2026", status: "Present", remarks: "On time (08:18 AM)" },
  { date: "11 Nov 2026", status: "Late", remarks: "Arrived at 08:35 AM (Bus delay)" },
  { date: "10 Nov 2026", status: "Present", remarks: "On time (08:10 AM)" },
  { date: "08 Nov 2026", status: "Absent", remarks: "Medical leave approved" },
];

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "stu-101",
    studentId: "STU-2026-001",
    fullName: "Aarav Naik",
    dateOfBirth: "2012-05-14",
    gender: "Male",
    bloodGroup: "O+",
    address: "Flat 402, Sea Breeze Apartments, Miramar, Panaji, Goa 403001",
    academicYear: "2026-2027",
    classId: "class-8-a",
    className: "Class 8-A",
    enrollmentDate: "2023-06-05",
    admissionNumber: "ADM-2023-104",
    status: "Active",
    guardians: [
      {
        id: "grd-101a",
        name: "Sandeep Naik",
        relationship: "Father",
        phone: "+91 98230 11204",
        email: "sandeep.naik@gmail.com",
        address: "Flat 402, Sea Breeze Apartments, Miramar, Panaji, Goa 403001",
        isPrimary: true,
      },
      {
        id: "grd-101b",
        name: "Pallavi Naik",
        relationship: "Mother",
        phone: "+91 98230 11205",
        email: "pallavi.naik@gmail.com",
        address: "Flat 402, Sea Breeze Apartments, Miramar, Panaji, Goa 403001",
      },
    ],
    attendanceSummary: {
      percentage: 95.8,
      presentDays: 115,
      absentDays: 4,
      lateDays: 1,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 64000,
      amountPaid: 48000,
      outstandingAmount: 16000,
      payments: [
        {
          id: "pay-1",
          receiptNo: "RCP-2026-0891",
          date: "10 Oct 2026",
          installment: "Term II Tuition & Lab Fee",
          amount: 24000,
          method: "UPI / NEFT",
          status: "Paid",
        },
        {
          id: "pay-2",
          receiptNo: "RCP-2026-0312",
          date: "12 Jun 2026",
          installment: "Term I Admission & Tuition",
          amount: 24000,
          method: "NetBanking",
          status: "Paid",
        },
        {
          id: "pay-3",
          receiptNo: "INV-2026-1204",
          date: "Due 15 Jan 2027",
          installment: "Term III Final Installment",
          amount: 16000,
          method: "Scheduled",
          status: "Pending",
        },
      ],
    },
  },
  {
    id: "stu-102",
    studentId: "STU-2026-002",
    fullName: "Diya Kulkarni",
    dateOfBirth: "2011-09-22",
    gender: "Female",
    bloodGroup: "A+",
    address: "18, Gulmohar Colony, Kothrud, Pune, Maharashtra 411038",
    academicYear: "2026-2027",
    classId: "class-9-a",
    className: "Class 9-A",
    enrollmentDate: "2022-06-10",
    admissionNumber: "ADM-2022-088",
    status: "Active",
    guardians: [
      {
        id: "grd-102a",
        name: "Mahesh Kulkarni",
        relationship: "Father",
        phone: "+91 98224 55310",
        email: "mahesh.kulkarni@outlook.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 93.4,
      presentDays: 112,
      absentDays: 6,
      lateDays: 2,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 68000,
      amountPaid: 68000,
      outstandingAmount: 0,
      payments: [
        {
          id: "pay-102-1",
          receiptNo: "RCP-2026-0910",
          date: "05 Oct 2026",
          installment: "Full Annual Fee Settlement",
          amount: 68000,
          method: "HDFC NetBanking",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-103",
    studentId: "STU-2026-003",
    fullName: "Rohan Deshmukh",
    dateOfBirth: "2010-11-03",
    gender: "Male",
    bloodGroup: "B+",
    address: "B-12, Shanti Nagar, Dadar West, Mumbai 400028",
    academicYear: "2026-2027",
    classId: "class-10-a",
    className: "Class 10-A",
    enrollmentDate: "2021-06-08",
    admissionNumber: "ADM-2021-042",
    status: "Active",
    guardians: [
      {
        id: "grd-103a",
        name: "Anil Deshmukh",
        relationship: "Father",
        phone: "+91 98192 44012",
        email: "anil.deshmukh@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 97.5,
      presentDays: 117,
      absentDays: 2,
      lateDays: 1,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 72000,
      amountPaid: 54000,
      outstandingAmount: 18000,
      payments: [
        {
          id: "pay-103-1",
          receiptNo: "RCP-2026-0745",
          date: "18 Sep 2026",
          installment: "Term I & II Tuition",
          amount: 54000,
          method: "UPI",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-104",
    studentId: "STU-2026-004",
    fullName: "Ananya Iyer",
    dateOfBirth: "2014-02-19",
    gender: "Female",
    bloodGroup: "O+",
    address: "74, Palm Grove Layout, Indiranagar, Bengaluru 560038",
    academicYear: "2026-2027",
    classId: "class-6-a",
    className: "Class 6-A",
    enrollmentDate: "2025-06-01",
    admissionNumber: "ADM-2025-219",
    status: "Active",
    guardians: [
      {
        id: "grd-104a",
        name: "Subramanian Iyer",
        relationship: "Father",
        phone: "+91 98450 77891",
        email: "subramanian.iyer@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 96.6,
      presentDays: 116,
      absentDays: 3,
      lateDays: 1,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 58000,
      amountPaid: 58000,
      outstandingAmount: 0,
      payments: [
        {
          id: "pay-104-1",
          receiptNo: "RCP-2026-0412",
          date: "15 Jun 2026",
          installment: "Annual Composite Fee",
          amount: 58000,
          method: "Card",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-105",
    studentId: "STU-2026-005",
    fullName: "Kabir Fernandes",
    dateOfBirth: "2013-07-08",
    gender: "Male",
    bloodGroup: "AB+",
    address: "House No. 29, Fontainhas, Altinho, Panaji, Goa 403001",
    academicYear: "2026-2027",
    classId: "class-7-a",
    className: "Class 7-A",
    enrollmentDate: "2024-06-04",
    admissionNumber: "ADM-2024-167",
    status: "Active",
    guardians: [
      {
        id: "grd-105a",
        name: "Savio Fernandes",
        relationship: "Father",
        phone: "+91 98231 60921",
        email: "savio.fernandes@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 92.5,
      presentDays: 111,
      absentDays: 7,
      lateDays: 2,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 60000,
      amountPaid: 45000,
      outstandingAmount: 15000,
      payments: [
        {
          id: "pay-105-1",
          receiptNo: "RCP-2026-0630",
          date: "02 Sep 2026",
          installment: "Term I & II Fee",
          amount: 45000,
          method: "UPI",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-106",
    studentId: "STU-2026-006",
    fullName: "Riya Sawant",
    dateOfBirth: "2013-12-11",
    gender: "Female",
    bloodGroup: "B-",
    address: "C-104, Mandovi Heights, Porvorim, Goa 403521",
    academicYear: "2026-2027",
    classId: "class-7-b",
    className: "Class 7-B",
    enrollmentDate: "2024-06-04",
    admissionNumber: "ADM-2024-182",
    status: "Active",
    guardians: [
      {
        id: "grd-106a",
        name: "Deepak Sawant",
        relationship: "Father",
        phone: "+91 98235 88219",
        email: "deepak.sawant@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 94.2,
      presentDays: 113,
      absentDays: 5,
      lateDays: 2,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 60000,
      amountPaid: 50000,
      outstandingAmount: 10000,
      payments: [
        {
          id: "pay-106-1",
          receiptNo: "RCP-2026-1012",
          date: "14 Nov 2026",
          installment: "Partial Term II Payment",
          amount: 5000,
          method: "UPI",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-107",
    studentId: "STU-2026-007",
    fullName: "Vivaan Kamat",
    dateOfBirth: "2014-04-28",
    gender: "Male",
    bloodGroup: "A+",
    address: "11, Saraswat Colony, Margao, Goa 403601",
    academicYear: "2026-2027",
    classId: "class-6-b",
    className: "Class 6-B",
    enrollmentDate: "2025-06-02",
    admissionNumber: "ADM-2025-244",
    status: "Active",
    guardians: [
      {
        id: "grd-107a",
        name: "Gaurav Kamat",
        relationship: "Father",
        phone: "+91 98221 30498",
        email: "gaurav.kamat@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 95.0,
      presentDays: 114,
      absentDays: 4,
      lateDays: 2,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 58000,
      amountPaid: 58000,
      outstandingAmount: 0,
      payments: [
        {
          id: "pay-107-1",
          receiptNo: "RCP-2026-0501",
          date: "20 Jun 2026",
          installment: "Annual Tuition Fee",
          amount: 58000,
          method: "NetBanking",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-108",
    studentId: "STU-2026-008",
    fullName: "Ishita Prabhu",
    dateOfBirth: "2012-08-15",
    gender: "Female",
    bloodGroup: "O-",
    address: "304, Zuari Enclave, Vasco da Gama, Goa 403802",
    academicYear: "2026-2027",
    classId: "class-8-b",
    className: "Class 8-B",
    enrollmentDate: "2023-06-06",
    admissionNumber: "ADM-2023-139",
    status: "Active",
    guardians: [
      {
        id: "grd-108a",
        name: "Nitin Prabhu",
        relationship: "Father",
        phone: "+91 98236 74110",
        email: "nitin.prabhu@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 91.6,
      presentDays: 110,
      absentDays: 8,
      lateDays: 2,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 64000,
      amountPaid: 48000,
      outstandingAmount: 16000,
      payments: [
        {
          id: "pay-108-1",
          receiptNo: "RCP-2026-0811",
          date: "01 Oct 2026",
          installment: "Term I & II Fee",
          amount: 48000,
          method: "UPI",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-109",
    studentId: "STU-2026-009",
    fullName: "Aditya Borkar",
    dateOfBirth: "2011-01-30",
    gender: "Male",
    bloodGroup: "B+",
    address: "Plot 19, Housing Board Colony, Mapusa, Goa 403507",
    academicYear: "2026-2027",
    classId: "class-9-a",
    className: "Class 9-A",
    enrollmentDate: "2022-06-12",
    admissionNumber: "ADM-2022-095",
    status: "Inactive",
    guardians: [
      {
        id: "grd-109a",
        name: "Rajendra Borkar",
        relationship: "Father",
        phone: "+91 98229 19044",
        email: "rajendra.borkar@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 86.5,
      presentDays: 104,
      absentDays: 14,
      lateDays: 2,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 68000,
      amountPaid: 34000,
      outstandingAmount: 34000,
      payments: [
        {
          id: "pay-109-1",
          receiptNo: "RCP-2026-0215",
          date: "10 Jun 2026",
          installment: "Term I Fee",
          amount: 34000,
          method: "Cheque",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-110",
    studentId: "STU-2026-010",
    fullName: "Saanvi Shirodkar",
    dateOfBirth: "2010-06-17",
    gender: "Female",
    bloodGroup: "A+",
    address: "Villa 7, Dona Paula Palms, Panaji, Goa 403004",
    academicYear: "2026-2027",
    classId: "class-10-a",
    className: "Class 10-A",
    enrollmentDate: "2021-06-08",
    admissionNumber: "ADM-2021-051",
    status: "Active",
    guardians: [
      {
        id: "grd-110a",
        name: "Vandana Shirodkar",
        relationship: "Mother",
        phone: "+91 98233 50128",
        email: "vandana.shirodkar@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 98.3,
      presentDays: 118,
      absentDays: 1,
      lateDays: 1,
      history: DEFAULT_ATTENDANCE_HISTORY,
    },
    feeSummary: {
      totalFees: 72000,
      amountPaid: 72000,
      outstandingAmount: 0,
      payments: [
        {
          id: "pay-110-1",
          receiptNo: "RCP-2026-0398",
          date: "14 Jun 2026",
          installment: "Annual Full Payment",
          amount: 72000,
          method: "NetBanking",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-111",
    studentId: "STU-2026-011",
    fullName: "Devansh Gaonkar",
    dateOfBirth: "2013-03-09",
    gender: "Male",
    bloodGroup: "O+",
    address: "45, Shantinagar, Ponda, Goa 403401",
    academicYear: "2026-2027",
    classId: "",
    className: "Unassigned",
    enrollmentDate: "2026-11-05",
    admissionNumber: "ADM-2026-310",
    status: "Active",
    guardians: [
      {
        id: "grd-111a",
        name: "Prashant Gaonkar",
        relationship: "Father",
        phone: "+91 98237 99201",
        email: "prashant.gaonkar@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 100.0,
      presentDays: 8,
      absentDays: 0,
      lateDays: 0,
      history: DEFAULT_ATTENDANCE_HISTORY.slice(0, 3),
    },
    feeSummary: {
      totalFees: 60000,
      amountPaid: 30000,
      outstandingAmount: 30000,
      payments: [
        {
          id: "pay-111-1",
          receiptNo: "RCP-2026-1004",
          date: "05 Nov 2026",
          installment: "Admission & Term II Deposit",
          amount: 30000,
          method: "UPI",
          status: "Paid",
        },
      ],
    },
  },
  {
    id: "stu-112",
    studentId: "STU-2026-012",
    fullName: "Meera Sardesai",
    dateOfBirth: "2014-10-25",
    gender: "Female",
    bloodGroup: "AB-",
    address: "A-203, Heritage Residency, Campal, Panaji, Goa 403001",
    academicYear: "2026-2027",
    classId: "",
    className: "Unassigned",
    enrollmentDate: "2026-11-10",
    admissionNumber: "ADM-2026-315",
    status: "Active",
    guardians: [
      {
        id: "grd-112a",
        name: "Raghav Sardesai",
        relationship: "Father",
        phone: "+91 98238 41509",
        email: "raghav.sardesai@gmail.com",
        isPrimary: true,
      },
    ],
    attendanceSummary: {
      percentage: 100.0,
      presentDays: 4,
      absentDays: 0,
      lateDays: 0,
      history: DEFAULT_ATTENDANCE_HISTORY.slice(0, 3),
    },
    feeSummary: {
      totalFees: 58000,
      amountPaid: 29000,
      outstandingAmount: 29000,
      payments: [
        {
          id: "pay-112-1",
          receiptNo: "RCP-2026-1009",
          date: "10 Nov 2026",
          installment: "Admission Installment",
          amount: 29000,
          method: "Card",
          status: "Paid",
        },
      ],
    },
  },
];

export const INITIAL_CLASSES: ClassRecord[] = [
  {
    id: "class-6-a",
    name: "Class 6-A",
    grade: "Class 6",
    section: "A",
    academicYear: "2026-2027",
    enrolledCount: 42,
    capacity: 45,
    classTeacher: "Ananya Deshpande",
    status: "Active",
    description: "Middle school foundation section with integrated STEM lab.",
    attendanceRate: 95.2,
    presentToday: 40,
    absentToday: 2,
    assignedTeachers: [
      {
        id: "asg-6a-1",
        teacherId: "tch-103",
        teacherName: "Ananya Deshpande",
        email: "ananya.deshpande@institution.in",
        subject: "English Literature",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
      {
        id: "asg-6a-2",
        teacherId: "tch-101",
        teacherName: "Priya Nair",
        email: "priya.nair@institution.in",
        subject: "Mathematics",
        role: "Subject Teacher",
        status: "Active",
        assignedDate: "03 Jun 2026",
      },
    ],
  },
  {
    id: "class-6-b",
    name: "Class 6-B",
    grade: "Class 6",
    section: "B",
    academicYear: "2026-2027",
    enrolledCount: 38,
    capacity: 42,
    classTeacher: "Neha Gokhale",
    status: "Active",
    description: "Middle school section B.",
    attendanceRate: 94.7,
    presentToday: 36,
    absentToday: 2,
    assignedTeachers: [
      {
        id: "asg-6b-1",
        teacherId: "tch-109",
        teacherName: "Neha Gokhale",
        email: "neha.gokhale@institution.in",
        subject: "Hindi & Sanskrit",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
    ],
  },
  {
    id: "class-7-a",
    name: "Class 7-A",
    grade: "Class 7",
    section: "A",
    academicYear: "2026-2027",
    enrolledCount: 38,
    capacity: 40,
    classTeacher: "Kavita Joshi",
    status: "Active",
    description: "Grade 7 section A focusing on foundational sciences.",
    attendanceRate: 92.1,
    presentToday: 35,
    absentToday: 3,
    assignedTeachers: [
      {
        id: "asg-7a-1",
        teacherId: "tch-107",
        teacherName: "Kavita Joshi",
        email: "kavita.joshi@institution.in",
        subject: "Biology",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
    ],
  },
  {
    id: "class-7-b",
    name: "Class 7-B",
    grade: "Class 7",
    section: "B",
    academicYear: "2026-2027",
    enrolledCount: 40,
    capacity: 42,
    classTeacher: "Meera Krishnan",
    status: "Active",
    description: "Grade 7 section B.",
    attendanceRate: 95.0,
    presentToday: 38,
    absentToday: 2,
    assignedTeachers: [
      {
        id: "asg-7b-1",
        teacherId: "tch-105",
        teacherName: "Meera Krishnan",
        email: "meera.krishnan@institution.in",
        subject: "History & Civics",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "14 Nov 2026",
      },
    ],
  },
  {
    id: "class-8-a",
    name: "Class 8-A",
    grade: "Class 8",
    section: "A",
    academicYear: "2026-2027",
    enrolledCount: 45,
    capacity: 45,
    classTeacher: "Priya Nair",
    status: "Active",
    description: "Senior middle school section with robotics elective.",
    attendanceRate: 95.6,
    presentToday: 43,
    absentToday: 2,
    assignedTeachers: [
      {
        id: "asg-8a-1",
        teacherId: "tch-101",
        teacherName: "Priya Nair",
        email: "priya.nair@institution.in",
        subject: "Mathematics",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
      {
        id: "asg-8a-2",
        teacherId: "tch-106",
        teacherName: "Siddharth Verma",
        email: "siddharth.verma@institution.in",
        subject: "Computer Science",
        role: "Subject Teacher",
        status: "Active",
        assignedDate: "04 Jun 2026",
      },
    ],
  },
  {
    id: "class-8-b",
    name: "Class 8-B",
    grade: "Class 8",
    section: "B",
    academicYear: "2026-2027",
    enrolledCount: 41,
    capacity: 45,
    classTeacher: "Siddharth Verma",
    status: "Active",
    description: "Grade 8 section B.",
    attendanceRate: 92.7,
    presentToday: 38,
    absentToday: 3,
    assignedTeachers: [
      {
        id: "asg-8b-1",
        teacherId: "tch-106",
        teacherName: "Siddharth Verma",
        email: "siddharth.verma@institution.in",
        subject: "Computer Science",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
    ],
  },
  {
    id: "class-9-a",
    name: "Class 9-A",
    grade: "Class 9",
    section: "A",
    academicYear: "2026-2027",
    enrolledCount: 40,
    capacity: 42,
    classTeacher: "Rajesh Sharma",
    status: "Active",
    description: "Secondary board preparation cohort — Section A.",
    attendanceRate: 90.0,
    presentToday: 36,
    absentToday: 4,
    assignedTeachers: [
      {
        id: "asg-9a-1",
        teacherId: "tch-102",
        teacherName: "Rajesh Sharma",
        email: "rajesh.sharma@institution.in",
        subject: "Physics",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
    ],
  },
  {
    id: "class-9-b",
    name: "Class 9-B",
    grade: "Class 9",
    section: "B",
    academicYear: "2026-2027",
    enrolledCount: 37,
    capacity: 42,
    classTeacher: "Unassigned",
    status: "Active",
    description: "Secondary board preparation cohort — Section B (Teacher assignment pending).",
    attendanceRate: 91.9,
    presentToday: 34,
    absentToday: 3,
    assignedTeachers: [],
  },
  {
    id: "class-10-a",
    name: "Class 10-A",
    grade: "Class 10",
    section: "A",
    academicYear: "2026-2027",
    enrolledCount: 36,
    capacity: 40,
    classTeacher: "Vikram Kulkarni",
    status: "Active",
    description: "Board examination batch — Science & Mathematics stream.",
    attendanceRate: 97.2,
    presentToday: 35,
    absentToday: 1,
    assignedTeachers: [
      {
        id: "asg-10a-1",
        teacherId: "tch-104",
        teacherName: "Vikram Kulkarni",
        email: "vikram.kulkarni@institution.in",
        subject: "Chemistry",
        role: "Class Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
      {
        id: "asg-10a-2",
        teacherId: "tch-102",
        teacherName: "Rajesh Sharma",
        email: "rajesh.sharma@institution.in",
        subject: "Physics",
        role: "Subject Teacher",
        status: "Active",
        assignedDate: "01 Jun 2026",
      },
    ],
  },
  {
    id: "class-10-b",
    name: "Class 10-B",
    grade: "Class 10",
    section: "B",
    academicYear: "2025-2026",
    enrolledCount: 34,
    capacity: 40,
    classTeacher: "Unassigned",
    status: "Draft",
    description: "Previous academic year archive / unassigned section.",
    attendanceRate: 94.1,
    presentToday: 32,
    absentToday: 2,
    assignedTeachers: [],
  },
];

const STUDENTS_STORAGE_KEY = "edusync_stage3_students_v1";
const CLASSES_STORAGE_KEY = "edusync_stage3_classes_v1";

export function getStoredStudents(): StudentRecord[] {
  if (typeof window === "undefined") return INITIAL_STUDENTS;
  try {
    const raw = sessionStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return INITIAL_STUDENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveStoredStudents(list: StudentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage quota errors
  }
}

export function getStoredClasses(): ClassRecord[] {
  if (typeof window === "undefined") return INITIAL_CLASSES;
  try {
    const raw = sessionStorage.getItem(CLASSES_STORAGE_KEY);
    if (!raw) return INITIAL_CLASSES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLASSES;
  } catch {
    return INITIAL_CLASSES;
  }
}

export function saveStoredClasses(list: ClassRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage quota errors
  }
}

export function formatINRCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}
