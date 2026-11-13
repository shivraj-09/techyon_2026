"use client";

import React from "react";
import {
  Avatar,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import type {
  AttendanceEntryRecord,
  AttendanceStatus,
} from "@/config/attendance-data";
import { AttendanceStatusSelector } from "./AttendanceStatusSelector";

export interface AttendanceRosterProps {
  entries: AttendanceEntryRecord[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onRemarksChange: (studentId: string, remarks: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AttendanceRoster({
  entries,
  onStatusChange,
  onRemarksChange,
  emptyTitle = "No students match your filter",
  emptyDescription = "Try clearing the search query or changing the status filter.",
}: AttendanceRosterProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon="users"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <Table style={{ border: "none", borderRadius: 0 }}>
      <TableHead>
        <tr>
          <TableHeaderCell>Student</TableHeaderCell>
          <TableHeaderCell>Student ID</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Remarks</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {entries.map((entry) => {
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
                    onStatusChange(entry.studentId, nextStatus)
                  }
                />
              </TableCell>

              <TableCell style={{ minWidth: "200px" }}>
                <input
                  type="text"
                  className="es-input"
                  style={{ height: "31px", fontSize: "12.5px" }}
                  placeholder="Optional note (e.g. Medical leave, bus delay)..."
                  value={entry.remarks}
                  onChange={(e) =>
                    onRemarksChange(entry.studentId, e.target.value)
                  }
                  aria-label={`Remarks for ${entry.fullName}`}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

