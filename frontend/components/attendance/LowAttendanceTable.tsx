"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import { LOW_ATTENDANCE_STUDENTS } from "@/config/attendance-data";

export function LowAttendanceTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Students with Low Attendance (&lt; 75%)</CardTitle>
          <CardDescription>
            Students requiring guardian follow-up due to cumulative absences
          </CardDescription>
        </div>
        <Badge variant="danger" dot>
          {LOW_ATTENDANCE_STUDENTS.length} Students Flagged
        </Badge>
      </CardHeader>

      <CardBody flush>
        <Table style={{ border: "none", borderRadius: 0 }}>
          <TableHead>
            <tr>
              <TableHeaderCell>Student Name</TableHeaderCell>
              <TableHeaderCell>Student ID</TableHeaderCell>
              <TableHeaderCell>Class</TableHeaderCell>
              <TableHeaderCell>Attendance Percentage</TableHeaderCell>
              <TableHeaderCell>Days Absent</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {LOW_ATTENDANCE_STUDENTS.map((stu) => (
              <TableRow key={stu.id}>
                <TableCell className="es-table-cell-primary">
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Avatar name={stu.fullName} size="sm" />
                    <Link
                      href={`/dashboard/students/${stu.id}`}
                      style={{
                        color: "var(--es-text-primary)",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      {stu.fullName}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <code
                    style={{
                      fontFamily: "var(--es-font-mono)",
                      fontSize: "12px",
                    }}
                  >
                    {stu.studentId}
                  </code>
                </TableCell>
                <TableCell>{stu.className}</TableCell>
                <TableCell>
                  <div className="es-progress-cell">
                    <div className="es-progress-track">
                      <div
                        className="es-progress-fill low"
                        style={{ width: `${stu.attendancePercentage}%` }}
                      />
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "12.5px",
                        color: "var(--es-danger)",
                      }}
                    >
                      {stu.attendancePercentage.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <strong style={{ color: "var(--es-danger)" }}>
                    {stu.daysAbsent} days
                  </strong>{" "}
                  <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                    / {stu.totalDays}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={stu.status === "Critical" ? "danger" : "warning"}
                    dot
                  >
                    {stu.status === "Critical"
                      ? "Critical (< 70%)"
                      : "Below Threshold"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}

