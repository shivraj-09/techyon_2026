"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
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
} from "@/components/ui";
import {
  TEACHER_ASSIGNED_CLASSES,
  TEACHER_STUDENTS,
  type TeacherStudentItem,
} from "@/config/teacher-data";

export interface TeacherStudentTableProps {
  students?: TeacherStudentItem[];
  showFilters?: boolean;
  showClassFilter?: boolean;
  onClearExternalFilters?: () => void;
}

export function TeacherStudentTable({
  students = TEACHER_STUDENTS,
  showFilters = true,
  showClassFilter = true,
  onClearExternalFilters,
}: TeacherStudentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      if (
        showClassFilter &&
        classFilter !== "all" &&
        student.classId !== classFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        student.fullName.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q) ||
        student.guardianName.toLowerCase().includes(q) ||
        student.className.toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery, classFilter, showClassFilter]);

  const hasLocalFilters =
    Boolean(searchQuery.trim()) || (showClassFilter && classFilter !== "all");

  function handleClear() {
    setSearchQuery("");
    setClassFilter("all");
    onClearExternalFilters?.();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {showFilters && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--es-bg-app)",
            borderBottom: "1px solid var(--es-border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
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
            <div style={{ width: "260px", maxWidth: "100%" }}>
              <Input
                aria-label="Search students"
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Icon name="search" size={14} />}
              />
            </div>

            {showClassFilter && (
              <Select
                aria-label="Filter by assigned class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                style={{ width: "180px" }}
                options={[
                  { value: "all", label: "All Assigned Classes" },
                  ...TEACHER_ASSIGNED_CLASSES.map((cls) => ({
                    value: cls.id,
                    label: cls.name,
                  })),
                ]}
              />
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
              Showing {filteredStudents.length} of {students.length} students
            </span>
            {hasLocalFilters && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {filteredStudents.length === 0 ? (
        <EmptyState
          icon="graduation-cap"
          title="No matching students found"
          description="No students in your assigned classes match the current search or class filter."
          action={
            hasLocalFilters || onClearExternalFilters ? (
              <Button variant="secondary" size="sm" onClick={handleClear}>
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table style={{ border: "none", borderRadius: 0 }}>
          <TableHead>
            <tr>
              <TableHeaderCell>Student</TableHeaderCell>
              <TableHeaderCell>Student ID</TableHeaderCell>
              <TableHeaderCell>Class</TableHeaderCell>
              <TableHeaderCell>Guardian Contact</TableHeaderCell>
              <TableHeaderCell>Attendance %</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell style={{ textAlign: "right" }}>
                Profile
              </TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => {
              const tone =
                student.attendancePercentage >= 90
                  ? "good"
                  : student.attendancePercentage >= 75
                    ? "moderate"
                    : "low";

              return (
                <TableRow key={student.id}>
                  <TableCell className="es-table-cell-primary">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Avatar name={student.fullName} size="md" />
                      <div>
                        <Link
                          href={`/teacher/students/${student.id}`}
                          style={{
                            fontWeight: 600,
                            color: "var(--es-text-primary)",
                            textDecoration: "none",
                            fontSize: "13.5px",
                          }}
                        >
                          {student.fullName}
                        </Link>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          Roll No. {student.rollNumber} · {student.gender}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <code
                      style={{
                        fontFamily: "var(--es-font-mono)",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--es-text-secondary)",
                        backgroundColor: "var(--es-bg-subtle)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {student.studentId}
                    </code>
                  </TableCell>

                  <TableCell>
                    <Badge variant="primary">{student.className}</Badge>
                  </TableCell>

                  <TableCell>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--es-text-primary)",
                      }}
                    >
                      {student.guardianName}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      {student.guardianPhone}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="es-progress-cell">
                      <div className="es-progress-track">
                        <div
                          className={`es-progress-fill ${tone}`}
                          style={{
                            width: `${Math.min(
                              100,
                              student.attendancePercentage,
                            )}%`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color:
                            student.attendancePercentage < 75
                              ? "var(--es-danger)"
                              : "var(--es-text-primary)",
                          minWidth: "38px",
                        }}
                      >
                        {student.attendancePercentage}%
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        student.status === "Active" ? "success" : "neutral"
                      }
                      dot
                    >
                      {student.status}
                    </Badge>
                  </TableCell>

                  <TableCell style={{ textAlign: "right" }}>
                    <Link
                      href={`/teacher/students/${student.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<Icon name="chevron-right" size={14} />}
                      >
                        View Profile
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

