"use client";

import React from "react";
import { Icon, type IconName } from "@/components/ui";
import {
  ATTENDANCE_OVERVIEW_STATS,
  type AttendanceStatCardItem,
  type AttendanceStatus,
} from "@/config/attendance-data";

export interface AttendanceStatsProps {
  stats?: AttendanceStatCardItem[];
}

export function AttendanceStats({
  stats = ATTENDANCE_OVERVIEW_STATS,
}: AttendanceStatsProps) {
  function getVisualMeta(status: AttendanceStatus): {
    icon: IconName;
    bg: string;
    border: string;
    color: string;
    badgeBg: string;
  } {
    if (status === "present") {
      return {
        icon: "check-circle",
        bg: "var(--es-success-bg)",
        border: "var(--es-success-border)",
        color: "var(--es-success)",
        badgeBg: "var(--es-success-badge-bg)",
      };
    }
    if (status === "absent") {
      return {
        icon: "alert-triangle",
        bg: "var(--es-danger-bg)",
        border: "var(--es-danger-border)",
        color: "var(--es-danger)",
        badgeBg: "var(--es-danger-badge-bg)",
      };
    }
    if (status === "late") {
      return {
        icon: "clock",
        bg: "var(--es-warning-bg)",
        border: "var(--es-warning-border)",
        color: "var(--es-warning)",
        badgeBg: "var(--es-warning-badge-bg)",
      };
    }
    return {
      icon: "info",
      bg: "var(--es-primary-subtle)",
      border: "var(--es-primary-border)",
      color: "var(--es-primary)",
      badgeBg: "var(--es-info-badge-bg)",
    };
  }

  return (
    <section className="es-grid-4" aria-label="Attendance Statistics">
      {stats.map((item) => {
        const meta = getVisualMeta(item.status);
        return (
          <article key={item.id} className="es-stat-card">
            <div className="es-stat-top">
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--es-text-secondary)",
                  fontSize: "13px",
                }}
              >
                {item.title}
              </span>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--es-radius-md)",
                  backgroundColor: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.border}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={meta.icon} size={17} />
              </span>
            </div>

            <div className="es-stat-value">{item.countLabel}</div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                marginTop: "2px",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                Share of enrolled students
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  borderRadius: "var(--es-radius-xs)",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.border}`,
                }}
              >
                {item.percentage}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

