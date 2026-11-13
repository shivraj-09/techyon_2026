"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { CLASS_ATTENDANCE_COMPARISON } from "@/config/attendance-data";

export function ClassAttendanceChart() {
  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader>
        <div>
          <CardTitle>Class-wise Attendance Comparison</CardTitle>
          <CardDescription>
            Horizontal comparison of attendance rates across grade sections
          </CardDescription>
        </div>
      </CardHeader>

      <CardBody
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "13px",
        }}
      >
        {CLASS_ATTENDANCE_COMPARISON.map((item) => {
          const isGood = item.percentage >= 95;
          const isModerate = item.percentage >= 91 && item.percentage < 95;
          const barColor = isGood
            ? "var(--es-chart-3)"
            : isModerate
              ? "var(--es-chart-4)"
              : "var(--es-chart-5)";

          return (
            <div
              key={item.classId}
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                  }}
                >
                  {item.className}
                </span>
                <span style={{ color: "var(--es-text-muted)" }}>
                  {item.present}/{item.total} present ·{" "}
                  <strong style={{ color: barColor }}>
                    {item.percentage.toFixed(1)}%
                  </strong>
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "var(--es-bg-subtle)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.percentage}%`,
                    height: "100%",
                    backgroundColor: barColor,
                    borderRadius: "999px",
                    transition: "width 200ms ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

