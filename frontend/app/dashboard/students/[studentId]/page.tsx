"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Input,
  Modal,
  Select,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  GuardianCard,
  StudentForm,
  StudentInformationCard,
  StudentProfileHeader,
} from "@/components/students";
import {
  FeeStatusBadge,
  PaymentSummaryCard,
} from "@/components/fees";
import {
  INITIAL_FEE_INVOICES,
  INITIAL_FEE_PAYMENTS,
  formatINR,
  getStoredFeeInvoices,
  getStoredFeePayments,
  type FeeInvoiceRecord,
  type FeePaymentRecord,
} from "@/config/fee-data";
import {
  getStoredStudents,
  INITIAL_STUDENTS,
  saveStoredStudents,
  type GuardianRecord,
  type StudentRecord,
} from "@/config/stage3-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACTS (Not called in Stage 3 Frontend Mode)
 * ============================================================================
 * - GET /schools/{school_id}/students/{student_id}
 * - PATCH /schools/{school_id}/students/{student_id}
 * - GET /schools/{school_id}/students/{student_id}/guardians
 * ============================================================================
 */

type ProfileTabId =
  | "overview"
  | "academic"
  | "guardians"
  | "attendance"
  | "fees";

export default function StudentProfilePage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const studentSlug = params?.studentId || "";

  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [feeInvoices, setFeeInvoices] =
    useState<FeeInvoiceRecord[]>(INITIAL_FEE_INVOICES);
  const [feePayments, setFeePayments] =
    useState<FeePaymentRecord[]>(INITIAL_FEE_PAYMENTS);
  const [activeTab, setActiveTab] = useState<ProfileTabId>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Add Guardian Modal State
  const [gName, setGName] = useState("");
  const [gRelation, setGRelation] = useState("Mother");
  const [gPhone, setGPhone] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gAddress, setGAddress] = useState("");
  const [gError, setGError] = useState("");

  useEffect(() => {
    setStudents(getStoredStudents());
    setFeeInvoices(getStoredFeeInvoices());
    setFeePayments(getStoredFeePayments());
  }, []);

  const student =
    students.find(
      (s) =>
        s.id === studentSlug ||
        s.studentId.toLowerCase() === studentSlug.toLowerCase(),
    ) || null;

  function updateStudentInStore(updated: StudentRecord) {
    setStudents((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? updated : s));
      saveStoredStudents(next);
      return next;
    });
  }

  function handleAddGuardian(e: React.FormEvent) {
    e.preventDefault();
    if (!student) return;

    if (!gName.trim() || !gPhone.trim() || !gEmail.trim()) {
      setGError("Guardian name, phone number, and email are required.");
      return;
    }

    const newGuardian: GuardianRecord = {
      id: `g-${Date.now()}`,
      name: gName.trim(),
      relationship: gRelation,
      phone: gPhone.trim(),
      email: gEmail.trim(),
      address: gAddress.trim() || student.address,
      isPrimary: false,
    };

    const updated: StudentRecord = {
      ...student,
      guardians: [...student.guardians, newGuardian],
    };

    updateStudentInStore(updated);
    setIsAddingGuardian(false);
    setGName("");
    setGPhone("");
    setGEmail("");
    setGAddress("");
    setGError("");
    setToast({
      title: "Guardian added",
      description: `${newGuardian.name} (${newGuardian.relationship}) linked to ${student.fullName}.`,
    });
  }

  if (!student) {
    return (
      <AppLayout>
        <Card>
          <CardBody>
            <EmptyState
              icon="graduation-cap"
              title="Student profile not found"
              description={`No student record matching "${studentSlug}" was found in the directory.`}
              action={
                <Link href="/dashboard/students">
                  <Button variant="primary">Back to Student Directory</Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Students", href: "/dashboard/students" },
        { label: student.fullName },
      ]}
    >
      <div className="es-stack">
        {/* Profile Header */}
        <StudentProfileHeader
          student={student}
          onEdit={() => setIsEditing(true)}
          onToggleStatus={() => {
            const nextStatus =
              student.status === "Active" ? "Inactive" : "Active";
            updateStudentInStore({ ...student, status: nextStatus });
            setToast({
              title: `Student marked as ${nextStatus}`,
              description: `${student.fullName}'s enrollment status was updated.`,
            });
          }}
          onDelete={() => setIsDeleting(true)}
        />

        {/* Profile Navigation Tabs */}
        <div>
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "academic", label: "Academic Details" },
              {
                id: "guardians",
                label: "Guardians",
                count: student.guardians.length,
              },
              { id: "attendance", label: "Attendance" },
              { id: "fees", label: "Fees" },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as ProfileTabId)}
          />
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="es-stack">
            <StudentInformationCard
              title="Student Personal Information"
              description="Identity, demographic profile, and residential address"
              fields={[
                { label: "Full Name", value: student.fullName },
                { label: "Student ID", value: student.studentId },
                { label: "Date of Birth", value: student.dateOfBirth },
                { label: "Gender", value: student.gender },
                {
                  label: "Blood Group",
                  value: student.bloodGroup || "Not specified",
                },
                { label: "Current Class", value: student.className },
                { label: "Enrollment Date", value: student.enrollmentDate },
                { label: "Residential Address", value: student.address },
              ]}
            />
          </div>
        )}

        {/* Tab 2: Academic Details */}
        {activeTab === "academic" && (
          <div className="es-stack">
            <StudentInformationCard
              title="Academic & Enrollment Details"
              description="Current grade placement, admission registry, and session information"
              fields={[
                {
                  label: "Current Academic Year",
                  value: student.academicYear,
                },
                {
                  label: "Assigned Class & Section",
                  value: student.className,
                },
                {
                  label: "Admission Number",
                  value: student.admissionNumber,
                },
                {
                  label: "Date of Enrollment",
                  value: student.enrollmentDate,
                },
                {
                  label: "Enrollment Status",
                  value: (
                    <Badge
                      variant={
                        student.status === "Active" ? "success" : "neutral"
                      }
                      dot
                    >
                      {student.status}
                    </Badge>
                  ),
                },
                {
                  label: "Medium of Instruction",
                  value: "English (CBSE Curriculum)",
                },
              ]}
            />
          </div>
        )}

        {/* Tab 3: Guardians */}
        {activeTab === "guardians" && (
          <div className="es-stack">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                    margin: 0,
                  }}
                >
                  Registered Guardians
                </h2>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--es-text-muted)",
                    margin: "2px 0 0 0",
                  }}
                >
                  Authorized parents and emergency contacts for{" "}
                  {student.fullName}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="plus" size={14} />}
                onClick={() => setIsAddingGuardian(true)}
              >
                Add Guardian
              </Button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {student.guardians.map((guardian) => (
                <GuardianCard key={guardian.id} guardian={guardian} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Attendance (UI Preview) */}
        {activeTab === "attendance" && (
          <div className="es-stack">
            <div className="es-grid-4">
              <StatCard
                label="Attendance Rate"
                value={`${student.attendanceSummary.percentage}%`}
                meta="Academic year to date"
                icon={<Icon name="clipboard-check" size={16} />}
              />
              <StatCard
                label="Present Days"
                value={student.attendanceSummary.presentDays}
                meta="Recorded present"
                icon={<Icon name="check-circle" size={16} />}
              />
              <StatCard
                label="Absent Days"
                value={student.attendanceSummary.absentDays}
                meta="Excused & unexcused"
                icon={<Icon name="alert-triangle" size={16} />}
              />
              <StatCard
                label="Late Arrivals"
                value={student.attendanceSummary.lateDays}
                meta="Morning roll call"
                icon={<Icon name="clock" size={16} />}
              />
            </div>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recent Attendance History</CardTitle>
                  <CardDescription>
                    Daily roll call log preview for {student.fullName}
                  </CardDescription>
                </div>
                <Badge variant="neutral">Attendance Preview</Badge>
              </CardHeader>
              <CardBody flush>
                <Table style={{ border: "none", borderRadius: 0 }}>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell>Class</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Remarks</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {student.attendanceSummary.history.map((rec, idx) => (
                      <TableRow key={`${rec.date}-${idx}`}>
                        <TableCell className="es-table-cell-primary">
                          {rec.date}
                        </TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              rec.status === "Present"
                                ? "success"
                                : rec.status === "Late"
                                  ? "warning"
                                  : "danger"
                            }
                            dot
                          >
                            {rec.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{rec.remarks || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab 5: Fees (Integrated with Fee Management store) */}
        {activeTab === "fees" &&
          (() => {
            const studentInvoices = feeInvoices.filter(
              (inv) =>
                inv.studentId === student.id ||
                inv.studentCode.toLowerCase() ===
                  student.studentId.toLowerCase(),
            );
            const studentPayments = feePayments.filter(
              (pay) =>
                pay.studentId === student.id ||
                pay.studentCode.toLowerCase() ===
                  student.studentId.toLowerCase(),
            );

            const hasLiveInvoices = studentInvoices.length > 0;
            const totalFees = hasLiveInvoices
              ? studentInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
              : student.feeSummary.totalFees;
            const amountPaid = hasLiveInvoices
              ? studentInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
              : student.feeSummary.amountPaid;
            const outstandingBalance = hasLiveInvoices
              ? studentInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0)
              : student.feeSummary.outstandingAmount;

            return (
              <div className="es-stack">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <StatCard
                    label="Total Fees"
                    value={formatINR(totalFees)}
                    meta={`Academic Year ${student.academicYear}`}
                    icon={<Icon name="wallet" size={16} />}
                  />
                  <StatCard
                    label="Amount Paid"
                    value={formatINR(amountPaid)}
                    meta="Verified receipts"
                    icon={<Icon name="check-circle" size={16} />}
                  />
                  <StatCard
                    label="Outstanding Balance"
                    value={formatINR(outstandingBalance)}
                    meta={
                      outstandingBalance === 0
                        ? "All dues cleared"
                        : "Pending fee balance"
                    }
                    icon={<Icon name="indian-rupee" size={16} />}
                  />
                </div>

                <PaymentSummaryCard
                  title={`Fee Summary — ${student.fullName}`}
                  totalAmount={totalFees}
                  paidAmount={amountPaid}
                  outstandingBalance={outstandingBalance}
                />

                {/* Student Invoices */}
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Student Invoices</CardTitle>
                      <CardDescription>
                        Fee invoices issued for {student.fullName}
                      </CardDescription>
                    </div>
                    <Link href="/dashboard/fees/invoices">
                      <Button variant="secondary" size="sm">
                        Manage in Fee Module
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardBody flush>
                    {studentInvoices.length === 0 ? (
                      <div style={{ padding: "20px" }}>
                        <EmptyState
                          icon="file-text"
                          title="No invoices generated yet"
                          description="Invoices created for this student in Fee Management will appear here."
                        />
                      </div>
                    ) : (
                      <Table style={{ border: "none", borderRadius: 0 }}>
                        <TableHead>
                          <tr>
                            <TableHeaderCell>Invoice ID</TableHeaderCell>
                            <TableHeaderCell>Title & Category</TableHeaderCell>
                            <TableHeaderCell>Due Date</TableHeaderCell>
                            <TableHeaderCell>Total</TableHeaderCell>
                            <TableHeaderCell>Paid</TableHeaderCell>
                            <TableHeaderCell>Balance</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                          </tr>
                        </TableHead>
                        <TableBody>
                          {studentInvoices.map((inv) => (
                            <TableRow key={inv.id}>
                              <TableCell className="es-table-cell-primary">
                                <Link
                                  href={`/dashboard/fees/invoices/${inv.id}`}
                                  style={{
                                    color: "var(--es-primary)",
                                    textDecoration: "none",
                                  }}
                                >
                                  <span className="es-code-ref">{inv.invoiceId}</span>
                                </Link>
                              </TableCell>
                              <TableCell>
                                <div style={{ fontWeight: 500 }}>
                                  {inv.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--es-text-muted)",
                                  }}
                                >
                                  {inv.category}
                                </div>
                              </TableCell>
                              <TableCell>{inv.dueDate}</TableCell>
                              <TableCell>{formatINR(inv.totalAmount)}</TableCell>
                              <TableCell
                                style={{
                                  color: "var(--es-success)",
                                  fontWeight: 500,
                                }}
                              >
                                {formatINR(inv.paidAmount)}
                              </TableCell>
                              <TableCell
                                style={{
                                  fontWeight: 600,
                                  color:
                                    inv.balanceAmount > 0
                                      ? "var(--es-warning)"
                                      : "var(--es-text-muted)",
                                }}
                              >
                                {formatINR(inv.balanceAmount)}
                              </TableCell>
                              <TableCell>
                                <FeeStatusBadge status={inv.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardBody>
                </Card>

                {/* Recent Payment History */}
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Recent Payment History</CardTitle>
                      <CardDescription>
                        Recorded receipts and installment transactions for{" "}
                        {student.fullName}
                      </CardDescription>
                    </div>
                    <Link href="/dashboard/fees/payments">
                      <Button variant="ghost" size="sm">
                        View All Payments
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardBody flush>
                    {studentPayments.length > 0 ? (
                      <Table style={{ border: "none", borderRadius: 0 }}>
                        <TableHead>
                          <tr>
                            <TableHeaderCell>Payment ID</TableHeaderCell>
                            <TableHeaderCell>Invoice ID</TableHeaderCell>
                            <TableHeaderCell>Date</TableHeaderCell>
                            <TableHeaderCell>Method</TableHeaderCell>
                            <TableHeaderCell>Reference</TableHeaderCell>
                            <TableHeaderCell>Amount Paid</TableHeaderCell>
                          </tr>
                        </TableHead>
                        <TableBody>
                          {studentPayments.map((pay) => (
                            <TableRow key={pay.id}>
                              <TableCell className="es-table-cell-primary">
                                <span className="es-code-ref">{pay.paymentId}</span>
                              </TableCell>
                              <TableCell>
                                <span className="es-code-ref">{pay.invoiceId}</span>
                              </TableCell>
                              <TableCell>{pay.paymentDate}</TableCell>
                              <TableCell>{pay.paymentMethod}</TableCell>
                              <TableCell>{pay.transactionRef || "—"}</TableCell>
                              <TableCell
                                style={{
                                  fontWeight: 600,
                                  color: "var(--es-success)",
                                }}
                              >
                                {formatINR(pay.amountPaid)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Table style={{ border: "none", borderRadius: 0 }}>
                        <TableHead>
                          <tr>
                            <TableHeaderCell>Receipt No.</TableHeaderCell>
                            <TableHeaderCell>
                              Installment Description
                            </TableHeaderCell>
                            <TableHeaderCell>Date</TableHeaderCell>
                            <TableHeaderCell>Payment Mode</TableHeaderCell>
                            <TableHeaderCell>Amount</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                          </tr>
                        </TableHead>
                        <TableBody>
                          {student.feeSummary.payments.map((pay) => (
                            <TableRow key={pay.id}>
                              <TableCell className="es-table-cell-primary">
                                <span className="es-code-ref">{pay.receiptNo}</span>
                              </TableCell>
                              <TableCell>{pay.installment}</TableCell>
                              <TableCell>{pay.date}</TableCell>
                              <TableCell>{pay.method}</TableCell>
                              <TableCell
                                style={{
                                  fontWeight: 600,
                                  color: "var(--es-text-primary)",
                                }}
                              >
                                {formatINR(pay.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    pay.status === "Paid"
                                      ? "success"
                                      : "warning"
                                  }
                                  dot
                                >
                                  {pay.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </div>
            );
          })()}
      </div>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={`Edit Student — ${student.fullName}`}
        description="Modify student profile information and save changes."
      >
        <div
          style={{ maxHeight: "72vh", overflowY: "auto", paddingRight: "4px" }}
        >
          <StudentForm
            initialStudent={student}
            onCancel={() => setIsEditing(false)}
            onSave={(updated) => {
              updateStudentInStore(updated);
              setIsEditing(false);
              setToast({
                title: "Student profile updated",
                description: `Saved changes for ${updated.fullName}.`,
              });
            }}
          />
        </div>
      </Modal>

      {/* Add Guardian Modal */}
      <Modal
        isOpen={isAddingGuardian}
        onClose={() => setIsAddingGuardian(false)}
        title="Add Guardian Contact"
        description={`Link an additional parent or guardian to ${student.fullName}.`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsAddingGuardian(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddGuardian}>
              Save Guardian
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddGuardian} className="es-stack">
          <Input
            label="Guardian Full Name *"
            placeholder="e.g. Sunita Naik"
            value={gName}
            onChange={(e) => setGName(e.target.value)}
          />
          <Select
            label="Relationship *"
            value={gRelation}
            onChange={(e) => setGRelation(e.target.value)}
            options={[
              { value: "Mother", label: "Mother" },
              { value: "Father", label: "Father" },
              { value: "Legal Guardian", label: "Legal Guardian" },
              { value: "Grandparent", label: "Grandparent" },
            ]}
          />
          <Input
            label="Phone Number *"
            placeholder="e.g. +91 98230 44556"
            value={gPhone}
            onChange={(e) => setGPhone(e.target.value)}
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. sunita.naik@example.in"
            value={gEmail}
            onChange={(e) => setGEmail(e.target.value)}
          />
          <Input
            label="Address (Optional)"
            placeholder="Defaults to student address if left blank"
            value={gAddress}
            onChange={(e) => setGAddress(e.target.value)}
          />
          {gError && (
            <div style={{ fontSize: "12px", color: "var(--es-danger)" }}>
              {gError}
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={() => {
          const next = students.filter((s) => s.id !== student.id);
          saveStoredStudents(next);
          router.push("/dashboard/students");
        }}
        title="Delete Student Record"
        description={`Are you sure you want to delete ${student.fullName} (${student.studentId})?`}
        confirmLabel="Delete Student"
        variant="danger"
      />

      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </AppLayout>
  );
}
