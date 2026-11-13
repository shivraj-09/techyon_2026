"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
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
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  AttendanceStatusSelector,
  AttendanceSummary,
} from "@/components/attendance";
import type {
  AttendanceEntryRecord,
  AttendanceStatus,
  UnmarkedOrStatus,
} from "@/config/attendance-data";
import {
  TEACHER_ASSIGNED_CLASSES,
  TEACHER_PROFILE,
  getStoredTeacherAttendance,
  getTeacherClassRosterEntries,
  saveStoredTeacherAttendance,
  type TeacherAttendanceSessionRecord,
  type TeacherStudentItem,
} from "@/config/teacher-data";

export interface TeacherAttendanceWorkspaceProps {
  initialClassId?: string;
  initialDate?: string;
  onSessionSaved?: (session: TeacherAttendanceSessionRecord) => void;
}

const DEFAULT_ATTENDANCE_DATE = "2026-11-13";

function resolveAssignedClassId(candidate?: string): string {
  if (
    candidate &&
    TEACHER_ASSIGNED_CLASSES.some((cls) => cls.id === candidate)
  ) {
    return candidate;
  }
  return "class-9-a";
}

export function TeacherAttendanceWorkspace({
  initialClassId,
  initialDate = DEFAULT_ATTENDANCE_DATE,
  onSessionSaved,
}: TeacherAttendanceWorkspaceProps) {
  const resolvedInitialClassId = resolveAssignedClassId(initialClassId);

  const [selectedClassId, setSelectedClassId] = useState(
    resolvedInitialClassId,
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [loadedClassId, setLoadedClassId] = useState(resolvedInitialClassId);
  const [loadedDate, setLoadedDate] = useState(initialDate);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  const [entries, setEntries] = useState<AttendanceEntryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UnmarkedOrStatus>(
    "all",
  );
  const [validationError, setValidationError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [existingSubmission, setExistingSubmission] =
    useState<TeacherAttendanceSessionRecord | null>(null);
  const [submittedRecord, setSubmittedRecord] =
    useState<TeacherAttendanceSessionRecord | null>(null);
  const [recentSessions, setRecentSessions] = useState<
    TeacherAttendanceSessionRecord[]
  >([]);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const currentClassMeta = useMemo(
    () =>
      TEACHER_ASSIGNED_CLASSES.find((cls) => cls.id === loadedClassId) ||
      TEACHER_ASSIGNED_CLASSES[0],
    [loadedClassId],
  );

  const loadRoster = useCallback((targetClassId: string, targetDate: string) => {
    setIsLoadingRoster(true);
    setValidationError("");
    setSubmittedRecord(null);

    setTimeout(() => {
      const sessions = getStoredTeacherAttendance();
      setRecentSessions(sessions);

      const foundSession =
        sessions.find(
          (s) => s.classId === targetClassId && s.date === targetDate,
        ) || null;

      setExistingSubmission(
        foundSession && foundSession.status === "Submitted"
          ? foundSession
          : null,
      );

      if (foundSession && foundSession.entries.length > 0) {
        setEntries(foundSession.entries.map((entry) => ({ ...entry })));
      } else {
        const freshRoster = getTeacherClassRosterEntries(
          targetClassId as TeacherStudentItem["classId"],
          targetDate,
        );
        setEntries(freshRoster);
      }

      setLoadedClassId(targetClassId);
      setLoadedDate(targetDate);
      setIsLoadingRoster(false);
    }, 160);
  }, []);

  useEffect(() => {
    const nextClass = resolveAssignedClassId(initialClassId);
    setSelectedClassId(nextClass);
    setSelectedDate(initialDate);
    loadRoster(nextClass, initialDate);
  }, [initialClassId, initialDate, loadRoster]);

  function handleStatusChange(studentId: string, status: AttendanceStatus) {
    setValidationError("");
    setEntries((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, status } : item,
      ),
    );
  }

  function handleRemarksChange(studentId: string, remarks: string) {
    setEntries((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, remarks } : item,
      ),
    );
  }

  function handleMarkAllPresent() {
    setValidationError("");
    setEntries((prev) =>
      prev.map((item) => ({ ...item, status: "present" })),
    );
  }

  function handleReset() {
    setValidationError("");
    setSubmittedRecord(null);
    setEntries((prev) =>
      prev.map((item) => ({ ...item, status: "unmarked", remarks: "" })),
    );
  }

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      if (statusFilter !== "all" && entry.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        entry.fullName.toLowerCase().includes(q) ||
        entry.studentCode.toLowerCase().includes(q)
      );
    });
  }, [entries, searchQuery, statusFilter]);

  function handleAttemptSubmit() {
    if (entries.length === 0) return;
    const unmarkedCount = entries.filter(
      (entry) => entry.status === "unmarked",
    ).length;

    if (unmarkedCount > 0) {
      setValidationError(
        `Please mark attendance for all students before submitting. ${unmarkedCount} student${
          unmarkedCount === 1 ? " is" : "s are"
        } still unmarked.`,
      );
      return;
    }

    setValidationError("");
    setIsConfirmOpen(true);
  }

  function handleConfirmSubmit() {
    const totalStudents = entries.length;
    const presentCount = entries.filter((e) => e.status === "present").length;
    const absentCount = entries.filter((e) => e.status === "absent").length;
    const lateCount = entries.filter((e) => e.status === "late").length;
    const excusedCount = entries.filter((e) => e.status === "excused").length;

    const attendancePercentage =
      totalStudents > 0
        ? Number(((presentCount / totalStudents) * 100).toFixed(1))
        : 0;

    const newSession: TeacherAttendanceSessionRecord = {
      id: existingSubmission?.id || `t-att-${loadedClassId}-${loadedDate}`,
      classId: loadedClassId,
      className: currentClassMeta.name,
      section: currentClassMeta.section,
      subject: currentClassMeta.subject,
      date: loadedDate,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
      submittedBy: TEACHER_PROFILE.name,
      submittedAt: "Just now",
      status: "Submitted",
      entries: entries.map((e) => ({ ...e })),
    };

    const existingList = getStoredTeacherAttendance();
    const otherSessions = existingList.filter(
      (s) => !(s.classId === loadedClassId && s.date === loadedDate),
    );
    const updatedList = [newSession, ...otherSessions];
    saveStoredTeacherAttendance(updatedList);

    setRecentSessions(updatedList);
    setExistingSubmission(newSession);
    setSubmittedRecord(newSession);
    setIsConfirmOpen(false);
    setToast({
      title: "Attendance submitted successfully",
      description: `Saved roll call for ${currentClassMeta.name} (${loadedDate}).`,
    });
    onSessionSaved?.(newSession);
  }

  return (
    <div className="es-stack">
      {/* Class & Date Selection */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Select Assigned Class &amp; Date</CardTitle>
            <CardDescription>
              Load student roster for one of your 4 assigned classes to mark or
              update daily attendance
            </CardDescription>
          </div>

          {existingSubmission ? (
            <Badge variant="success" dot>
              Submitted ({existingSubmission.submittedAt})
            </Badge>
          ) : (
            <Badge variant="warning" dot>
              Pending Submission
            </Badge>
          )}
        </CardHeader>

        <CardBody>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
              alignItems: "end",
            }}
          >
            <Select
              label="Assigned Class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={TEACHER_ASSIGNED_CLASSES.map((cls) => ({
                value: cls.id,
                label: `${cls.name} — ${cls.subject} (${cls.studentCount} students)`,
              }))}
            />

            <div className="es-field">
              <label className="es-label" htmlFor="es-teacher-att-date">
                Attendance Date
              </label>
              <input
                id="es-teacher-att-date"
                type="date"
                className="es-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Icon name="users" size={15} />}
                onClick={() => loadRoster(selectedClassId, selectedDate)}
              >
                Load Roster
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Submitted Confirmation Banner */}
      {submittedRecord && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            padding: "14px 18px",
            backgroundColor: "var(--es-success-bg)",
            border: "1px solid var(--es-success-border)",
            borderRadius: "var(--es-radius-lg)",
            color: "var(--es-success)",
            flexWrap: "wrap",
          }}
          role="status"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Icon name="check-circle" size={18} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "13.5px" }}>
                Attendance Submitted for {submittedRecord.className} (
                {submittedRecord.date})
              </div>
              <div style={{ fontSize: "12.5px", opacity: 0.9 }}>
                Present: {submittedRecord.presentCount} · Absent:{" "}
                {submittedRecord.absentCount} · Late:{" "}
                {submittedRecord.lateCount} · Excused:{" "}
                {submittedRecord.excusedCount} (
                {submittedRecord.attendancePercentage}% present)
              </div>
            </div>
          </div>
          <Badge variant="success">Updated in Register</Badge>
        </div>
      )}

      {/* Validation Alert */}
      {validationError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: "var(--es-danger-bg)",
            border: "1px solid var(--es-danger-border)",
            borderRadius: "var(--es-radius-md)",
            color: "var(--es-danger)",
            fontSize: "13px",
            fontWeight: 500,
          }}
          role="alert"
        >
          <Icon name="alert-triangle" size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Roster Marking Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Student Roster — {currentClassMeta.name} ({loadedDate})
            </CardTitle>
            <CardDescription>
              {currentClassMeta.subject} · {currentClassMeta.room} ·{" "}
              {currentClassMeta.scheduleTime}
            </CardDescription>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="check-circle" size={14} />}
              onClick={handleMarkAllPresent}
              disabled={entries.length === 0 || isLoadingRoster}
            >
              Mark All Present
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={entries.length === 0 || isLoadingRoster}
            >
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardBody
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {isLoadingRoster ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <Skeleton height="54px" />
              <Skeleton height="42px" />
              <Skeleton height="42px" />
              <Skeleton height="42px" />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon="graduation-cap"
              title="No students in roster"
              description="No students were found for this assigned class."
            />
          ) : (
            <>
              {/* Reused Live Attendance Summary */}
              <AttendanceSummary entries={entries} />

              {/* Search & Status Filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  className="es-input-wrapper"
                  style={{ width: "260px", maxWidth: "100%" }}
                >
                  <span className="es-input-icon-left">
                    <Icon name="search" size={15} />
                  </span>
                  <input
                    type="search"
                    className="es-input has-left-icon"
                    placeholder="Search student name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select
                  aria-label="Filter roster by attendance status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "all" | UnmarkedOrStatus)
                  }
                  style={{ width: "175px" }}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "present", label: "Present Only" },
                    { value: "absent", label: "Absent Only" },
                    { value: "late", label: "Late Only" },
                    { value: "excused", label: "Excused Only" },
                    { value: "unmarked", label: "Not Marked" },
                  ]}
                />
              </div>

              {/* Roster Table */}
              <div
                style={{
                  border: "1px solid var(--es-border)",
                  borderRadius: "var(--es-radius-md)",
                  overflow: "hidden",
                }}
              >
                {filteredEntries.length === 0 ? (
                  <EmptyState
                    icon="users"
                    title="No matching students"
                    description="Adjust your search query or status filter to view students."
                  />
                ) : (
                  <Table style={{ border: "none", borderRadius: 0 }}>
                    <TableHead>
                      <tr>
                        <TableHeaderCell>Student</TableHeaderCell>
                        <TableHeaderCell>Student ID</TableHeaderCell>
                        <TableHeaderCell>Attendance Status</TableHeaderCell>
                        <TableHeaderCell>Remarks</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {filteredEntries.map((entry) => {
                        const isUnmarked = entry.status === "unmarked";
                        return (
                          <TableRow
                            key={entry.studentId}
                            style={{
                              backgroundColor: isUnmarked
                                ? "rgba(254, 243, 199, 0.18)"
                                : undefined,
                            }}
                          >
                            <TableCell className="es-table-cell-primary">
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <Avatar name={entry.fullName} size="sm" />
                                <div>
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      color: "var(--es-text-primary)",
                                    }}
                                  >
                                    {entry.fullName}
                                  </div>
                                  {isUnmarked && (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 500,
                                        color: "var(--es-warning)",
                                      }}
                                    >
                                      Not marked yet
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <code
                                style={{
                                  fontFamily: "var(--es-font-mono)",
                                  fontSize: "12px",
                                  padding: "2px 6px",
                                  borderRadius: "var(--es-radius-xs)",
                                  backgroundColor: "var(--es-bg-subtle)",
                                  color: "var(--es-text-secondary)",
                                }}
                              >
                                {entry.studentCode}
                              </code>
                            </TableCell>

                            <TableCell>
                              <AttendanceStatusSelector
                                value={entry.status}
                                onChange={(nextStatus) =>
                                  handleStatusChange(
                                    entry.studentId,
                                    nextStatus,
                                  )
                                }
                              />
                            </TableCell>

                            <TableCell style={{ minWidth: "190px" }}>
                              <input
                                type="text"
                                className="es-input"
                                style={{ height: "31px", fontSize: "12.5px" }}
                                placeholder="Optional note..."
                                value={entry.remarks}
                                onChange={(e) =>
                                  handleRemarksChange(
                                    entry.studentId,
                                    e.target.value,
                                  )
                                }
                                aria-label={`Remarks for ${entry.fullName}`}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </CardBody>

        {entries.length > 0 && !isLoadingRoster && (
          <CardFooter>
            <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
              Assigned teacher scope: {TEACHER_PROFILE.name} (
              {currentClassMeta.name})
            </span>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="clipboard-check" size={16} />}
              onClick={handleAttemptSubmit}
            >
              Submit Attendance
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Updated Recent Attendance History Preview */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Attendance Submissions</CardTitle>
              <CardDescription>
                Latest saved attendance registers across your assigned classes
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody flush>
            <Table style={{ border: "none", borderRadius: 0 }}>
              <TableHead>
                <tr>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Class</TableHeaderCell>
                  <TableHeaderCell>Present / Total</TableHeaderCell>
                  <TableHeaderCell>Rate</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {recentSessions.slice(0, 6).map((sess) => (
                  <TableRow key={sess.id}>
                    <TableCell className="es-table-cell-primary">
                      {sess.date}
                    </TableCell>
                    <TableCell>{sess.className}</TableCell>
                    <TableCell>
                      {sess.presentCount} / {sess.totalStudents}
                    </TableCell>
                    <TableCell>
                      {sess.status === "Submitted"
                        ? `${sess.attendancePercentage}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sess.status === "Submitted" ? "success" : "warning"
                        }
                        dot
                      >
                        {sess.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Attendance Submission"
        description={`Submit attendance for ${currentClassMeta.name} on ${loadedDate}? (${
          entries.filter((e) => e.status === "present").length
        } Present, ${
          entries.filter((e) => e.status === "absent").length
        } Absent, ${entries.filter((e) => e.status === "late").length} Late, ${
          entries.filter((e) => e.status === "excused").length
        } Excused)`}
        confirmLabel="Submit Attendance"
        variant="primary"
      />

      {/* Success Toast */}
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
    </div>
  );
}

