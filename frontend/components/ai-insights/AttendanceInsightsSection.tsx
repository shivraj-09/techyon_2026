"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import type {
  AttendanceTrendPoint,
  ClassAttendanceComparison,
  LowAttendanceStudentRecord,
} from "@/config/ai-insights-data";

export interface AttendanceInsightsSectionProps {
  periodLabel: string;
  trendPoints: AttendanceTrendPoint[];
  classComparison: ClassAttendanceComparison[];
  students: LowAttendanceStudentRecord[];
}

export function AttendanceInsightsSection({
  periodLabel,
  trendPoints,
  classComparison,
  students,
}: AttendanceInsightsSectionProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [thresholdFilter, setThresholdFilter] = useState<string>("75");

  const width = 620;
  const height = 220;
  const padLeft = 40;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const minY = 84;
  const maxY = 98;
  const yTicks = [98, 94, 90, 84];

  function getX(i: number) {
    if (trendPoints.length <= 1) return padLeft;
    return padLeft + (i / (trendPoints.length - 1)) * plotW;
  }

  function getY(pct: number) {
    const clamped = Math.max(minY, Math.min(maxY, pct));
    const ratio = (clamped - minY) / (maxY - minY);
    return padTop + plotH - ratio * plotH;
  }

  const currentPath = trendPoints
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(
          pt.attendancePct,
        ).toFixed(1)}`,
    )
    .join(" ");

  const prevPath = trendPoints
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(
          pt.previousPeriodPct,
        ).toFixed(1)}`,
    )
    .join(" ");

  const activePoint =
    hoveredIdx !== null
      ? trendPoints[hoveredIdx]
      : trendPoints[trendPoints.length - 1];

  const classOptions = useMemo(
    () => [
      { value: "all", label: "All Classes" },
      ...Array.from(new Set(students.map((s) => s.className)))
        .sort()
        .map((cls) => ({ value: cls, label: cls })),
    ],
    [students],
  );

  const filteredStudents = useMemo(() => {
    const maxPct = Number(thresholdFilter);
    return students.filter((s) => {
      const matchesClass = classFilter === "all" || s.className === classFilter;
      const matchesThreshold = s.attendancePct < maxPct;
      return matchesClass && matchesThreshold;
    });
  }, [students, classFilter, thresholdFilter]);

  function getStatusVariant(
    status: LowAttendanceStudentRecord["status"],
  ): "danger" | "warning" | "primary" {
    if (status === "Critical") return "danger";
    if (status === "Below Threshold") return "warning";
    return "primary";
  }

  return (
    <section aria-labelledby="ai-attendance-heading" className="es-stack">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h2
            id="ai-attendance-heading"
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--es-text-primary)",
              margin: 0,
            }}
          >
            Attendance Analysis
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--es-text-muted)",
              marginTop: "2px",
            }}
          >
            Aggregate daily trends, section comparisons, and students tracking
            below configured attendance thresholds ({periodLabel}).
          </p>
        </div>
        <Badge variant="neutral">Rule-based summary</Badge>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "16px",
        }}
      >
        {/* Trend Line Chart */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader>
            <div>
              <CardTitle>Attendance Trend Over Time</CardTitle>
              <CardDescription>
                Current period vs previous period aggregate rate
              </CardDescription>
            </div>
            <div className="es-chart-legend">
              <span className="es-legend-item">
                <span
                  className="es-legend-swatch"
                  style={{ backgroundColor: "var(--es-primary)" }}
                />
                Current
              </span>
              <span className="es-legend-item">
                <span
                  className="es-legend-swatch"
                  style={{ backgroundColor: "var(--es-chart-2-active)" }}
                />
                Previous
              </span>
            </div>
          </CardHeader>

          <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {activePoint && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-text-muted)",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                <span>
                  <strong style={{ color: "var(--es-text-primary)" }}>
                    {activePoint.dateLabel}:
                  </strong>{" "}
                  <strong style={{ color: "var(--es-primary)" }}>
                    {activePoint.attendancePct.toFixed(1)}%
                  </strong>{" "}
                  (prev: {activePoint.previousPeriodPct.toFixed(1)}%)
                  {activePoint.isMonday && " · Monday dip observed"}
                </span>
                <span style={{ color: "var(--es-text-subtle)" }}>
                  Hover points to inspect
                </span>
              </div>
            )}

            <div style={{ width: "100%", overflowX: "auto", marginTop: "auto" }}>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{ width: "100%", height: "auto", display: "block" }}
                role="img"
                aria-label="Attendance trend comparison line chart"
              >
                {yTicks.map((tick) => {
                  const y = getY(tick);
                  return (
                    <g key={tick}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={width - padRight}
                        y2={y}
                        stroke="var(--es-border)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10.5"
                        fill="var(--es-text-subtle)"
                      >
                        {tick}%
                      </text>
                    </g>
                  );
                })}

                <path
                  d={prevPath}
                  fill="none"
                  stroke="var(--es-chart-2-active)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <path
                  d={currentPath}
                  fill="none"
                  stroke="var(--es-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {trendPoints.map((pt, i) => {
                  const cx = getX(i);
                  const cy = getY(pt.attendancePct);
                  const isActive = hoveredIdx === i;
                  return (
                    <g
                      key={pt.label}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle cx={cx} cy={cy} r={14} fill="transparent" />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? 5.5 : 3.5}
                        fill={
                          pt.isMonday
                            ? "var(--es-warning)"
                            : "var(--es-primary)"
                        }
                        stroke="var(--es-bg-surface)"
                        strokeWidth={2}
                      />
                      <text
                        x={cx}
                        y={height - 10}
                        textAnchor="middle"
                        fontSize="10.5"
                        fill="var(--es-text-subtle)"
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

        {/* Class Attendance Comparison Chart */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader>
            <div>
              <CardTitle>Attendance Across Classes</CardTitle>
              <CardDescription>
                Percentage comparison with 90% school benchmark
              </CardDescription>
            </div>
            <Badge variant="neutral">Target: 90%</Badge>
          </CardHeader>

          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              {classComparison.map((cls) => {
                const delta = +(cls.attendancePct - cls.prevPeriodPct).toFixed(
                  1,
                );
                const isLow = cls.attendancePct < 90;
                return (
                  <div key={cls.classId}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "12.5px",
                        marginBottom: "4px",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {cls.className}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        <strong
                          style={{
                            color: isLow
                              ? "var(--es-warning)"
                              : "var(--es-text-primary)",
                          }}
                        >
                          {cls.attendancePct.toFixed(1)}%
                        </strong>{" "}
                        <span
                          style={{
                            color:
                              delta < 0
                                ? "var(--es-warning)"
                                : "var(--es-success)",
                          }}
                        >
                          ({delta > 0 ? `+${delta}` : delta} pts)
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: "var(--es-bg-muted)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, cls.attendancePct)}%`,
                          height: "100%",
                          borderRadius: "999px",
                          backgroundColor: isLow
                            ? "var(--es-warning)"
                            : "var(--es-primary)",
                          transition: "width 200ms ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Low Attendance Students Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Students Below Attendance Threshold</CardTitle>
            <CardDescription>
              Recorded attendance counts only — no automated inference regarding
              absence reasons
            </CardDescription>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: "145px" }}>
              <Select
                aria-label="Filter low-attendance students by class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                options={classOptions}
              />
            </div>
            <div style={{ minWidth: "155px" }}>
              <Select
                aria-label="Filter by attendance threshold"
                value={thresholdFilter}
                onChange={(e) => setThresholdFilter(e.target.value)}
                options={[
                  { value: "75", label: "Threshold: Below 75%" },
                  { value: "80", label: "Threshold: Below 80%" },
                  { value: "70", label: "Threshold: Below 70%" },
                ]}
              />
            </div>
          </div>
        </CardHeader>

        <CardBody flush>
          {filteredStudents.length === 0 ? (
            <div style={{ padding: "24px" }}>
              <EmptyState
                icon="check-circle"
                title="No students match the selected threshold"
                description="Try selecting a higher threshold or switching back to All Classes."
              />
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Student Name</TableHeaderCell>
                  <TableHeaderCell>Class</TableHeaderCell>
                  <TableHeaderCell>Attendance %</TableHeaderCell>
                  <TableHeaderCell>Absences</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: "right" }}>
                    Action
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((stu) => (
                  <TableRow key={stu.id}>
                    <TableCell>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {stu.studentName}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-subtle)",
                        }}
                      >
                        {stu.studentId}
                      </div>
                    </TableCell>
                    <TableCell>{stu.className}</TableCell>
                    <TableCell>
                      <strong
                        style={{
                          color:
                            stu.attendancePct < 70
                              ? "var(--es-danger)"
                              : "var(--es-warning)",
                        }}
                      >
                        {stu.attendancePct.toFixed(1)}%
                      </strong>
                    </TableCell>
                    <TableCell>
                      {stu.absences} of {stu.sessionsRecorded} days
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(stu.status)}>
                        {stu.status}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: "right" }}>
                      <Link href={`/admin/students/${stu.id}`}>
                        <Button variant="secondary" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </section>
  );
}

