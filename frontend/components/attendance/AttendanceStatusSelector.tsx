"use client";

import React from "react";
import type {
  AttendanceStatus,
  UnmarkedOrStatus,
} from "@/config/attendance-data";

export interface AttendanceStatusSelectorProps {
  value: UnmarkedOrStatus;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  compact?: boolean;
}

const STATUS_OPTIONS: {
  id: AttendanceStatus;
  label: string;
  shortLabel: string;
  activeBg: string;
  activeColor: string;
  activeBorder: string;
}[] = [
  {
    id: "present",
    label: "Present",
    shortLabel: "P",
    activeBg: "var(--es-status-present-bg)",
    activeColor: "var(--es-status-present-fg)",
    activeBorder: "var(--es-status-present-border)",
  },
  {
    id: "absent",
    label: "Absent",
    shortLabel: "A",
    activeBg: "var(--es-status-absent-bg)",
    activeColor: "var(--es-status-absent-fg)",
    activeBorder: "var(--es-status-absent-border)",
  },
  {
    id: "late",
    label: "Late",
    shortLabel: "L",
    activeBg: "var(--es-status-late-bg)",
    activeColor: "var(--es-status-late-fg)",
    activeBorder: "var(--es-status-late-border)",
  },
  {
    id: "excused",
    label: "Excused",
    shortLabel: "E",
    activeBg: "var(--es-status-excused-bg)",
    activeColor: "var(--es-status-excused-fg)",
    activeBorder: "var(--es-status-excused-border)",
  },
];

export function AttendanceStatusSelector({
  value,
  onChange,
  disabled = false,
  compact = false,
}: AttendanceStatusSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Attendance status"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px",
        backgroundColor: "var(--es-bg-app)",
        border: "1px solid var(--es-border)",
        borderRadius: "var(--es-radius-md)",
        flexWrap: "wrap",
      }}
    >
      {STATUS_OPTIONS.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            style={{
              height: compact ? "26px" : "29px",
              padding: compact ? "0 8px" : "0 11px",
              fontSize: compact ? "11.5px" : "12px",
              fontWeight: isSelected ? 600 : 500,
              fontFamily: "var(--es-font-sans)",
              borderRadius: "var(--es-radius-sm)",
              border: `1px solid ${
                isSelected ? opt.activeBorder : "transparent"
              }`,
              backgroundColor: isSelected ? opt.activeBg : "transparent",
              color: isSelected ? opt.activeColor : "var(--es-text-muted)",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 120ms ease",
              whiteSpace: "nowrap",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

