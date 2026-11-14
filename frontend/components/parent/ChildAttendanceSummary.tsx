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
import type { ParentChildRecord } from "@/config/parent-data";

export interface ChildAttendanceSummaryProps {
  child: ParentChildRecord;
  title?: string;
  showChart?: boolean;
}

export function ChildAttendanceSummary({
  child,
  title,
  showChart = true,
}: ChildAttendanceSummaryProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const trend = child.attendanceTrend30d;

  const width = 620;
  const height = 210;
  const padLeft = 42;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 32;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const minVal = 88;
  const maxVal = 100;
  const yTicks = [100, 96, 92, 88];

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
    hoveredIdx !== null && hoveredIdx < trend.length
      ? trend[hoveredIdx]
      : trend[trend.length - 1];

  const gradientId = `es-parent-att-grad-${child.id}`;

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader>
        <div>
          <CardTitle>
            {title || `Attendance Overview — ${child.fullName}`}
          </CardTitle>
          <CardDescription>
            {child.className} · Academic Year {child.academicYear} (Read-only)
          </CardDescription>
        </div>
        <Badge
          variant={child.attendancePercentage >= 90 ? "success" : "warning"}
          dot
        >
          {child.attendancePercentage.toFixed(1)}% Overall
        </Badge>
      </CardHeader>

      <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 5-Metric Summary Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))",
            gap: "10px",
            padding: "12px 14px",
            backgroundColor: "var(--es-bg-app)",
            border: "1px solid var(--es-border-subtle)",
            borderRadius: "var(--es-radius-md)",
            marginBottom: showChart ? "16px" : 0,
          }}
        >
          <div>
            <div className="es-metric-mini-label">Attendance %</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-primary)" }}
            >
              {child.attendancePercentage.toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="es-metric-mini-label">Present Days</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-success)" }}
            >
              {child.presentDays}
            </div>
          </div>

          <div>
            <div className="es-metric-mini-label">Absent Days</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-danger)" }}
            >
              {child.absentDays}
            </div>
          </div>

          <div>
            <div className="es-metric-mini-label">Late Arrivals</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-warning)" }}
            >
              {child.lateDays}
            </div>
          </div>

          <div>
            <div className="es-metric-mini-label">Excused Days</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-info)" }}
            >
              {child.excusedDays}
            </div>
          </div>
        </div>

        {showChart && trend.length > 0 && (
          <>
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
                    30-Day Trend · {activePoint.day} ({activePoint.date}):
                  </strong>{" "}
                  <strong style={{ color: "var(--es-primary)" }}>
                    {activePoint.percentage.toFixed(1)}%
                  </strong>
                </span>
                <span
                  style={{ fontSize: "11.5px", color: "var(--es-text-subtle)" }}
                >
                  Hover data points for daily cumulative rate
                </span>
              </div>
            )}

            <div
              style={{ width: "100%", overflow: "hidden", marginTop: "auto" }}
            >
              <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{ width: "100%", height: "auto", display: "block" }}
                role="img"
                aria-label={`${child.fullName} 30-day attendance trend chart`}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--es-chart-1)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="var(--es-chart-1)" stopOpacity="0.0" />
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

                {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="var(--es-chart-1)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {trend.map((pt, i) => {
                  const cx = getX(i);
                  const cy = getY(pt.percentage);
                  const isHovered = hoveredIdx === i;
                  const showLabel =
                    i === 0 ||
                    i === trend.length - 1 ||
                    i % 2 === 0 ||
                    isHovered;
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
                          stroke="var(--es-chart-guide)"
                          strokeWidth="1.5"
                        />
                      )}
                      <circle cx={cx} cy={cy} r={12} fill="transparent" />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 5 : 3.5}
                        fill="var(--es-chart-dot-fill)"
                        stroke="var(--es-chart-1)"
                        strokeWidth={isHovered ? 2.8 : 2}
                      />
                      {showLabel && (
                        <text
                          x={cx}
                          y={height - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fill="var(--es-chart-axis)"
                        >
                          {pt.day}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
