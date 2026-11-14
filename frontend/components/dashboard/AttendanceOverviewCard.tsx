"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
} from "@/components/ui";
import {
  ATTENDANCE_OVERVIEW_SUMMARY,
  ATTENDANCE_TREND_DATA,
  type AttendanceChartFilter,
} from "@/config/admin-dashboard-data";

export function AttendanceOverviewCard() {
  const [range, setRange] = useState<AttendanceChartFilter>("7d");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points = ATTENDANCE_TREND_DATA[range];

  // SVG coordinate space
  const width = 620;
  const height = 220;
  const padLeft = 42;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const minVal = 88;
  const maxVal = 98;
  const yTicks = [98, 95, 92, 88];

  function getX(index: number) {
    if (points.length <= 1) return padLeft;
    return padLeft + (index / (points.length - 1)) * plotWidth;
  }

  function getY(pct: number) {
    const clamped = Math.max(minVal, Math.min(maxVal, pct));
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return padTop + plotHeight - ratio * plotHeight;
  }

  const linePath = points
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(pt.percentage).toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${getX(points.length - 1).toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>
            Daily student attendance rate and trend analysis
          </CardDescription>
        </div>
        <Tabs
          tabs={[
            { id: "7d", label: "Last 7 Days" },
            { id: "14d", label: "Last 14 Days" },
          ]}
          activeTab={range}
          onChange={(id) => {
            setRange(id as AttendanceChartFilter);
            setHoveredIdx(null);
          }}
        />
      </CardHeader>

      <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Summary Metrics Strip */}
        <div className="es-analytics-summary">
          <div>
            <div className="es-metric-mini-label">Attendance Rate</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-primary)" }}
            >
              {ATTENDANCE_OVERVIEW_SUMMARY.percentage}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Present Students</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-success)" }}
            >
              {ATTENDANCE_OVERVIEW_SUMMARY.present.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Absent Students</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-danger)" }}
            >
              {ATTENDANCE_OVERVIEW_SUMMARY.absent}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Late Students</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-warning)" }}
            >
              {ATTENDANCE_OVERVIEW_SUMMARY.late}
            </div>
          </div>
        </div>

        {/* Interactive Tooltip Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontSize: "12px",
            color: "var(--es-text-muted)",
            minHeight: "20px",
          }}
        >
          <span>
            Showing{" "}
            <strong style={{ color: "var(--es-text-primary)" }}>
              {activePoint.day} ({activePoint.dateLabel})
            </strong>
            :{" "}
            <strong style={{ color: "var(--es-primary)" }}>
              {activePoint.percentage}%
            </strong>{" "}
            ({activePoint.present} present · {activePoint.absent} absent ·{" "}
            {activePoint.late} late)
          </span>
          <span style={{ fontSize: "11.5px", color: "var(--es-text-subtle)" }}>
            Hover points for details
          </span>
        </div>

        {/* Responsive SVG Line Chart */}
        <div style={{ width: "100%", overflow: "hidden", marginTop: "auto" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            role="img"
            aria-label="Attendance trend line chart"
          >
            <defs>
              <linearGradient
                id="es-attendance-area"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--es-chart-1)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--es-chart-1)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines & Y-Axis Labels */}
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="var(--es-chart-grid)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="var(--es-chart-axis)"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#es-attendance-area)" />

            {/* Attendance Trend Line */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--es-chart-1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points & X-Axis Labels */}
            {points.map((pt, i) => {
              const cx = getX(i);
              const cy = getY(pt.percentage);
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={pt.dateLabel}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Vertical hover guide */}
                  {isHovered && (
                    <line
                      x1={cx}
                      y1={padTop}
                      x2={cx}
                      y2={padTop + plotHeight}
                      stroke="var(--es-chart-guide)"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Invisible larger hit target */}
                  <circle cx={cx} cy={cy} r={14} fill="transparent" />

                  {/* Visible point */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5.5 : 4}
                    fill="var(--es-chart-dot-fill)"
                    stroke="var(--es-chart-1)"
                    strokeWidth={isHovered ? 3 : 2.2}
                  />

                  {/* Value label above hovered point */}
                  {isHovered && (
                    <g>
                      <rect
                        x={cx - 26}
                        y={cy - 28}
                        width={52}
                        height={20}
                        rx={4}
                        fill="var(--es-chart-tooltip-bg)"
                      />
                      <text
                        x={cx}
                        y={cy - 14}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="var(--es-chart-tooltip-fg)"
                      >
                        {pt.percentage}%
                      </text>
                    </g>
                  )}

                  {/* X-Axis Day Label */}
                  <text
                    x={cx}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight={isHovered || i === points.length - 1 ? "600" : "500"}
                    fill={
                      isHovered || i === points.length - 1
                        ? "var(--es-chart-axis-active)"
                        : "var(--es-chart-axis)"
                    }
                  >
                    {pt.day}
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

