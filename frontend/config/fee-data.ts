/*
 * ============================================================================
 * EduSync — Stage 5: Fee Management Mock Data, Helpers & API Contracts
 * ============================================================================
 *
 * Future Backend API Reference Contracts (Not called in Frontend Preview Mode):
 *
 * - POST /schools/{school_id}/fees/invoices
 * - GET  /schools/{school_id}/fees/invoices
 * - GET  /schools/{school_id}/fees/balances
 * - POST /schools/{school_id}/fees/invoices/{invoice_id}/payments
 * - GET  /schools/{school_id}/fees/invoices/{invoice_id}/payments
 *
 * Notes:
 * - Supports full and partial payments.
 * - Keeps invoice and payment records separate while maintaining accurate
 *   outstanding balance and status calculations.
 * ============================================================================
 */

export type FeeInvoiceStatus = "Paid" | "Partial" | "Pending" | "Overdue";

export type FeeCategory =
  | "Tuition Fee"
  | "Transportation Fee"
  | "Examination Fee"
  | "Laboratory Fee"
  | "Activity Fee"
  | "Other";

export type PaymentMethod =
  | "Cash"
  | "Bank Transfer"
  | "UPI"
  | "Cheque"
  | "Other";

export const FEE_CATEGORIES: FeeCategory[] = [
  "Tuition Fee",
  "Transportation Fee",
  "Examination Fee",
  "Laboratory Fee",
  "Activity Fee",
  "Other",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque",
  "Other",
];

export const FEE_OVERVIEW_STATS = {
  totalFees: 1250000,
  collectedFees: 1085000,
  collectedPercentage: "86.8%",
  outstandingFees: 165000,
  overdueFees: 45000,
  overdueInvoicesCount: 18,
};

export interface FeeInvoiceRecord {
  id: string;
  invoiceId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  academicYear: string;
  title: string;
  category: FeeCategory;
  invoiceDate: string;
  dueDate: string;
  description?: string;
  originalAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: FeeInvoiceStatus;
}

export interface FeePaymentRecord {
  id: string;
  paymentId: string;
  invoiceId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  remarks?: string;
  recordedBy: string;
}

export interface StudentOutstandingBalanceRecord {
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  totalFees: number;
  amountPaid: number;
  outstandingBalance: number;
  dueDate: string;
  status: "Partial" | "Pending" | "Overdue";
  invoiceCount: number;
  primaryInvoiceId: string;
}

export interface FeeMonthlyCollectionPoint {
  month: string;
  collected: number;
  outstanding: number;
}

export const FEE_COLLECTION_TREND_6M: FeeMonthlyCollectionPoint[] = [
  { month: "Jun", collected: 195000, outstanding: 35000 },
  { month: "Jul", collected: 172000, outstanding: 28000 },
  { month: "Aug", collected: 168000, outstanding: 24000 },
  { month: "Sep", collected: 185000, outstanding: 26000 },
  { month: "Oct", collected: 175000, outstanding: 27000 },
  { month: "Nov", collected: 190000, outstanding: 25000 },
];

export const PAYMENT_DISTRIBUTION_DATA = {
  paid: {
    label: "Fully Paid",
    count: 82,
    amount: 890000,
    percentage: 68,
    color: "#16a34a",
  },
  partial: {
    label: "Partially Paid",
    count: 19,
    amount: 195000,
    percentage: 16,
    color: "#0284c7",
  },
  pending: {
    label: "Pending",
    count: 11,
    amount: 120000,
    percentage: 9,
    color: "#d97706",
  },
  overdue: {
    label: "Overdue",
    count: 8,
    amount: 45000,
    percentage: 7,
    color: "#dc2626",
  },
};

