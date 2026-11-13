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
import { ATTENDANCE_30D_TREND } from "@/config/attendance-data";

export function AttendanceTrendChart() {
  const [windowSize, setWindowSize] = useState<"30d" | "14d">("30d");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points =
    windowSize === "30d"
      ? ATTENDANCE_30D_TREND
      : ATTENDANCE_30D_TREND.slice(-14);

  const width = 680;
  const height = 230;
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
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(
          pt.percentage,
        ).toFixed(1)}`,
    )
    .join(" ");

  const areaPath = `${linePath} L ${getX(points.length - 1).toFixed(1)} ${(
    padTop + plotHeight
  ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;

  const activePoint =
    hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader>
        <div>
          <CardTitle>School-wide Attendance Trend (30 Days)</CardTitle>
          <CardDescription>
            Daily attendance percentage across all enrolled classes
          </CardDescription>
        </div>
        <Tabs
          tabs={[
            { id: "30d", label: "Last 30 Days" },
            { id: "14d", label: "Last 14 Days" },
          ]}
          activeTab={windowSize}
          onChange={(id) => {
            setWindowSize(id as "30d" | "14d");
            setHoveredIdx(null);
          }}
        />
      </CardHeader>

      <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--es-text-muted)",
            marginBottom: "10px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span>
            <strong style={{ color: "var(--es-text-primary)" }}>
              {activePoint.dayLabel} ({activePoint.date}):
            </strong>{" "}
            <strong style={{ color: "var(--es-primary)" }}>
              {activePoint.percentage}%
            </strong>{" "}
            ({activePoint.present} present · {activePoint.absent} absent ·{" "}
            {activePoint.late} late · {activePoint.excused} excused)
          </span>
          <span style={{ fontSize: "11.5px", color: "var(--es-text-subtle)" }}>
            Hover chart for daily breakdown
          </span>
        </div>

        <div style={{ width: "100%", overflow: "hidden", marginTop: "auto" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            role="img"
            aria-label="30-day attendance trend line chart"
          >
            <defs>
              <linearGradient
                id="es-att-30d-gradient"
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

            <path d={areaPath} fill="url(#es-att-30d-gradient)" />

            <path
              d={linePath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((pt, i) => {
              const cx = getX(i);
              const cy = getY(pt.percentage);
              const isHovered = hoveredIdx === i;
              const showLabel =
                i === 0 ||
                i === points.length - 1 ||
                i % Math.max(1, Math.floor(points.length / 6)) === 0;

              return (
                <g
                  key={`${pt.date}-${i}`}
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
                  <circle cx={cx} cy={cy} r={10} fill="transparent" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5 : 3}
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth={isHovered ? 2.8 : 2}
                  />
                  {showLabel && (
                    <text
                      x={cx}
                      y={height - 10}
                      textAnchor="middle"
                      fontSize="10.5"
                      fill="#64748b"
                    >
                      {pt.dayLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </CardBody>
    </Card>
  );
}

