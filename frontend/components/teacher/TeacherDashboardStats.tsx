"use client";

import React from "react";
import { Icon, type IconName } from "@/components/ui";
import {
  TEACHER_DASHBOARD_STATS,
  type TeacherDashboardStats as TeacherDashboardStatsType,
} from "@/config/teacher-data";

export interface TeacherDashboardStatsProps {
  stats?: TeacherDashboardStatsType;
}

interface StatCardConfig {
  id: string;
  label: string;
  value: string | number;
  hint: string;
  icon: IconName;
  tone: "primary" | "success" | "warning" | "neutral";
}

export function TeacherDashboardStats({
  stats = TEACHER_DASHBOARD_STATS,
}: TeacherDashboardStatsProps) {
  const cards: StatCardConfig[] = [
    {
      id: "assigned-classes",
      label: "Assigned Classes",
      value: stats.assignedClasses,
      hint: "Mathematics · 2026-2027",
      icon: "book-open",
      tone: "primary",
    },
    {
      id: "total-students",
      label: "Total Students",
      value: stats.totalStudents,
      hint: "Across 4 assigned sections",
      icon: "graduation-cap",
      tone: "neutral",
    },
    {
      id: "attendance-today",
      label: "Attendance Today",
      value: stats.attendanceToday,
      hint: "144 of 156 present",
      icon: "calendar-check",
      tone: "success",
    },
    {
      id: "pending-attendance",
      label: "Pending Attendance",
      value: stats.pendingAttendance,
      hint: "Class 9-A · 01:00 PM slot",
      icon: "clock",
      tone: "warning",
    },
  ];

  function getToneStyle(tone: StatCardConfig["tone"]) {
    if (tone === "success") {
      return {
        bg: "var(--es-success-bg)",
        border: "var(--es-success-border)",
        color: "var(--es-success)",
      };
    }
    if (tone === "warning") {
      return {
        bg: "var(--es-warning-bg)",
        border: "var(--es-warning-border)",
        color: "var(--es-warning)",
      };
    }
    if (tone === "primary") {
      return {
        bg: "var(--es-primary-subtle)",
        border: "var(--es-primary-border)",
        color: "var(--es-primary)",
      };
    }
    return {
      bg: "var(--es-bg-subtle)",
      border: "var(--es-border)",
      color: "var(--es-text-secondary)",
    };
  }

  return (
    <section className="es-grid-4" aria-label="Teacher Workspace Statistics">
      {cards.map((item) => {
        const tone = getToneStyle(item.tone);
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
                {item.label}
              </span>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--es-radius-md)",
                  backgroundColor: tone.bg,
                  color: tone.color,
                  border: `1px solid ${tone.border}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={item.icon} size={17} />
              </span>
            </div>

            <div className="es-stat-value">{item.value}</div>

            <div className="es-stat-meta">{item.hint}</div>
          </article>
        );
      })}
    </section>
  );
}

