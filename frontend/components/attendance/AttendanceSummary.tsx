"use client";

import React from "react";
import { Badge } from "@/components/ui";
import type { AttendanceEntryRecord } from "@/config/attendance-data";

export interface AttendanceSummaryProps {
  entries: AttendanceEntryRecord[];
}

export function AttendanceSummary({ entries }: AttendanceSummaryProps) {
  const total = entries.length;
  const present = entries.filter((e) => e.status === "present").length;
  const absent = entries.filter((e) => e.status === "absent").length;
  const late = entries.filter((e) => e.status === "late").length;
  const excused = entries.filter((e) => e.status === "excused").length;
  const unmarked = entries.filter((e) => e.status === "unmarked").length;

  const markedCount = total - unmarked;
  const progressPct = total > 0 ? Math.round((markedCount / total) * 100) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "14px 18px",
        backgroundColor: "var(--es-bg-app)",
        border: "1px solid var(--es-border)",
        borderRadius: "var(--es-radius-md)",
      }}
    >
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                color: "var(--es-text-muted)",
                marginRight: "6px",
              }}
            >
              Total Students:
            </span>
            <strong
              style={{ fontSize: "13.5px", color: "var(--es-text-primary)" }}
            >
              {total}
            </strong>
          </div>

          <Badge variant="success" dot>
            Present: {present}
          </Badge>
          <Badge variant="danger" dot>
            Absent: {absent}
          </Badge>
          <Badge variant="warning" dot>
            Late: {late}
          </Badge>
          <Badge variant="primary" dot>
            Excused: {excused}
          </Badge>
          <Badge variant={unmarked > 0 ? "warning" : "neutral"}>
            Not Marked: {unmarked}
          </Badge>
        </div>

        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color:
              unmarked === 0 && total > 0
                ? "var(--es-success)"
                : "var(--es-text-secondary)",
          }}
        >
          {markedCount} of {total} marked ({progressPct}%)
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div
        style={{
          width: "100%",
          height: "6px",
          backgroundColor: "var(--es-border)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            backgroundColor:
              unmarked === 0 && total > 0
                ? "var(--es-success)"
                : "var(--es-primary)",
            transition: "width 180ms ease",
          }}
        />
      </div>
    </div>
  );
}

