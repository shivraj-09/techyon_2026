"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Skeleton,
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  ATTENDANCE_CLASSES,
  getRosterForClass,
  getStoredAttendanceSessions,
  saveStoredAttendanceSessions,
  type AttendanceEntryRecord,
  type AttendanceSessionRecord,
  type AttendanceStatus,
  type UnmarkedOrStatus,
} from "@/config/attendance-data";
import { AttendanceSummary } from "./AttendanceSummary";
import { AttendanceRoster } from "./AttendanceRoster";

export interface AttendanceMarkingWorkspaceProps {
  initialClassId?: string;
  initialDate?: string;
  onSessionSaved?: (session: AttendanceSessionRecord) => void;
}

export function AttendanceMarkingWorkspace({
  initialClassId = "class-8-a",
  initialDate = "2026-11-14",
  onSessionSaved,
}: AttendanceMarkingWorkspaceProps) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [loadedClassId, setLoadedClassId] = useState(initialClassId);
  const [loadedDate, setLoadedDate] = useState(initialDate);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  const [entries, setEntries] = useState<AttendanceEntryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UnmarkedOrStatus>(
    "all",
  );
  const [validationError, setValidationError] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submittedRecord, setSubmittedRecord] =
    useState<AttendanceSessionRecord | null>(null);
  const [existingSubmission, setExistingSubmission] =
    useState<AttendanceSessionRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const currentClassMeta = useMemo(
    () =>
      ATTENDANCE_CLASSES.find((c) => c.id === loadedClassId) ||
      ATTENDANCE_CLASSES[0],
    [loadedClassId],
  );

  function loadRoster(targetClassId: string, targetDate: string) {
    setIsLoadingRoster(true);
    setValidationError("");
    setSubmittedRecord(null);

    setTimeout(() => {
      const sessions = getStoredAttendanceSessions();
      const foundSession =
        sessions.find(
          (s) => s.classId === targetClassId && s.date === targetDate,
        ) || null;

      setExistingSubmission(foundSession);

      if (foundSession && foundSession.entries.length > 0) {
        setEntries(foundSession.entries.map((e) => ({ ...e })));
      } else {
        const roster = getRosterForClass(targetClassId);
        setEntries(
          roster.map((stu, idx) => ({
            attendanceId: `att-${targetClassId}-${targetDate}-${idx + 1}`,
            studentId: stu.studentId,
            studentCode: stu.studentCode,
            fullName: stu.fullName,
            status: "unmarked",
            remarks: "",
          })),
        );
      }

      setLoadedClassId(targetClassId);
      setLoadedDate(targetDate);
      setIsLoadingRoster(false);
    }, 220);
  }

  useEffect(() => {
    loadRoster(initialClassId, initialDate);
  }, [initialClassId, initialDate]);

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

  function handleMarkAll(status: AttendanceStatus) {
    setValidationError("");
    setEntries((prev) => prev.map((item) => ({ ...item, status })));
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
      (e) => e.status === "unmarked",
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

    // Effective attendance counts present + late + excused or present/total
    const attendancePercentage =
      totalStudents > 0
        ? Number(((presentCount / totalStudents) * 100).toFixed(1))
        : 0;

    const newSession: AttendanceSessionRecord = {
      id: existingSubmission?.id || `sess-${loadedClassId}-${loadedDate}`,
      classId: loadedClassId,
      className: currentClassMeta.name,
      section: currentClassMeta.section,
      date: loadedDate,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
      submittedBy: "Arjun Mehta (School Admin)",
      submittedAt: "Just now",
      status: "Submitted",
      entries: entries.map((e) => ({ ...e })),
    };

    const existingList = getStoredAttendanceSessions();
    const otherSessions = existingList.filter(
      (s) => !(s.classId === loadedClassId && s.date === loadedDate),
    );
    const updatedList = [newSession, ...otherSessions];
    saveStoredAttendanceSessions(updatedList);

    setExistingSubmission(newSession);
    setSubmittedRecord(newSession);
    setIsConfirmOpen(false);
    setToast({
      title: "Attendance submitted successfully",
      description: `Recorded attendance for ${currentClassMeta.name} on ${loadedDate}.`,
    });
    onSessionSaved?.(newSession);
  }

  return (
    <div className="es-stack">
      {/* Step 1 — Select Class and Date */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Step 1 — Select Class &amp; Date</CardTitle>
            <CardDescription>
              Choose the class section and date to load the student roll call
              roster
            </CardDescription>
          </div>
          {existingSubmission ? (
            <Badge variant="success" dot>
              Attendance Already Submitted ({existingSubmission.submittedAt})
            </Badge>
          ) : (
            <Badge variant="warning" dot>
              Attendance Not Yet Submitted
            </Badge>
          )}
        </CardHeader>

        <CardBody>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
              alignItems: "end",
            }}
          >
            <Select
              label="Class & Section"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={ATTENDANCE_CLASSES.map((cls) => ({
                value: cls.id,
                label: `${cls.name} (${cls.totalStudents} students)`,
              }))}
            />

            <div className="es-field">
              <label className="es-label" htmlFor="es-mark-date">
                Attendance Date
              </label>
              <input
                id="es-mark-date"
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
                Load Students
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
                {submittedRecord.attendancePercentage}% attendance)
              </div>
            </div>
          </div>
          <Badge variant="success">Saved to Register</Badge>
        </div>
      )}

      {/* Validation Error Alert */}
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

      {/* Step 2, 3 & 4 — Roster, Controls & Submit */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Step 2 — Student Roster ({currentClassMeta.name} · {loadedDate})
            </CardTitle>
            <CardDescription>
              Mark Present, Absent, Late, or Excused for each enrolled student
            </CardDescription>
          </div>

          {/* Step 3 Quick Bulk Controls */}
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
              onClick={() => handleMarkAll("present")}
              disabled={entries.length === 0 || isLoadingRoster}
            >
              Mark All Present
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleMarkAll("absent")}
              disabled={entries.length === 0 || isLoadingRoster}
            >
              Mark All Absent
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
              <Skeleton height="42px" />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon="graduation-cap"
              title="No students enrolled in this class"
              description={`${currentClassMeta.name} currently has 0 enrolled students. Select another class section above to mark attendance.`}
            />
          ) : (
            <>
              {/* Live Attendance Summary */}
              <AttendanceSummary entries={entries} />

              {/* Search & Status Filter Controls */}
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
                  style={{ width: "280px", maxWidth: "100%" }}
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

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <Select
                    aria-label="Filter by attendance status"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as "all" | UnmarkedOrStatus,
                      )
                    }
                    style={{ width: "170px" }}
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
              </div>

              {/* Roster Table */}
              <div
                style={{
                  border: "1px solid var(--es-border)",
                  borderRadius: "var(--es-radius-md)",
                  overflow: "hidden",
                }}
              >
                <AttendanceRoster
                  entries={filteredEntries}
                  onStatusChange={handleStatusChange}
                  onRemarksChange={handleRemarksChange}
                />
              </div>
            </>
          )}
        </CardBody>

        {entries.length > 0 && !isLoadingRoster && (
          <CardFooter>
            <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
              Batch submission contract:{" "}
              <code>POST /schools/&#123;school_id&#125;/classes/{loadedClassId}/attendance</code>
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Attendance Submission"
        description={`Are you sure you want to submit attendance for ${currentClassMeta.name} on ${loadedDate}? (${
          entries.filter((e) => e.status === "present").length
        } Present, ${entries.filter((e) => e.status === "absent").length} Absent, ${
          entries.filter((e) => e.status === "late").length
        } Late, ${entries.filter((e) => e.status === "excused").length} Excused)`}
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