export const INITIAL_FEE_INVOICES: FeeInvoiceRecord[] = [
  {
    id: "inv-2026-1001",
    invoiceId: "INV-2026-1001",
    studentId: "stu-101",
    studentCode: "STU-2026-001",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    guardianName: "Sandeep Naik",
    guardianPhone: "+91 98230 11204",
    academicYear: "2026-2027",
    title: "Term II Tuition & Science Lab Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-10-01",
    dueDate: "2026-11-30",
    description: "Second term composite tuition and laboratory equipment fee for Grade 8.",
    originalAmount: 66000,
    discount: 2000,
    totalAmount: 64000,
    paidAmount: 48000,
    balanceAmount: 16000,
    status: "Partial",
  },
  {
    id: "inv-2026-1002",
    invoiceId: "INV-2026-1002",
    studentId: "stu-102",
    studentCode: "STU-2026-002",
    studentName: "Diya Kulkarni",
    className: "Class 9-A",
    guardianName: "Mahesh Kulkarni",
    guardianPhone: "+91 98224 55310",
    academicYear: "2026-2027",
    title: "Annual Composite Tuition Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-09-15",
    dueDate: "2026-10-15",
    description: "Full academic year 2026-2027 tuition and library fee with early settlement.",
    originalAmount: 70000,
    discount: 2000,
    totalAmount: 68000,
    paidAmount: 68000,
    balanceAmount: 0,
    status: "Paid",
  },
  {
    id: "inv-2026-1003",
    invoiceId: "INV-2026-1003",
    studentId: "stu-103",
    studentCode: "STU-2026-003",
    studentName: "Rohan Deshmukh",
    className: "Class 10-A",
    guardianName: "Anil Deshmukh",
    guardianPhone: "+91 98192 44012",
    academicYear: "2026-2027",
    title: "Board Exam & Term II Tuition Fee",
    category: "Examination Fee",
    invoiceDate: "2026-09-10",
    dueDate: "2026-10-25",
    description: "Secondary school board examination registration and Term II tuition.",
    originalAmount: 72000,
    discount: 0,
    totalAmount: 72000,
    paidAmount: 54000,
    balanceAmount: 18000,
    status: "Overdue",
  },
  {
    id: "inv-2026-1004",
    invoiceId: "INV-2026-1004",
    studentId: "stu-104",
    studentCode: "STU-2026-004",
    studentName: "Ananya Iyer",
    className: "Class 6-A",
    guardianName: "Subramanian Iyer",
    guardianPhone: "+91 98450 77891",
    academicYear: "2026-2027",
    title: "Annual Grade 6 Tuition & Activity Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-06-10",
    dueDate: "2026-07-10",
    description: "Annual tuition and co-curricular activity fee for Grade 6.",
    originalAmount: 58000,
    discount: 0,
    totalAmount: 58000,
    paidAmount: 58000,
    balanceAmount: 0,
    status: "Paid",
  },
  {
    id: "inv-2026-1005",
    invoiceId: "INV-2026-1005",
    studentId: "stu-105",
    studentCode: "STU-2026-005",
    studentName: "Kabir Fernandes",
    className: "Class 7-A",
    guardianName: "Savio Fernandes",
    guardianPhone: "+91 98231 60921",
    academicYear: "2026-2027",
    title: "Term II Tuition & Bus Transport Fee",
    category: "Transportation Fee",
    invoiceDate: "2026-09-01",
    dueDate: "2026-11-25",
    description: "Term II tuition and Panaji route school bus transportation.",
    originalAmount: 60000,
    discount: 0,
    totalAmount: 60000,
    paidAmount: 45000,
    balanceAmount: 15000,
    status: "Partial",
  },
  {
    id: "inv-2026-1006",
    invoiceId: "INV-2026-1006",
    studentId: "stu-106",
    studentCode: "STU-2026-006",
    studentName: "Riya Sawant",
    className: "Class 7-B",
    guardianName: "Deepak Sawant",
    guardianPhone: "+91 98235 88219",
    academicYear: "2026-2027",
    title: "Term II Tuition & Computer Lab Fee",
    category: "Laboratory Fee",
    invoiceDate: "2026-10-05",
    dueDate: "2026-11-28",
    description: "Term II academic tuition and digital laboratory charges.",
    originalAmount: 62000,
    discount: 2000,
    totalAmount: 60000,
    paidAmount: 50000,
    balanceAmount: 10000,
    status: "Partial",
  },
  {
    id: "inv-2026-1007",
    invoiceId: "INV-2026-1007",
    studentId: "stu-107",
    studentCode: "STU-2026-007",
    studentName: "Vivaan Kamat",
    className: "Class 6-B",
    guardianName: "Gaurav Kamat",
    guardianPhone: "+91 98221 30498",
    academicYear: "2026-2027",
    title: "Annual Grade 6 Tuition Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-06-12",
    dueDate: "2026-07-15",
    description: "Full academic session tuition fee for Class 6-B.",
    originalAmount: 58000,
    discount: 0,
    totalAmount: 58000,
    paidAmount: 58000,
    balanceAmount: 0,
    status: "Paid",
  },
  {
    id: "inv-2026-1008",
    invoiceId: "INV-2026-1008",
    studentId: "stu-108",
    studentCode: "STU-2026-008",
    studentName: "Ishita Prabhu",
    className: "Class 8-B",
    guardianName: "Nitin Prabhu",
    guardianPhone: "+91 98236 74110",
    academicYear: "2026-2027",
    title: "Term II Tuition & Sports Activity Fee",
    category: "Activity Fee",
    invoiceDate: "2026-09-20",
    dueDate: "2026-10-30",
    description: "Second term tuition and annual athletics program fee.",
    originalAmount: 64000,
    discount: 0,
    totalAmount: 64000,
    paidAmount: 48000,
    balanceAmount: 16000,
    status: "Overdue",
  },
  {
    id: "inv-2026-1009",
    invoiceId: "INV-2026-1009",
    studentId: "stu-109",
    studentCode: "STU-2026-009",
    studentName: "Aditya Borkar",
    className: "Class 9-A",
    guardianName: "Rajendra Borkar",
    guardianPhone: "+91 98229 19044",
    academicYear: "2026-2027",
    title: "Term II Senior Secondary Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-09-12",
    dueDate: "2026-10-20",
    description: "Grade 9 Term II tuition and science practical fee.",
    originalAmount: 68000,
    discount: 0,
    totalAmount: 68000,
    paidAmount: 34000,
    balanceAmount: 34000,
    status: "Overdue",
  },
  {
    id: "inv-2026-1010",
    invoiceId: "INV-2026-1010",
    studentId: "stu-110",
    studentCode: "STU-2026-010",
    studentName: "Saanvi Shirodkar",
    className: "Class 10-A",
    guardianName: "Vandana Shirodkar",
    guardianPhone: "+91 98233 50128",
    academicYear: "2026-2027",
    title: "Annual Grade 10 Composite Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-06-08",
    dueDate: "2026-07-08",
    description: "Full annual tuition, laboratory and board exam preparation fee.",
    originalAmount: 75000,
    discount: 3000,
    totalAmount: 72000,
    paidAmount: 72000,
    balanceAmount: 0,
    status: "Paid",
  },
  {
    id: "inv-2026-1011",
    invoiceId: "INV-2026-1011",
    studentId: "stu-111",
    studentCode: "STU-2026-011",
    studentName: "Devansh Gaonkar",
    className: "Unassigned",
    guardianName: "Prashant Gaonkar",
    guardianPhone: "+91 98237 99201",
    academicYear: "2026-2027",
    title: "New Admission & Term II Tuition Fee",
    category: "Tuition Fee",
    invoiceDate: "2026-11-05",
    dueDate: "2026-12-05",
    description: "Mid-year admission registration and Term II installment.",
    originalAmount: 60000,
    discount: 0,
    totalAmount: 60000,
    paidAmount: 30000,
    balanceAmount: 30000,
    status: "Partial",
  },
  {
    id: "inv-2026-1012",
    invoiceId: "INV-2026-1012",
    studentId: "stu-112",
    studentCode: "STU-2026-012",
    studentName: "Meera Sardesai",
    className: "Unassigned",
    guardianName: "Raghav Sardesai",
    guardianPhone: "+91 98238 41509",
    academicYear: "2026-2027",
    title: "Term II Tuition & Transport Deposit",
    category: "Transportation Fee",
    invoiceDate: "2026-11-10",
    dueDate: "2026-12-10",
    description: "Initial admission invoice awaiting payment confirmation.",
    originalAmount: 58000,
    discount: 0,
    totalAmount: 58000,
    paidAmount: 0,
    balanceAmount: 58000,
    status: "Pending",
  },
];

