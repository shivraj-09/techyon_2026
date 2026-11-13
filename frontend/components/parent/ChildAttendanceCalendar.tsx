"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  type BadgeVariant,
} from "@/components/ui";
import type {
  ParentAttendanceStatus,
  ParentChildRecord,
} from "@/config/parent-data";

export interface ChildAttendanceCalendarProps {
  child: ParentChildRecord;
  initialMonth?: "2026-10" | "2026-11";
}

interface MonthOption {
  key: "2026-10" | "2026-11";
  label: string;
  year: number;
  monthIndex: number;
  daysInMonth: number;
}

const SUPPORTED_MONTHS: MonthOption[] = [
  {
    key: "2026-10",
    label: "October 2026",
    year: 2026,
    monthIndex: 9,
    daysInMonth: 31,
  },
  {
    key: "2026-11",
    label: "November 2026",
    year: 2026,
    monthIndex: 10,
    daysInMonth: 30,
  },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLE: Record<
  ParentAttendanceStatus,
  {
    label: string;
    shortLabel: string;
    bg: string;
    border: string;
    color: string;
    dot: string;
    badgeVariant: BadgeVariant;
  }
> = {
  present: {
    label: "Present",
    shortLabel: "P",
    bg: "var(--es-success-bg)",
    border: "var(--es-success-border)",
    color: "var(--es-success)",
    dot: "#16a34a",
    badgeVariant: "success",
  },
  absent: {
    label: "Absent",
    shortLabel: "A",
    bg: "var(--es-danger-bg)",
    border: "var(--es-danger-border)",
    color: "var(--es-danger)",
    dot: "#dc2626",
    badgeVariant: "danger",
  },
  late: {
    label: "Late",
    shortLabel: "L",
    bg: "var(--es-warning-bg)",
    border: "var(--es-warning-border)",
    color: "var(--es-warning)",
    dot: "#d97706",
    badgeVariant: "warning",
  },
  excused: {
    label: "Excused",
    shortLabel: "E",
    bg: "var(--es-primary-subtle)",
    border: "var(--es-primary-border)",
    color: "var(--es-primary)",
    dot: "#0284c7",
    badgeVariant: "primary",
  },
};

function formatDateDisplay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ChildAttendanceCalendar({
  child,
  initialMonth = "2026-11",
}: ChildAttendanceCalendarProps) {
  const [monthIdx, setMonthIdx] = useState<number>(
    initialMonth === "2026-10" ? 0 : 1,
  );
  const activeMonth = SUPPORTED_MONTHS[monthIdx];

  const monthRecordedDates = useMemo(() => {
    return Object.keys(child.calendarRecords)
      .filter((date) => date.startsWith(activeMonth.key))
      .sort((a, b) => b.localeCompare(a));
  }, [child.calendarRecords, activeMonth.key]);

  const [selectedDate, setSelectedDate] = useState<string | null>(
    monthRecordedDates[0] ?? null,
  );

  useEffect(() => {
    setSelectedDate(monthRecordedDates[0] ?? null);
  }, [child.id, activeMonth.key, monthRecordedDates]);

  const firstWeekday = new Date(
    activeMonth.year,
    activeMonth.monthIndex,
    1,
  ).getDay();

  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);
  const daysArray = Array.from(
    { length: activeMonth.daysInMonth },
    (_, i) => i + 1,
  );

  const selectedRecord = selectedDate
    ? child.calendarRecords[selectedDate]
    : undefined;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Monthly Attendance Calendar</CardTitle>
          <CardDescription>
            Click any recorded school day for {child.fullName} to view daily
            status and remarks (read-only)
          </CardDescription>
        </div>

        {/* Month Navigation (Oct 2026 <-> Nov 2026) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={monthIdx === 0}
            onClick={() => setMonthIdx((prev) => Math.max(0, prev - 1))}
            aria-label="Previous month"
          >
            ← Prev
          </Button>
          <span
            style={{
              minWidth: "126px",
              textAlign: "center",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "var(--es-text-primary)",
            }}
          >
            {activeMonth.label}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={monthIdx === SUPPORTED_MONTHS.length - 1}
            onClick={() =>
              setMonthIdx((prev) =>
                Math.min(SUPPORTED_MONTHS.length - 1, prev + 1),
              )
            }
            aria-label="Next month"
          >
            Next →
          </Button>
        </div>
      </CardHeader>

      <CardBody
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            padding: "10px 14px",
            borderRadius: "var(--es-radius-md)",
            backgroundColor: "var(--es-bg-app)",
            border: "1px solid var(--es-border-subtle)",
          }}
        >
          <div className="es-chart-legend" style={{ flexWrap: "wrap" }}>
            {(
              ["present", "absent", "late", "excused"] as ParentAttendanceStatus[]
            ).map((statusKey) => {
              const cfg = STATUS_STYLE[statusKey];
              return (
                <span key={statusKey} className="es-legend-item">
                  <span
                    className="es-legend-swatch"
                    style={{ backgroundColor: cfg.dot }}
                  />
                  <span>{cfg.label}</span>
                </span>
              );
            })}
          </div>
          <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
            Weekends / unscheduled days shown in neutral
          </span>
        </div>

        {/* Calendar Grid */}
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "var(--es-text-muted)",
                  padding: "4px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "6px",
            }}
          >
            {leadingBlanks.map((blank) => (
              <div key={`blank-${blank}`} style={{ minHeight: 54 }} />
            ))}

            {daysArray.map((dayNum) => {
              const isoDate = `${activeMonth.key}-${String(dayNum).padStart(
                2,
                "0",
              )}`;
              const record = child.calendarRecords[isoDate];
              const isSelected = selectedDate === isoDate;
              const styleCfg = record ? STATUS_STYLE[record.status] : null;

              if (!record || !styleCfg) {
                return (
                  <div
                    key={isoDate}
                    style={{
                      minHeight: 54,
                      padding: "6px 8px",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      backgroundColor: "var(--es-bg-app)",
                      color: "var(--es-text-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{dayNum}</span>
                    <span style={{ fontSize: "10px" }}>—</span>
                  </div>
                );
              }

              return (
                <button
                  key={isoDate}
                  type="button"
                  onClick={() => setSelectedDate(isoDate)}
                  aria-pressed={isSelected}
                  aria-label={`${formatDateDisplay(isoDate)}: ${styleCfg.label}`}
                  style={{
                    minHeight: 54,
                    padding: "6px 8px",
                    borderRadius: "var(--es-radius-md)",
                    border: isSelected
                      ? `2px solid ${styleCfg.dot}`
                      : `1px solid ${styleCfg.border}`,
                    backgroundColor: styleCfg.bg,
                    color: styleCfg.color,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: isSelected ? "var(--es-shadow-sm)" : "none",
                    transition: "all var(--es-transition-fast)",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{dayNum}</span>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "9999px",
                        backgroundColor: styleCfg.dot,
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      lineHeight: 1.1,
                    }}
                  >
                    {styleCfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Attendance Detail Panel (Read-Only) */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "var(--es-radius-md)",
            border: "1px solid var(--es-border)",
            backgroundColor: "var(--es-bg-app)",
          }}
        >
          {selectedDate && selectedRecord ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <Icon name="calendar" size={15} />
                  <strong
                    style={{
                      fontSize: "13.5px",
                      color: "var(--es-text-primary)",
                    }}
                  >
                    {formatDateDisplay(selectedDate)}
                  </strong>
                  <Badge
                    variant={STATUS_STYLE[selectedRecord.status].badgeVariant}
                    dot
                  >
                    {STATUS_STYLE[selectedRecord.status].label}
                  </Badge>
                </div>

                <div
                  style={{
                    fontSize: "12.5px",
                    color: "var(--es-text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  <strong>Student:</strong> {child.fullName} ({child.className})
                </div>

                <div
                  style={{
                    fontSize: "12.5px",
                    color: "var(--es-text-muted)",
                  }}
                >
                  <strong>Remarks:</strong>{" "}
                  {selectedRecord.remarks || "No remarks logged"}
                </div>
              </div>

              <span
                style={{
                  fontSize: "11.5px",
                  color: "var(--es-text-muted)",
                  fontWeight: 500,
                }}
              >
                Read-only attendance record
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "var(--es-text-muted)",
              }}
            >
              <Icon name="info" size={15} />
              <span>
                Select any color-coded date above to view daily attendance
                details.
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
