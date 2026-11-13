"use client";

import React from "react";
import { Icon, type IconName } from "@/components/ui";
import { formatINR } from "@/config/fee-data";
import {
  PARENT_OVERVIEW_STATS,
  type ParentOverviewStats,
} from "@/config/parent-data";

export interface ParentDashboardStatsProps {
  stats?: ParentOverviewStats;
  unreadCount?: number;
}

interface ParentStatCardConfig {
  id: string;
  label: string;
  value: string | number;
  meta: string;
  icon: IconName;
  tone: "primary" | "success" | "warning" | "neutral";
}

function getToneStyle(tone: ParentStatCardConfig["tone"]) {
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

export function ParentDashboardStats({
  stats = PARENT_OVERVIEW_STATS,
  unreadCount,
}: ParentDashboardStatsProps) {
  const effectiveUnread =
    unreadCount !== undefined ? unreadCount : stats.unreadNotifications;

  const cards: ParentStatCardConfig[] = [
    {
      id: "total-children",
      label: "Total Children",
      value: stats.totalChildren,
      meta: "Linked to guardian account",
      icon: "users",
      tone: "primary",
    },
    {
      id: "average-attendance",
      label: "Average Attendance",
      value: stats.averageAttendance,
      meta: "Combined 2026-2027 term rate",
      icon: "calendar-check",
      tone: "success",
    },
    {
      id: "pending-fees",
      label: "Pending Fees",
      value: formatINR(stats.pendingFees),
      meta:
        stats.pendingFees > 0
          ? "Next due date: 25 Nov 2026"
          : "All term dues settled",
      icon: "indian-rupee",
      tone: stats.pendingFees > 0 ? "warning" : "success",
    },
    {
      id: "unread-notifications",
      label: "Unread Notifications",
      value: effectiveUnread,
      meta:
        effectiveUnread > 0
          ? "Attendance, fee & school alerts"
          : "All notifications reviewed",
      icon: "bell",
      tone: effectiveUnread > 0 ? "primary" : "neutral",
    },
  ];

  return (
    <section className="es-grid-4" aria-label="Parent Overview Statistics">
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

            <div className="es-stat-meta">{item.meta}</div>
          </article>
        );
      })}
    </section>
  );
}