export const INITIAL_FEE_PAYMENTS: FeePaymentRecord[] = [
  {
    id: "pay-2026-901",
    paymentId: "PAY-2026-0901",
    invoiceId: "INV-2026-1006",
    studentId: "stu-106",
    studentCode: "STU-2026-006",
    studentName: "Riya Sawant",
    className: "Class 7-B",
    amountPaid: 5000,
    paymentDate: "2026-11-14",
    paymentMethod: "UPI",
    transactionRef: "UPI/431908441209/Sawant",
    remarks: "Partial Term II installment received via parent portal",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-902",
    paymentId: "PAY-2026-0902",
    invoiceId: "INV-2026-1011",
    studentId: "stu-111",
    studentCode: "STU-2026-011",
    studentName: "Devansh Gaonkar",
    className: "Unassigned",
    amountPaid: 30000,
    paymentDate: "2026-11-05",
    paymentMethod: "UPI",
    transactionRef: "UPI/431099281721/Gaonkar",
    remarks: "Admission deposit and first installment",
    recordedBy: "Arjun Mehta (Admin)",
  },
  {
    id: "pay-2026-903",
    paymentId: "PAY-2026-0903",
    invoiceId: "INV-2026-1001",
    studentId: "stu-101",
    studentCode: "STU-2026-001",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    amountPaid: 24000,
    paymentDate: "2026-10-10",
    paymentMethod: "UPI",
    transactionRef: "UPI/428411009823/Naik",
    remarks: "Term II tuition installment",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-904",
    paymentId: "PAY-2026-0904",
    invoiceId: "INV-2026-1002",
    studentId: "stu-102",
    studentCode: "STU-2026-002",
    studentName: "Diya Kulkarni",
    className: "Class 9-A",
    amountPaid: 68000,
    paymentDate: "2026-10-05",
    paymentMethod: "Bank Transfer",
    transactionRef: "NEFT-HDFC0004829104",
    remarks: "Full annual composite fee settlement",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-905",
    paymentId: "PAY-2026-0905",
    invoiceId: "INV-2026-1008",
    studentId: "stu-108",
    studentCode: "STU-2026-008",
    studentName: "Ishita Prabhu",
    className: "Class 8-B",
    amountPaid: 48000,
    paymentDate: "2026-10-01",
    paymentMethod: "UPI",
    transactionRef: "UPI/427588392011/Prabhu",
    remarks: "Term I and partial Term II fee",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-906",
    paymentId: "PAY-2026-0906",
    invoiceId: "INV-2026-1003",
    studentId: "stu-103",
    studentCode: "STU-2026-003",
    studentName: "Rohan Deshmukh",
    className: "Class 10-A",
    amountPaid: 54000,
    paymentDate: "2026-09-18",
    paymentMethod: "UPI",
    transactionRef: "UPI/426100948271/Deshmukh",
    remarks: "Term I & II tuition payment",
    recordedBy: "Arjun Mehta (Admin)",
  },
  {
    id: "pay-2026-907",
    paymentId: "PAY-2026-0907",
    invoiceId: "INV-2026-1005",
    studentId: "stu-105",
    studentCode: "STU-2026-005",
    studentName: "Kabir Fernandes",
    className: "Class 7-A",
    amountPaid: 45000,
    paymentDate: "2026-09-02",
    paymentMethod: "Bank Transfer",
    transactionRef: "IMPS-ICIC0009182734",
    remarks: "Term I & II composite payment",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-908",
    paymentId: "PAY-2026-0908",
    invoiceId: "INV-2026-1006",
    studentId: "stu-106",
    studentCode: "STU-2026-006",
    studentName: "Riya Sawant",
    className: "Class 7-B",
    amountPaid: 45000,
    paymentDate: "2026-08-22",
    paymentMethod: "Cheque",
    transactionRef: "CHQ-SBI-884210",
    remarks: "Term I & partial Term II cheque clearance",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-909",
    paymentId: "PAY-2026-0909",
    invoiceId: "INV-2026-1007",
    studentId: "stu-107",
    studentCode: "STU-2026-007",
    studentName: "Vivaan Kamat",
    className: "Class 6-B",
    amountPaid: 58000,
    paymentDate: "2026-06-20",
    paymentMethod: "Bank Transfer",
    transactionRef: "NEFT-AXIS0007721902",
    remarks: "Annual tuition full payment",
    recordedBy: "Arjun Mehta (Admin)",
  },
  {
    id: "pay-2026-910",
    paymentId: "PAY-2026-0910",
    invoiceId: "INV-2026-1004",
    studentId: "stu-104",
    studentCode: "STU-2026-004",
    studentName: "Ananya Iyer",
    className: "Class 6-A",
    amountPaid: 58000,
    paymentDate: "2026-06-15",
    paymentMethod: "Bank Transfer",
    transactionRef: "NEFT-HDFC0001129481",
    remarks: "Annual composite fee payment",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-911",
    paymentId: "PAY-2026-0911",
    invoiceId: "INV-2026-1010",
    studentId: "stu-110",
    studentCode: "STU-2026-010",
    studentName: "Saanvi Shirodkar",
    className: "Class 10-A",
    amountPaid: 72000,
    paymentDate: "2026-06-14",
    paymentMethod: "Bank Transfer",
    transactionRef: "RTGS-SBIN0004920112",
    remarks: "Annual Grade 10 settlement",
    recordedBy: "Arjun Mehta (Admin)",
  },
  {
    id: "pay-2026-912",
    paymentId: "PAY-2026-0912",
    invoiceId: "INV-2026-1001",
    studentId: "stu-101",
    studentCode: "STU-2026-001",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    amountPaid: 24000,
    paymentDate: "2026-06-12",
    paymentMethod: "Bank Transfer",
    transactionRef: "NEFT-ICIC0003381920",
    remarks: "Term I admission & tuition",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
  {
    id: "pay-2026-913",
    paymentId: "PAY-2026-0913",
    invoiceId: "INV-2026-1009",
    studentId: "stu-109",
    studentCode: "STU-2026-009",
    studentName: "Aditya Borkar",
    className: "Class 9-A",
    amountPaid: 34000,
    paymentDate: "2026-06-10",
    paymentMethod: "Cheque",
    transactionRef: "CHQ-BOB-441902",
    remarks: "Term I fee installment",
    recordedBy: "Vikram Kulkarni (Accounts)",
  },
];

const INVOICES_STORAGE_KEY = "edusync_stage5_invoices_v1";
const PAYMENTS_STORAGE_KEY = "edusync_stage5_payments_v1";
const CURRENT_REFERENCE_DATE = "2026-11-14";

export function computeInvoiceStatus(
  totalAmount: number,
  paidAmount: number,
  dueDate: string,
): FeeInvoiceStatus {
  const balance = Math.max(0, totalAmount - paidAmount);
  if (balance <= 0) {
    return "Paid";
  }
  if (dueDate && dueDate < CURRENT_REFERENCE_DATE) {
    return "Overdue";
  }
  if (paidAmount > 0) {
    return "Partial";
  }
  return "Pending";
}

export function deriveOutstandingBalances(
  invoices: FeeInvoiceRecord[],
): StudentOutstandingBalanceRecord[] {
  const map = new Map<string, StudentOutstandingBalanceRecord>();

  for (const inv of invoices) {
    if (inv.balanceAmount <= 0) continue;

    const existing = map.get(inv.studentId);
    const invStatus: "Partial" | "Pending" | "Overdue" =
      inv.status === "Overdue"
        ? "Overdue"
        : inv.status === "Partial"
          ? "Partial"
          : "Pending";

    if (!existing) {
      map.set(inv.studentId, {
        studentId: inv.studentId,
        studentCode: inv.studentCode,
        studentName: inv.studentName,
        className: inv.className,
        guardianName: inv.guardianName,
        guardianPhone: inv.guardianPhone,
        totalFees: inv.totalAmount,
        amountPaid: inv.paidAmount,
        outstandingBalance: inv.balanceAmount,
        dueDate: inv.dueDate,
        status: invStatus,
        invoiceCount: 1,
        primaryInvoiceId: inv.invoiceId,
      });
    } else {
      existing.totalFees += inv.totalAmount;
      existing.amountPaid += inv.paidAmount;
      existing.outstandingBalance += inv.balanceAmount;
      existing.invoiceCount += 1;
      if (inv.dueDate < existing.dueDate) {
        existing.dueDate = inv.dueDate;
      }
      if (invStatus === "Overdue") {
        existing.status = "Overdue";
      } else if (existing.status !== "Overdue" && invStatus === "Partial") {
        existing.status = "Partial";
      }
    }
  }

  return Array.from(map.values());
}

export function formatINR(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

export function getStoredFeeInvoices(): FeeInvoiceRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_FEE_INVOICES;
  }
  try {
    const raw = window.sessionStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) return INITIAL_FEE_INVOICES;
    const parsed = JSON.parse(raw) as FeeInvoiceRecord[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : INITIAL_FEE_INVOICES;
  } catch {
    return INITIAL_FEE_INVOICES;
  }
}

export function saveStoredFeeInvoices(invoices: FeeInvoiceRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      INVOICES_STORAGE_KEY,
      JSON.stringify(invoices),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}

export function getStoredFeePayments(): FeePaymentRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_FEE_PAYMENTS;
  }
  try {
    const raw = window.sessionStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (!raw) return INITIAL_FEE_PAYMENTS;
    const parsed = JSON.parse(raw) as FeePaymentRecord[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : INITIAL_FEE_PAYMENTS;
  } catch {
    return INITIAL_FEE_PAYMENTS;
  }
}

export function saveStoredFeePayments(payments: FeePaymentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PAYMENTS_STORAGE_KEY,
      JSON.stringify(payments),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}
