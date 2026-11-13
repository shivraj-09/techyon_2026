"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components/ui";
import type {
  TeacherAttendanceSessionRecord,
  TeacherClassItem,
} from "@/config/teacher-data";

export interface TeacherClassOverviewProps {
  classItem: TeacherClassItem;
  recentSessions?: TeacherAttendanceSessionRecord[];
}

export function TeacherClassOverview({
  classItem,
  recentSessions = [],
}: TeacherClassOverviewProps) {
  const isSubmitted = classItem.attendanceStatusToday === "Submitted";
  const progressTone =
    classItem.attendanceRate >= 92
      ? "good"
      : classItem.attendanceRate >= 82
        ? "moderate"
        : "low";

  return (
    <div className="es-stack">
      {/* Class Summary Statistics */}
      <div className="es-grid-4">
        <article className="es-stat-card">
          <div className="es-stat-top">
            <span
              style={{
                fontWeight: 600,
                color: "var(--es-text-secondary)",
                fontSize: "13px",
              }}
            >
              Enrolled Students
            </span>
            <span className="es-stat-icon-box">
              <Icon name="graduation-cap" size={16} />
            </span>
          </div>
          <div className="es-stat-value">{classItem.studentCount}</div>
          <div className="es-stat-meta">
            Section {classItem.section} · {classItem.academicYear}
          </div>
        </article>

        <article className="es-stat-card">
          <div className="es-stat-top">
            <span
              style={{
                fontWeight: 600,
                color: "var(--es-text-secondary)",
                fontSize: "13px",
              }}
            >
              Attendance Rate
            </span>
            <span
              className="es-stat-icon-box"
              style={{
                backgroundColor: "var(--es-success-bg)",
                borderColor: "var(--es-success-border)",
                color: "var(--es-success)",
              }}
            >
              <Icon name="trending-up" size={16} />
            </span>
          </div>
          <div className="es-stat-value">
            {classItem.attendanceRate.toFixed(1)}%
          </div>
          <div className="es-stat-meta">
            {classItem.presentCount} present · {classItem.absentCount} absent
          </div>
        </article>

        <article className="es-stat-card">
          <div className="es-stat-top">
            <span
              style={{
                fontWeight: 600,
                color: "var(--es-text-secondary)",
                fontSize: "13px",
              }}
            >
              Today&apos;s Roll Call
            </span>
            <span
              className="es-stat-icon-box"
              style={{
                backgroundColor: isSubmitted
                  ? "var(--es-success-bg)"
                  : "var(--es-warning-bg)",
                borderColor: isSubmitted
                  ? "var(--es-success-border)"
                  : "var(--es-warning-border)",
                color: isSubmitted
                  ? "var(--es-success)"
                  : "var(--es-warning)",
              }}
            >
              <Icon name="calendar-check" size={16} />
            </span>
          </div>
          <div className="es-stat-value">{classItem.attendanceStatusToday}</div>
          <div className="es-stat-meta">
            {classItem.scheduleTime} · {classItem.room}
          </div>
        </article>

        <article className="es-stat-card">
          <div className="es-stat-top">
            <span
              style={{
                fontWeight: 600,
                color: "var(--es-text-secondary)",
                fontSize: "13px",
              }}
            >
              Assigned Role
            </span>
            <span className="es-stat-icon-box">
              <Icon name="book-open" size={16} />
            </span>
          </div>
          <div className="es-stat-value" style={{ fontSize: "18px" }}>
            {classItem.isClassTeacher ? "Class Teacher" : "Subject Teacher"}
          </div>
          <div className="es-stat-meta">Subject: {classItem.subject}</div>
        </article>
      </div>

      {/* Snapshot & Recent Class Activity */}
      <div className="es-dashboard-grid-main">
        {/* Recent Attendance Snapshot */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Attendance Snapshot</CardTitle>
              <CardDescription>
                Daily attendance distribution and recent submissions for{" "}
                {classItem.name}
              </CardDescription>
            </div>
            <Link
              href={`/teacher/attendance?classId=${classItem.id}`}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name="calendar-check" size={14} />}
              >
                Mark Attendance
              </Button>
            </Link>
          </CardHeader>

          <CardBody
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                padding: "14px 16px",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
                borderRadius: "var(--es-radius-md)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--es-text-primary)" }}>
                  Overall Class Attendance
                </span>
                <strong style={{ color: "var(--es-primary)" }}>
                  {classItem.attendanceRate.toFixed(1)}%
                </strong>
              </div>

              <div className="es-progress-track">
                <div
                  className={`es-progress-fill ${progressTone}`}
                  style={{
                    width: `${Math.min(100, classItem.attendanceRate)}%`,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "12px",
                }}
              >
                <Badge variant="success" dot>
                  Present: {classItem.presentCount}
                </Badge>
                <Badge variant="danger" dot>
                  Absent: {classItem.absentCount}
                </Badge>
                <Badge variant="warning" dot>
                  Late: {classItem.lateCount}
                </Badge>
              </div>
            </div>

            {recentSessions.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "var(--es-text-secondary)",
                  }}
                >
                  Recent Recorded Sessions
                </div>
                {recentSessions.slice(0, 3).map((sess) => (
                  <div
                    key={sess.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      backgroundColor: "var(--es-bg-surface)",
                      fontSize: "12.5px",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--es-text-primary)" }}>
                        {sess.date}
                      </strong>
                      <span
                        style={{
                          color: "var(--es-text-muted)",
                          marginLeft: "8px",
                        }}
                      >
                        {sess.submittedAt}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "var(--es-text-secondary)" }}>
                        {sess.status === "Submitted"
                          ? `${sess.attendancePercentage}% (${sess.presentCount}/${sess.totalStudents})`
                          : "Awaiting roll call"}
                      </span>
                      <Badge
                        variant={
                          sess.status === "Submitted" ? "success" : "warning"
                        }
                        dot
                      >
                        {sess.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Class Activity */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Class Activity</CardTitle>
              <CardDescription>
                Latest teaching updates &amp; reminders for {classItem.name}
              </CardDescription>
            </div>
          </CardHeader>

          <CardBody flush>
            <div className="es-activity-list">
              {classItem.recentActivities.map((activity, idx) => (
                <div key={idx} className="es-activity-item">
                  <span className="es-activity-icon">
                    <Icon
                      name={idx === 0 ? "check-circle" : "file-text"}
                      size={15}
                    />
                  </span>
                  <div className="es-activity-content">
                    <div className="es-activity-text">{activity}</div>
                    <div className="es-activity-time">
                      {classItem.name} · {classItem.subject}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

