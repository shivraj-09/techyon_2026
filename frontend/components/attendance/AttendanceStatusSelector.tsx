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
    activeBg: "#f0fdf4",
    activeColor: "#15803d",
    activeBorder: "#86efac",
  },
  {
    id: "absent",
    label: "Absent",
    shortLabel: "A",
    activeBg: "#fef2f2",
    activeColor: "#b91c1c",
    activeBorder: "#fca5a5",
  },
  {
    id: "late",
    label: "Late",
    shortLabel: "L",
    activeBg: "#fffbeb",
    activeColor: "#b45309",
    activeBorder: "#fcd34d",
  },
  {
    id: "excused",
    label: "Excused",
    shortLabel: "E",
    activeBg: "#f0f9ff",
    activeColor: "#0369a1",
    activeBorder: "#7dd3fc",
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

