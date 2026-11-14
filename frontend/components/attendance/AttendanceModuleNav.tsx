"use client";

import React from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";

export type AttendanceModuleTab = "overview" | "mark" | "history" | "analytics";

export interface AttendanceModuleNavProps {
  activeTab: AttendanceModuleTab;
  onTabChange?: (tab: AttendanceModuleTab) => void;
  useLinks?: boolean;
}

const NAV_ITEMS: {
  id: AttendanceModuleTab;
  label: string;
  href: string;
  icon: IconName;
}[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard/attendance",
    icon: "layout-dashboard",
  },
  {
    id: "mark",
    label: "Mark Attendance",
    href: "/dashboard/attendance/mark",
    icon: "clipboard-check",
  },
  {
    id: "history",
    label: "History",
    href: "/dashboard/attendance/history",
    icon: "calendar-check",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/dashboard/attendance?tab=analytics",
    icon: "sparkles",
  },
];

export function AttendanceModuleNav({
  activeTab,
  onTabChange,
  useLinks = false,
}: AttendanceModuleNavProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        padding: "6px",
        backgroundColor: "var(--es-bg-surface)",
        border: "1px solid var(--es-border)",
        borderRadius: "var(--es-radius-lg)",
        boxShadow: "var(--es-shadow-xs)",
      }}
      role="navigation"
      aria-label="Attendance Module Navigation"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexWrap: "wrap",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const commonStyle: React.CSSProperties = {
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 14px",
            borderRadius: "var(--es-radius-md)",
            fontSize: "13px",
            fontWeight: isActive ? 600 : 500,
            color: isActive ? "var(--es-primary)" : "var(--es-text-secondary)",
            backgroundColor: isActive
              ? "var(--es-primary-subtle)"
              : "transparent",
            border: isActive
              ? "1px solid var(--es-primary-border)"
              : "1px solid transparent",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 140ms ease",
          };

          if (onTabChange && !useLinks) {
            return (
              <button
                key={item.id}
                type="button"
                style={commonStyle}
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              style={commonStyle}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingRight: "8px",
          fontSize: "12px",
          color: "var(--es-text-muted)",
        }}
      >
        <Link
          href="/dashboard/attendance/mark"
          style={{
            color: "var(--es-primary)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Marking Workspace →
        </Link>
        <span>·</span>
        <Link
          href="/dashboard/attendance/history"
          style={{
            color: "var(--es-text-secondary)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Full History
        </Link>
      </div>
    </div>
  );
}

