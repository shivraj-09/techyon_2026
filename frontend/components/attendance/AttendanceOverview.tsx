"use client";

import React from "react";
import Link from "next/link";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import type { AttendanceSessionRecord } from "@/config/attendance-data";
import { AttendanceTrendChart } from "./AttendanceTrendChart";
import { AttendanceDistributionChart } from "./AttendanceDistributionChart";

export interface AttendanceOverviewProps {
  sessions: AttendanceSessionRecord[];
  selectedDate: string;
  selectedClassId: string;
  searchQuery: string;
  onSelectSession: (session: AttendanceSessionRecord) => void;
  onSwitchToMark?: (classId?: string) => void;
}

export function AttendanceOverview({
  sessions,
  selectedDate,
  selectedClassId,
  searchQuery,
  onSelectSession,
  onSwitchToMark,
}: AttendanceOverviewProps) {
  const q = searchQuery.trim().toLowerCase();

  const filteredSessions = sessions.filter((sess) => {
    if (selectedDate && sess.date !== selectedDate) {
      return false;
    }
    if (selectedClassId !== "all" && sess.classId !== selectedClassId) {
      return false;
    }
    if (!q) return true;
    const matchesClass = sess.className.toLowerCase().includes(q);
    const matchesStudent = sess.entries.some(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.studentCode.toLowerCase().includes(q),
    );
    return matchesClass || matchesStudent;
  });

  return (
    <div className="es-stack">
      {/* Daily Class Roll-Call Snapshot */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Daily Class Attendance Snapshot ({selectedDate || "All Dates"})
            </CardTitle>
            <CardDescription>
              Summary of submitted class attendance registers. Click any row to
              inspect or edit individual student records.
            </CardDescription>
          </div>
          <Link href="/dashboard/attendance/mark">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="clipboard-check" size={14} />}
            >
              Mark Class Attendance
            </Button>
          </Link>
        </CardHeader>

        <CardBody flush>
          {filteredSessions.length === 0 ? (
            <EmptyState
              icon="calendar-check"
              title="No attendance recorded for this selection"
              description={
                q
                  ? `No students or classes matched "${searchQuery}" on ${selectedDate || "the selected date"}.`
                  : `No attendance sessions have been submitted yet for ${selectedDate}.`
              }
              action={
                onSwitchToMark ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSwitchToMark()}
                  >
                    Mark Attendance Now
                  </Button>
                ) : (
                  <Link href="/dashboard/attendance/mark">
                    <Button variant="primary" size="sm">
                      Mark Attendance Now
                    </Button>
                  </Link>
                )
              }
            />
          ) : (
            <Table style={{ border: "none", borderRadius: 0 }}>
              <TableHead>
                <tr>
                  <TableHeaderCell>Class</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>Present</TableHeaderCell>
                  <TableHeaderCell>Absent</TableHeaderCell>
                  <TableHeaderCell>Late</TableHeaderCell>
                  <TableHeaderCell>Excused</TableHeaderCell>
                  <TableHeaderCell>Attendance Rate</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredSessions.map((sess) => {
                  const isGood = sess.attendancePercentage >= 95;
                  const isMod =
                    sess.attendancePercentage >= 90 &&
                    sess.attendancePercentage < 95;
                  return (
                    <TableRow
                      key={sess.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => onSelectSession(sess)}
                    >
                      <TableCell className="es-table-cell-primary">
                        {sess.className}
                      </TableCell>
                      <TableCell>{sess.date}</TableCell>
                      <TableCell>{sess.totalStudents}</TableCell>
                      <TableCell
                        style={{ color: "var(--es-success)", fontWeight: 600 }}
                      >
                        {sess.presentCount}
                      </TableCell>
                      <TableCell
                        style={{
                          color:
                            sess.absentCount > 0
                              ? "var(--es-danger)"
                              : "var(--es-text-muted)",
                          fontWeight: sess.absentCount > 0 ? 600 : 400,
                        }}
                      >
                        {sess.absentCount}
                      </TableCell>
                      <TableCell>{sess.lateCount}</TableCell>
                      <TableCell>{sess.excusedCount}</TableCell>
                      <TableCell>
                        <div className="es-progress-cell">
                          <div className="es-progress-track">
                            <div
                              className={`es-progress-fill ${
                                isGood ? "good" : isMod ? "moderate" : "low"
                              }`}
                              style={{
                                width: `${sess.attendancePercentage}%`,
                              }}
                            />
                          </div>
                          <Badge
                            variant={
                              isGood ? "success" : isMod ? "warning" : "danger"
                            }
                            dot
                          >
                            {sess.attendancePercentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSelectSession(sess)}
                        >
                          View / Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Overview Charts Row */}
      <div className="es-dashboard-grid-main">
        <AttendanceTrendChart />
        <AttendanceDistributionChart />
      </div>
    </div>
  );
}

