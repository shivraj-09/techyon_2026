"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
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
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  type BadgeVariant,
} from "@/components/ui";
import { PriorityBadge } from "@/components/announcements";
import {
  ChildAttendanceCalendar,
  ChildAttendanceSummary,
  ChildProfileHeader,
  ParentFeeSummary,
  ParentInvoiceTable,
} from "@/components/parent";
import { formatINR } from "@/config/fee-data";
import {
  PARENT_ANNOUNCEMENTS,
  PARENT_INVOICES,
  PARENT_PAYMENTS,
  getParentChildById,
  type ParentAttendanceStatus,
} from "@/config/parent-data";

const STATUS_BADGE_MAP: Record<
  ParentAttendanceStatus,
  { label: string; variant: BadgeVariant }
> = {
  present: { label: "Present", variant: "success" },
  absent: { label: "Absent", variant: "danger" },
  late: { label: "Late", variant: "warning" },
  excused: { label: "Excused", variant: "primary" },
};

export default function ParentChildProfilePage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params?.studentId || "";

  const child = useMemo(() => getParentChildById(studentId), [studentId]);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const childInvoices = useMemo(
    () =>
      child
        ? PARENT_INVOICES.filter((inv) => inv.studentId === child.id)
        : [],
    [child],
  );

  const childPayments = useMemo(
    () =>
      child
        ? PARENT_PAYMENTS.filter((pay) => pay.studentId === child.id)
        : [],
    [child],
  );

  const relevantAnnouncements = useMemo(() => {
    if (!child) return [];
    return PARENT_ANNOUNCEMENTS.filter(
      (ann) =>
        ann.category === "School Updates" || ann.childName === child.fullName,
    ).slice(0, 3);
  }, [child]);

  const filteredAttendanceHistory = useMemo(() => {
    if (!child) return [];
    return child.attendanceHistory.filter((row) => {
      if (fromDate && row.date < fromDate) return false;
      if (toDate && row.date > toDate) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return true;
    });
  }, [child, fromDate, toDate, statusFilter]);

  if (!child) {
    return (
      <AppLayout
        defaultRole="parent"
        breadcrumbs={[
          { label: "Parent", href: "/parent/dashboard" },
          { label: "My Children", href: "/parent/children" },
          { label: "Not Found" },
        ]}
      >
        <Card>
          <CardBody>
            <EmptyState
              icon="users"
              title="Student not found in your linked children"
              description="Parents can view academic, attendance, and fee information only for students linked to their guardian account."
              action={
                <Link href="/parent/children" style={{ textDecoration: "none" }}>
                  <Button variant="primary">Back to My Children</Button>
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
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "My Children", href: "/parent/children" },
        { label: child.fullName },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title={child.fullName}
          subtitle={`${child.studentId} · ${child.className} · Academic Year ${child.academicYear}`}
          actions={
            <Link href="/parent/children" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="md">
                Back to My Children
              </Button>
            </Link>
          }
        />

        <ChildProfileHeader child={child} />

        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "attendance", label: "Attendance" },
            { id: "fees", label: "Fee Details", count: childInvoices.length },
          ]}
        />

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="es-stack">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Student &amp; Academic Information</CardTitle>
                    <CardDescription>
                      Verified school enrollment details (Read-only)
                    </CardDescription>
                  </div>
                  <Badge variant="success" dot>
                    {child.enrollmentStatus}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div className="es-metric-mini-label">Student ID</div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontFamily: "var(--es-font-mono)",
                          marginTop: "4px",
                        }}
                      >
                        {child.studentId}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Current Class</div>
                      <div style={{ fontWeight: 600, marginTop: "4px" }}>
                        {child.className}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Roll Number</div>
                      <div style={{ fontWeight: 600, marginTop: "4px" }}>
                        {child.rollNumber}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Academic Year</div>
                      <div style={{ fontWeight: 600, marginTop: "4px" }}>
                        {child.academicYear}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Enrollment Date</div>
                      <div style={{ fontWeight: 600, marginTop: "4px" }}>
                        {child.enrollmentDate}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Class Teacher</div>
                      <div style={{ fontWeight: 600, marginTop: "4px" }}>
                        {child.classTeacher}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Date of Birth</div>
                      <div style={{ fontWeight: 600, marginTop: "4px" }}>
                        {child.dateOfBirth}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Blood Group</div>
                      <div style={{ fontWeight: 600, marginTop: "4px" }}>
                        {child.bloodGroup}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Attendance %</div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--es-success)",
                          marginTop: "4px",
                        }}
                      >
                        {child.attendancePercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Recent School Announcements</CardTitle>
                    <CardDescription>
                      Notices applicable to {child.fullName} and{" "}
                      {child.className}
                    </CardDescription>
                  </div>
                  <Link
                    href="/parent/announcements"
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardBody
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {relevantAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      style={{
                        padding: "12px",
                        borderRadius: "var(--es-radius-md)",
                        border: "1px solid var(--es-border-subtle)",
                        backgroundColor: "var(--es-bg-app)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <PriorityBadge priority={ann.priority} />
                        <span
                          style={{
                            fontSize: "11.5px",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          {ann.publishedDate}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {ann.title}
                      </div>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "12.5px",
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        {ann.shortDescription}
                      </p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance */}
        {activeTab === "attendance" && (
          <div className="es-stack">
            <ChildAttendanceSummary child={child} showChart />

            <ChildAttendanceCalendar child={child} initialMonth="2026-11" />

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Attendance Records — {child.fullName}</CardTitle>
                  <CardDescription>
                    Read-only daily attendance log ({filteredAttendanceHistory.length}{" "}
                    records)
                  </CardDescription>
                </div>
                <Badge variant="neutral">Read-Only</Badge>
              </CardHeader>
              <CardBody>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: "12px",
                    marginBottom: "16px",
                    alignItems: "end",
                  }}
                >
                  <Input
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <Input
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <Select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "present", label: "Present" },
                      { value: "absent", label: "Absent" },
                      { value: "late", label: "Late" },
                      { value: "excused", label: "Excused" },
                    ]}
                  />
                  <div>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>

                {filteredAttendanceHistory.length === 0 ? (
                  <EmptyState
                    icon="calendar-check"
                    title="No attendance records match your filters"
                    description="Adjust or clear the date range and status filters to view attendance history."
                  />
                ) : (
                  <Table>
                    <TableHead>
                      <tr>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Class</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Remarks</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {filteredAttendanceHistory.map((row) => {
                        const badge = STATUS_BADGE_MAP[row.status];
                        return (
                          <TableRow key={row.date}>
                            <TableCell className="es-table-cell-primary">
                              <span style={{ fontFamily: "var(--es-font-mono)" }}>
                                {row.date}
                              </span>
                            </TableCell>
                            <TableCell>{child.className}</TableCell>
                            <TableCell>
                              <Badge variant={badge.variant} dot>
                                {badge.label}
                              </Badge>
                            </TableCell>
                            <TableCell>{row.remarks}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab 3: Fee Details */}
        {activeTab === "fees" && (
          <div className="es-stack">
            <ParentFeeSummary
              totalFees={child.totalFees}
              amountPaid={child.amountPaid}
              outstandingBalance={child.outstandingBalance}
              nextDueDate={child.nextDueDate}
              childName={child.fullName}
              title={`Fee Summary — ${child.fullName}`}
            />

            <ParentInvoiceTable
              invoices={childInvoices}
              payments={childPayments}
              emptyTitle={`No invoices for ${child.fullName}`}
              emptyDescription="There are no fee invoices recorded for this student."
            />

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Payment History — {child.fullName}</CardTitle>
                  <CardDescription>
                    Verified fee receipts recorded by school accounts (
                    {childPayments.length})
                  </CardDescription>
                </div>
                <Badge variant="neutral">Read-Only</Badge>
              </CardHeader>
              <CardBody flush>
                {childPayments.length === 0 ? (
                  <EmptyState
                    icon="credit-card"
                    title="No payments recorded yet"
                    description="Fee receipts for this student will appear here once processed by the school accounts office."
                  />
                ) : (
                  <Table style={{ border: "none", borderRadius: 0 }}>
                    <TableHead>
                      <tr>
                        <TableHeaderCell>Payment ID</TableHeaderCell>
                        <TableHeaderCell>Invoice ID</TableHeaderCell>
                        <TableHeaderCell>Payment Date</TableHeaderCell>
                        <TableHeaderCell>Method</TableHeaderCell>
                        <TableHeaderCell>Reference</TableHeaderCell>
                        <TableHeaderCell>Amount Paid</TableHeaderCell>
                        <TableHeaderCell>Remarks</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {childPayments.map((pay) => (
                        <TableRow key={pay.id}>
                          <TableCell className="es-table-cell-primary">
                            <span style={{ fontFamily: "var(--es-font-mono)" }}>
                              {pay.paymentId}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span style={{ fontFamily: "var(--es-font-mono)" }}>
                              {pay.invoiceId}
                            </span>
                          </TableCell>
                          <TableCell>{pay.paymentDate}</TableCell>
                          <TableCell>{pay.paymentMethod}</TableCell>
                          <TableCell>
                            <span
                              style={{
                                fontFamily: "var(--es-font-mono)",
                                fontSize: "12px",
                              }}
                            >
                              {pay.transactionRef}
                            </span>
                          </TableCell>
                          <TableCell
                            style={{ fontWeight: 600, color: "var(--es-success)" }}
                          >
                            {formatINR(pay.amountPaid)}
                          </TableCell>
                          <TableCell>{pay.remarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

