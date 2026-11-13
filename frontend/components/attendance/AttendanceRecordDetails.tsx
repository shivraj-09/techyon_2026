"use client";

import React, { useState } from "react";
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
  Icon,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Toast,
} from "@/components/ui";
import {
  getStoredAttendanceSessions,
  saveStoredAttendanceSessions,
  type AttendanceEntryRecord,
  type AttendanceSessionRecord,
  type AttendanceStatus,
} from "@/config/attendance-data";
import { AttendanceStatusSelector } from "./AttendanceStatusSelector";

export interface AttendanceRecordDetailsProps {
  session: AttendanceSessionRecord;
  onClose: () => void;
  onSessionUpdated?: (updated: AttendanceSessionRecord) => void;
}

export function AttendanceRecordDetails({
  session,
  onClose,
  onSessionUpdated,
}: AttendanceRecordDetailsProps) {
  const [localSession, setLocalSession] =
    useState<AttendanceSessionRecord>(session);
  const [editingEntry, setEditingEntry] =
    useState<AttendanceEntryRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("present");
  const [editRemarks, setEditRemarks] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function openEditModal(entry: AttendanceEntryRecord) {
    setEditingEntry(entry);
    setEditStatus(
      entry.status === "unmarked" ? "present" : entry.status,
    );
    setEditRemarks(entry.remarks);
  }

  function applyEntryUpdate(
    targetStudentId: string,
    nextStatus: AttendanceStatus,
    nextRemarks: string,
  ) {
    const updatedEntries = localSession.entries.map((entry) =>
      entry.studentId === targetStudentId
        ? { ...entry, status: nextStatus, remarks: nextRemarks }
        : entry,
    );

    const totalStudents = updatedEntries.length;
    const presentCount = updatedEntries.filter(
      (e) => e.status === "present",
    ).length;
    const absentCount = updatedEntries.filter(
      (e) => e.status === "absent",
    ).length;
    const lateCount = updatedEntries.filter((e) => e.status === "late").length;
    const excusedCount = updatedEntries.filter(
      (e) => e.status === "excused",
    ).length;
    const attendancePercentage =
      totalStudents > 0
        ? Number(((presentCount / totalStudents) * 100).toFixed(1))
        : 0;

    const updatedSession: AttendanceSessionRecord = {
      ...localSession,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
      entries: updatedEntries,
    };

    setLocalSession(updatedSession);

    const allSessions = getStoredAttendanceSessions();
    const nextSessions = allSessions.map((s) =>
      s.id === updatedSession.id ? updatedSession : s,
    );
    saveStoredAttendanceSessions(nextSessions);
    onSessionUpdated?.(updatedSession);
    setEditingEntry(null);
    setToastMsg("Student attendance status updated.");
  }

  function getStatusBadge(status: AttendanceEntryRecord["status"]) {
    if (status === "present") {
      return (
        <Badge variant="success" dot>
          Present
        </Badge>
      );
    }
    if (status === "absent") {
      return (
        <Badge variant="danger" dot>
          Absent
        </Badge>
      );
    }
    if (status === "late") {
      return (
        <Badge variant="warning" dot>
          Late
        </Badge>
      );
    }
    if (status === "excused") {
      return (
        <Badge variant="primary" dot>
          Excused
        </Badge>
      );
    }
    return <Badge variant="neutral">Not Marked</Badge>;
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CardTitle>
              Attendance Record Details — {localSession.className}
            </CardTitle>
            <Badge variant="primary">{localSession.date}</Badge>
          </div>
          <CardDescription>
            Submitted by {localSession.submittedBy} ({localSession.submittedAt})
          </CardDescription>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Icon name="x" size={14} />}
          onClick={onClose}
        >
          Close Details
        </Button>
      </CardHeader>

      <CardBody style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Summary Metrics Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
            gap: "12px",
            padding: "14px 16px",
            backgroundColor: "var(--es-bg-app)",
            border: "1px solid var(--es-border)",
            borderRadius: "var(--es-radius-md)",
          }}
        >
          <div>
            <div className="es-metric-mini-label">Total Enrolled</div>
            <div className="es-metric-mini-value">
              {localSession.totalStudents}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Attendance Rate</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-primary)" }}
            >
              {localSession.attendancePercentage.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Present</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-success)" }}
            >
              {localSession.presentCount}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Absent</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-danger)" }}
            >
              {localSession.absentCount}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Late</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-warning)" }}
            >
              {localSession.lateCount}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Excused</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-primary)" }}
            >
              {localSession.excusedCount}
            </div>
          </div>
        </div>

        {/* Student Attendance Table */}
        <div
          style={{
            border: "1px solid var(--es-border)",
            borderRadius: "var(--es-radius-md)",
            overflow: "hidden",
          }}
        >
          <Table style={{ border: "none", borderRadius: 0 }}>
            <TableHead>
              <tr>
                <TableHeaderCell>Student</TableHeaderCell>
                <TableHeaderCell>Student ID</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Quick Update</TableHeaderCell>
                <TableHeaderCell>Remarks</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {localSession.entries.map((entry) => (
                <TableRow key={entry.studentId}>
                  <TableCell className="es-table-cell-primary">
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Avatar name={entry.fullName} size="sm" />
                      <span>{entry.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code
                      style={{
                        fontFamily: "var(--es-font-mono)",
                        fontSize: "12px",
                      }}
                    >
                      {entry.studentCode}
                    </code>
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <AttendanceStatusSelector
                      compact
                      value={entry.status}
                      onChange={(nextStatus) =>
                        applyEntryUpdate(
                          entry.studentId,
                          nextStatus,
                          entry.remarks,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        fontSize: "12.5px",
                        color: entry.remarks
                          ? "var(--es-text-primary)"
                          : "var(--es-text-subtle)",
                      }}
                    >
                      {entry.remarks || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(entry)}
                    >
                      Edit Note
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardBody>

      <CardFooter>
        <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
          Individual edit contract:{" "}
          <code>PATCH /schools/&#123;school_id&#125;/attendance/&#123;attendance_id&#125;</code>
        </span>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Done
        </Button>
      </CardFooter>

      {/* Edit Individual Student Attendance Modal */}
      <Modal
        isOpen={editingEntry !== null}
        onClose={() => setEditingEntry(null)}
        title={
          editingEntry
            ? `Edit Attendance — ${editingEntry.fullName}`
            : "Edit Attendance"
        }
        description={`${localSession.className} · ${localSession.date}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditingEntry(null)}
            >
              Cancel
            </Button>
            {editingEntry && (
              <Button
                variant="primary"
                onClick={() =>
                  applyEntryUpdate(
                    editingEntry.studentId,
                    editStatus,
                    editRemarks,
                  )
                }
              >
                Save Changes
              </Button>
            )}
          </>
        }
      >
        {editingEntry && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="es-field">
              <label className="es-label">Attendance Status</label>
              <AttendanceStatusSelector
                value={editStatus}
                onChange={setEditStatus}
              />
            </div>

            <div className="es-field">
              <label className="es-label" htmlFor="es-edit-att-remarks">
                Remarks / Note
              </label>
              <input
                id="es-edit-att-remarks"
                type="text"
                className="es-input"
                placeholder="Enter reason or note..."
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {toastMsg && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toastMsg}
            description={`${localSession.className} (${localSession.date}) updated in local state.`}
            onDismiss={() => setToastMsg(null)}
          />
        </div>
      )}
    </Card>
  );
}

