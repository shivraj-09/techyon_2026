"use client";

import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import {
  ATTENDANCE_CLASSES,
  type AttendanceSessionRecord,
} from "@/config/attendance-data";

export interface AttendanceHistoryTableProps {
  sessions: AttendanceSessionRecord[];
  onSelectSession: (session: AttendanceSessionRecord) => void;
}

const PAGE_SIZE = 6;

export function AttendanceHistoryTable({
  sessions,
  onSelectSession,
}: AttendanceHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((sess) => {
      if (classFilter !== "all" && sess.classId !== classFilter) {
        return false;
      }
      if (dateFilter && sess.date !== dateFilter) {
        return false;
      }
      if (levelFilter === "high" && sess.attendancePercentage < 95) {
        return false;
      }
      if (
        levelFilter === "moderate" &&
        (sess.attendancePercentage < 90 || sess.attendancePercentage >= 95)
      ) {
        return false;
      }
      if (levelFilter === "low" && sess.attendancePercentage >= 90) {
        return false;
      }
      if (!q) return true;
      return (
        sess.className.toLowerCase().includes(q) ||
        sess.date.toLowerCase().includes(q) ||
        sess.submittedBy.toLowerCase().includes(q)
      );
    });
  }, [sessions, searchQuery, classFilter, dateFilter, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function clearFilters() {
    setSearchQuery("");
    setClassFilter("all");
    setDateFilter("");
    setLevelFilter("all");
    setPage(1);
  }

  function getPctVariant(pct: number): {
    barClass: "good" | "moderate" | "low";
    badgeVariant: "success" | "warning" | "danger";
  } {
    if (pct >= 95) return { barClass: "good", badgeVariant: "success" };
    if (pct >= 90) return { barClass: "moderate", badgeVariant: "warning" };
    return { barClass: "low", badgeVariant: "danger" };
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Attendance History Register</CardTitle>
          <CardDescription>
            Historical daily roll call records by class section and date. Click
            any record to inspect or edit individual student statuses.
          </CardDescription>
        </div>
      </CardHeader>

      {/* Filters Toolbar */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--es-border-subtle)",
          backgroundColor: "var(--es-bg-app)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            flex: 1,
          }}
        >
          <div className="es-input-wrapper" style={{ width: "230px" }}>
            <span className="es-input-icon-left">
              <Icon name="search" size={14} />
            </span>
            <input
              type="search"
              className="es-input has-left-icon"
              placeholder="Search class or date..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            aria-label="Filter history by class"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: "165px" }}
            options={[
              { value: "all", label: "All Classes" },
              ...ATTENDANCE_CLASSES.filter((c) => c.totalStudents > 0).map(
                (c) => ({
                  value: c.id,
                  label: c.name,
                }),
              ),
            ]}
          />

          <input
            type="date"
            className="es-input"
            style={{ width: "155px" }}
            aria-label="Filter history by date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          />

          <Select
            aria-label="Filter by attendance threshold"
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: "175px" }}
            options={[
              { value: "all", label: "All Attendance Rates" },
              { value: "high", label: "Good (≥ 95%)" },
              { value: "moderate", label: "Moderate (90% – 94.9%)" },
              { value: "low", label: "Low (< 90%)" },
            ]}
          />
        </div>

        {(searchQuery ||
          classFilter !== "all" ||
          dateFilter ||
          levelFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <CardBody flush>
        {paginatedSessions.length === 0 ? (
          <EmptyState
            icon="calendar-check"
            title="No attendance records found"
            description="No historical attendance sessions match your selected date, class, or search filters."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Reset Filters
              </Button>
            }
          />
        ) : (
          <Table style={{ border: "none", borderRadius: 0 }}>
            <TableHead>
              <tr>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Class</TableHeaderCell>
                <TableHeaderCell>Total Students</TableHeaderCell>
                <TableHeaderCell>Present</TableHeaderCell>
                <TableHeaderCell>Absent</TableHeaderCell>
                <TableHeaderCell>Late</TableHeaderCell>
                <TableHeaderCell>Excused</TableHeaderCell>
                <TableHeaderCell>Attendance Percentage</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {paginatedSessions.map((session) => {
                const { barClass, badgeVariant } = getPctVariant(
                  session.attendancePercentage,
                );
                return (
                  <TableRow
                    key={session.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectSession(session)}
                  >
                    <TableCell>
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {session.date}
                      </span>
                    </TableCell>
                    <TableCell className="es-table-cell-primary">
                      {session.className}
                    </TableCell>
                    <TableCell>{session.totalStudents}</TableCell>
                    <TableCell
                      style={{ color: "var(--es-success)", fontWeight: 600 }}
                    >
                      {session.presentCount}
                    </TableCell>
                    <TableCell
                      style={{
                        color:
                          session.absentCount > 0
                            ? "var(--es-danger)"
                            : "var(--es-text-muted)",
                        fontWeight: session.absentCount > 0 ? 600 : 400,
                      }}
                    >
                      {session.absentCount}
                    </TableCell>
                    <TableCell
                      style={{
                        color:
                          session.lateCount > 0
                            ? "var(--es-warning)"
                            : "var(--es-text-muted)",
                      }}
                    >
                      {session.lateCount}
                    </TableCell>
                    <TableCell>{session.excusedCount}</TableCell>
                    <TableCell>
                      <div className="es-progress-cell">
                        <div className="es-progress-track">
                          <div
                            className={`es-progress-fill ${barClass}`}
                            style={{ width: `${session.attendancePercentage}%` }}
                          />
                        </div>
                        <Badge variant={badgeVariant} dot>
                          {session.attendancePercentage.toFixed(1)}%
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
                        onClick={() => onSelectSession(session)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardBody>

      <CardFooter>
        <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
          Showing {paginatedSessions.length} of {filteredSessions.length} records
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span style={{ fontSize: "12.5px", fontWeight: 500 }}>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
