"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ATTENDANCE_DISTRIBUTION_DATA } from "@/config/attendance-data";

export function AttendanceDistributionChart() {
  const segments = [
    {
      label: "Present",
      count: ATTENDANCE_DISTRIBUTION_DATA.present.count,
      percentage: ATTENDANCE_DISTRIBUTION_DATA.present.percentage,
      color: ATTENDANCE_DISTRIBUTION_DATA.present.color,
    },
    {
      label: "Absent",
      count: ATTENDANCE_DISTRIBUTION_DATA.absent.count,
      percentage: ATTENDANCE_DISTRIBUTION_DATA.absent.percentage,
      color: ATTENDANCE_DISTRIBUTION_DATA.absent.color,
    },
    {
      label: "Late",
      count: ATTENDANCE_DISTRIBUTION_DATA.late.count,
      percentage: ATTENDANCE_DISTRIBUTION_DATA.late.percentage,
      color: ATTENDANCE_DISTRIBUTION_DATA.late.color,
    },
    {
      label: "Excused",
      count: ATTENDANCE_DISTRIBUTION_DATA.excused.count,
      percentage: ATTENDANCE_DISTRIBUTION_DATA.excused.percentage,
      color: ATTENDANCE_DISTRIBUTION_DATA.excused.color,
    },
  ];

  // SVG Donut geometry
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader>
        <div>
          <CardTitle>Attendance Distribution</CardTitle>
          <CardDescription>
            Breakdown of Present, Absent, Late, and Excused students today
          </CardDescription>
        </div>
      </CardHeader>

      <CardBody
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* SVG Donut Chart */}
        <div style={{ position: "relative", width: 156, height: 156 }}>
          <svg
            viewBox="0 0 156 156"
            width="156"
            height="156"
            style={{ transform: "rotate(-90deg)" }}
            role="img"
            aria-label="Attendance distribution donut chart"
          >
            {segments.map((seg) => {
              const strokeDasharray = `${
                (seg.percentage / 100) * circumference
              } ${circumference}`;
              const strokeDashoffset = -(
                (cumulativePercent / 100) *
                circumference
              );
              cumulativePercent += seg.percentage;

              return (
                <circle
                  key={seg.label}
                  cx="78"
                  cy="78"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                lineHeight: 1.1,
              }}
            >
              94.6%
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--es-text-muted)",
                marginTop: "2px",
              }}
            >
              1,248 Total
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minWidth: "180px",
            flex: 1,
          }}
        >
          {segments.map((seg) => (
            <div
              key={seg.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "var(--es-radius-sm)",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: seg.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--es-text-primary)",
                  }}
                >
                  {seg.label}
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
                <strong style={{ color: "var(--es-text-primary)" }}>
                  {seg.count.toLocaleString("en-IN")}
                </strong>{" "}
                ({seg.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

