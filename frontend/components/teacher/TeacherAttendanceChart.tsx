"use client";

import React, { useState } from "react";
import {
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  TEACHER_ATTENDANCE_SUMMARY,
  TEACHER_ATTENDANCE_TREND,
  type TeacherAttendanceTrendPoint,
} from "@/config/teacher-data";

export interface TeacherAttendanceChartProps {
  trend?: TeacherAttendanceTrendPoint[];
  summary?: typeof TEACHER_ATTENDANCE_SUMMARY;
}

export function TeacherAttendanceChart({
  trend = TEACHER_ATTENDANCE_TREND,
  summary = TEACHER_ATTENDANCE_SUMMARY,
}: TeacherAttendanceChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 620;
  const height = 215;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 32;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const minVal = 84;
  const maxVal = 98;
  const yTicks = [98, 94, 90, 84];

  function getX(index: number) {
    if (trend.length <= 1) return padLeft;
    return padLeft + (index / (trend.length - 1)) * plotWidth;
  }

  function getY(pct: number) {
    const clamped = Math.max(minVal, Math.min(maxVal, pct));
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return padTop + plotHeight - ratio * plotHeight;
  }

  const linePath = trend
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(
          pt.percentage,
        ).toFixed(1)}`,
    )
    .join(" ");

  const areaPath =
    trend.length > 0
      ? `${linePath} L ${getX(trend.length - 1).toFixed(1)} ${(
          padTop + plotHeight
        ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotHeight).toFixed(
          1,
        )} Z`
      : "";

  const activePoint =
    hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader>
        <div>
          <CardTitle>Assigned Classes Attendance Trend</CardTitle>
          <CardDescription>
            7-day attendance across Class 6-A, 7-B, 8-A &amp; 9-A
          </CardDescription>
        </div>
        <Badge variant="primary">Last 7 Days</Badge>
      </CardHeader>

      <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Summary Strip */}
        <div className="es-analytics-summary">
          <div>
            <div className="es-metric-mini-label">Attendance %</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-primary)" }}
            >
              {summary.percentage}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Present</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-success)" }}
            >
              {summary.present}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Absent</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-danger)" }}
            >
              {summary.absent}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Late</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-warning)" }}
            >
              {summary.late}
            </div>
          </div>
        </div>

        {/* Active Point Meta */}
        {activePoint && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--es-text-muted)",
              marginBottom: "8px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span>
              <strong style={{ color: "var(--es-text-primary)" }}>
                {activePoint.label} ({activePoint.date}):
              </strong>{" "}
              <strong style={{ color: "var(--es-primary)" }}>
                {activePoint.percentage}%
              </strong>{" "}
              ({activePoint.present} present · {activePoint.absent} absent ·{" "}
              {activePoint.late} late)
            </span>
            <span style={{ fontSize: "11.5px", color: "var(--es-text-subtle)" }}>
              Hover points for daily totals
            </span>
          </div>
        )}

        {/* Responsive SVG Line Chart */}
        <div style={{ width: "100%", overflow: "hidden", marginTop: "auto" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            role="img"
            aria-label="Teacher assigned classes attendance trend line chart"
          >
            <defs>
              <linearGradient
                id="es-teacher-att-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#64748b"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            {areaPath && (
              <path d={areaPath} fill="url(#es-teacher-att-gradient)" />
            )}

            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {trend.map((pt, i) => {
              const cx = getX(i);
              const cy = getY(pt.percentage);
              const isHovered = hoveredIdx === i;
              return (
                <g
                  key={pt.date}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {isHovered && (
                    <line
                      x1={cx}
                      y1={padTop}
                      x2={cx}
                      y2={padTop + plotHeight}
                      stroke="#bae6fd"
                      strokeWidth="1.5"
                    />
                  )}
                  <circle cx={cx} cy={cy} r={12} fill="transparent" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5 : 3.5}
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth={isHovered ? 2.8 : 2}
                  />
                  <text
                    x={cx}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="#64748b"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardBody>
    </Card>
  );
}

