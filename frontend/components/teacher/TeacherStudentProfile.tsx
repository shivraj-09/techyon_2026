"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import { ATTENDANCE_STATUS_META } from "@/config/attendance-data";
import type { TeacherStudentItem } from "@/config/teacher-data";

export interface TeacherStudentProfileProps {
  student: TeacherStudentItem;
}

export function TeacherStudentProfile({ student }: TeacherStudentProfileProps) {
  const progressTone =
    student.attendancePercentage >= 90
      ? "good"
      : student.attendancePercentage >= 75
        ? "moderate"
        : "low";

  return (
    <div className="es-stack">
      {/* Academic-Only Student Profile Header */}
      <div
        style={{
          backgroundColor: "var(--es-bg-surface)",
          border: "1px solid var(--es-border)",
          borderRadius: "var(--es-radius-lg)",
          padding: "20px 24px",
          boxShadow: "var(--es-shadow-xs)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Avatar
            name={student.fullName}
            size="lg"
            style={{ width: "56px", height: "56px", fontSize: "18px" }}
          />

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--es-text-primary)",
                  margin: 0,
                }}
              >
                {student.fullName}
              </h2>
              <Badge
                variant={student.status === "Active" ? "success" : "neutral"}
                dot
              >
                {student.status}
              </Badge>
              <Badge variant="primary">{student.className}</Badge>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "6px",
                fontSize: "13px",
                color: "var(--es-text-muted)",
              }}
            >
              <span>
                Student ID:{" "}
                <strong
                  style={{
                    fontFamily: "var(--es-font-mono)",
                    color: "var(--es-text-secondary)",
                  }}
                >
                  {student.studentId}
                </strong>
              </span>
              <span>·</span>
              <span>
                Roll No:{" "}
                <strong style={{ color: "var(--es-text-secondary)" }}>
                  {student.rollNumber}
                </strong>
              </span>
              <span>·</span>
              <span>
                Section:{" "}
                <strong style={{ color: "var(--es-text-secondary)" }}>
                  {student.section}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/teacher/students" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="md">
              Back to Students
            </Button>
          </Link>
          <Link
            href={`/teacher/classes/${student.classId}`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="primary"
              size="md"
              rightIcon={<Icon name="chevron-right" size={14} />}
            >
              View {student.className}
            </Button>
          </Link>
        </div>
      </div>

      {/* Academic & Attendance Summary */}
      <div className="es-dashboard-grid-main">
        {/* Attendance Summary Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>
                Term attendance performance across recorded sessions
              </CardDescription>
            </div>
            <Badge
              variant={
                student.attendancePercentage >= 90
                  ? "success"
                  : student.attendancePercentage >= 75
                    ? "warning"
                    : "danger"
              }
            >
              {student.attendancePercentage}% Overall
            </Badge>
          </CardHeader>

          <CardBody
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div className="es-analytics-summary">
              <div>
                <div className="es-metric-mini-label">Attendance %</div>
                <div
                  className="es-metric-mini-value"
                  style={{ color: "var(--es-primary)" }}
                >
                  {student.attendancePercentage}%
                </div>
              </div>
              <div>
                <div className="es-metric-mini-label">Present Days</div>
                <div
                  className="es-metric-mini-value"
                  style={{ color: "var(--es-success)" }}
                >
                  {student.presentDays}
                </div>
              </div>
              <div>
                <div className="es-metric-mini-label">Absent Days</div>
                <div
                  className="es-metric-mini-value"
                  style={{ color: "var(--es-danger)" }}
                >
                  {student.absentDays}
                </div>
              </div>
              <div>
                <div className="es-metric-mini-label">Late Days</div>
                <div
                  className="es-metric-mini-value"
                  style={{ color: "var(--es-warning)" }}
                >
                  {student.lateDays}
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  color: "var(--es-text-secondary)",
                  marginBottom: "6px",
                }}
              >
                <span>Cumulative Attendance Progress</span>
                <strong>{student.attendancePercentage}%</strong>
              </div>
              <div className="es-progress-track">
                <div
                  className={`es-progress-fill ${progressTone}`}
                  style={{
                    width: `${Math.min(100, student.attendancePercentage)}%`,
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Academic & Guardian Info (No financial data) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Academic &amp; Guardian Details</CardTitle>
              <CardDescription>
                Scoped student information for classroom coordination
              </CardDescription>
            </div>
          </CardHeader>

          <CardBody
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div>
                <div className="es-metric-mini-label">Class &amp; Section</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {student.className} (Sec {student.section})
                </div>
              </div>

              <div>
                <div className="es-metric-mini-label">Gender</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {student.gender}
                </div>
              </div>

              <div>
                <div className="es-metric-mini-label">Primary Guardian</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {student.guardianName}
                </div>
              </div>

              <div>
                <div className="es-metric-mini-label">Guardian Contact</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {student.guardianPhone}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "6px",
                padding: "10px 12px",
                borderRadius: "var(--es-radius-md)",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
                fontSize: "12px",
                color: "var(--es-text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Icon name="info" size={14} />
              <span>
                Teacher view displays academic and attendance records only.
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Attendance History Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Attendance History</CardTitle>
            <CardDescription>
              Last {student.recentAttendance.length} recorded attendance dates
              for {student.fullName}
            </CardDescription>
          </div>
          <Link
            href={`/teacher/attendance?classId=${student.classId}`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="calendar-check" size={14} />}
            >
              Open Class Register
            </Button>
          </Link>
        </CardHeader>

        <CardBody flush>
          {student.recentAttendance.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No attendance history yet"
              description="Attendance entries for this student will appear once daily sessions are submitted."
            />
          ) : (
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
                {student.recentAttendance.map((entry) => {
                  const meta = ATTENDANCE_STATUS_META[entry.status];
                  return (
                    <TableRow key={entry.date}>
                      <TableCell className="es-table-cell-primary">
                        {entry.date}
                      </TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell>
                        <Badge variant={meta.badgeVariant} dot>
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ color: "var(--es-text-muted)" }}>
                        {entry.remarks || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

