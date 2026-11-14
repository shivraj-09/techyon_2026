"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  type BadgeVariant,
} from "@/components/ui";
import {
  ChildAttendanceCalendar,
  ChildSelector,
} from "@/components/parent";
import {
  PARENT_CHILDREN,
  getSelectedChildId,
  saveSelectedChildId,
  type ParentAttendanceStatus,
  type ParentChildRecord,
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

export default function ParentAttendancePage() {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    PARENT_CHILDREN[0]?.id ?? "stu-1024",
  );
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setSelectedChildId(getSelectedChildId());
  }, []);

  const selectedChild: ParentChildRecord = useMemo(
    () =>
      PARENT_CHILDREN.find((c) => c.id === selectedChildId) ??
      PARENT_CHILDREN[0],
    [selectedChildId],
  );

  const filteredHistory = useMemo(
    () =>
      selectedChild.attendanceHistory.filter((row) => {
        if (fromDate && row.date < fromDate) return false;
        if (toDate && row.date > toDate) return false;
        if (statusFilter !== "all" && row.status !== statusFilter) return false;
        return true;
      }),
    [selectedChild, fromDate, toDate, statusFilter],
  );

  function handleSelectChild(childId: string) {
    setSelectedChildId(childId);
    saveSelectedChildId(childId);
  }

  const statCards = [
    {
      label: "Attendance Percentage",
      value: `${selectedChild.attendancePercentage.toFixed(1)}%`,
      icon: "calendar-check" as const,
      color: "var(--es-primary)",
      bg: "var(--es-primary-subtle)",
      border: "var(--es-primary-border)",
    },
    {
      label: "Present",
      value: selectedChild.presentDays,
      icon: "check-circle" as const,
      color: "var(--es-success)",
      bg: "var(--es-success-bg)",
      border: "var(--es-success-border)",
    },
    {
      label: "Absent",
      value: selectedChild.absentDays,
      icon: "alert-triangle" as const,
      color: "var(--es-danger)",
      bg: "var(--es-danger-bg)",
      border: "var(--es-danger-border)",
    },
    {
      label: "Late",
      value: selectedChild.lateDays,
      icon: "clock" as const,
      color: "var(--es-warning)",
      bg: "var(--es-warning-bg)",
      border: "var(--es-warning-border)",
    },
    {
      label: "Excused",
      value: selectedChild.excusedDays,
      icon: "info" as const,
      color: "var(--es-primary)",
      bg: "var(--es-bg-subtle)",
      border: "var(--es-border)",
    },
  ];

  return (
    <AppLayout
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "Attendance" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Attendance"
          subtitle="Track your children's attendance and daily school participation."
          actions={<Badge variant="neutral">Read-Only View</Badge>}
        />

        <ChildSelector
          childrenList={PARENT_CHILDREN}
          selectedChildId={selectedChild.id}
          onSelectChild={handleSelectChild}
          label="Viewing Attendance For:"
        />

        {/* 5 Attendance Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: "12px",
          }}
        >
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardBody
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--es-text-muted)",
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: card.color,
                      lineHeight: 1.15,
                    }}
                  >
                    {card.value}
                  </div>
                </div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "var(--es-radius-md)",
                    backgroundColor: card.bg,
                    border: `1px solid ${card.border}`,
                    color: card.color,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={card.icon} size={18} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Interactive Monthly Calendar */}
        <ChildAttendanceCalendar child={selectedChild} initialMonth="2026-11" />

        {/* Read-Only Attendance History Table with Date Filters */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                Attendance History — {selectedChild.fullName}
              </CardTitle>
              <CardDescription>
                {selectedChild.className} · Showing {filteredHistory.length}{" "}
                recorded school days
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

            {filteredHistory.length === 0 ? (
              <EmptyState
                icon="calendar-check"
                title="No attendance records match your filters"
                description="Try clearing or adjusting the date range and status filter."
              />
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Class</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Remarks</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((row) => {
                    const badge = STATUS_BADGE_MAP[row.status];
                    return (
                      <TableRow key={row.date}>
                        <TableCell className="es-table-cell-primary">
                          <span style={{ fontFamily: "var(--es-font-mono)" }}>
                            {row.date}
                          </span>
                        </TableCell>
                        <TableCell>{selectedChild.fullName}</TableCell>
                        <TableCell>{selectedChild.className}</TableCell>
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
    </AppLayout>
  );
}

