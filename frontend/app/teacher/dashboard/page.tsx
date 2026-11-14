"use client";

import React from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
  type IconName,
} from "@/components/ui";
import {
  TeacherAttendanceChart,
  TeacherDashboardStats,
  TodaySchedule,
} from "@/components/teacher";
import {
  TEACHER_PROFILE,
  TEACHER_RECENT_ACTIVITIES,
  type TeacherRecentActivityItem,
} from "@/config/teacher-data";

interface TeacherQuickAction {
  id: string;
  label: string;
  subtitle: string;
  icon: IconName;
  href: string;
}

const TEACHER_QUICK_ACTIONS: TeacherQuickAction[] = [
  {
    id: "qa-mark-attendance",
    label: "Mark Attendance",
    subtitle: "Submit daily roll for assigned classes",
    icon: "clipboard-check",
    href: "/teacher/attendance",
  },
  {
    id: "qa-view-classes",
    label: "View My Classes",
    subtitle: "Class rosters, schedule & overview",
    icon: "book-open",
    href: "/teacher/classes",
  },
  {
    id: "qa-view-students",
    label: "View Students",
    subtitle: "Academic & attendance profiles",
    icon: "graduation-cap",
    href: "/teacher/students",
  },
  {
    id: "qa-publish-announcement",
    label: "Publish Announcement",
    subtitle: "Share updates with your classes",
    icon: "megaphone",
    href: "/teacher/announcements?create=1",
  },
];

function getActivityIconStyle(
  variant: TeacherRecentActivityItem["badgeVariant"],
): React.CSSProperties {
  if (variant === "success") {
    return {
      backgroundColor: "var(--es-success-bg)",
      color: "var(--es-success)",
      border: "1px solid var(--es-success-border)",
    };
  }
  if (variant === "warning") {
    return {
      backgroundColor: "var(--es-warning-bg)",
      color: "var(--es-warning)",
      border: "1px solid var(--es-warning-border)",
    };
  }
  if (variant === "primary") {
    return {
      backgroundColor: "var(--es-primary-subtle)",
      color: "var(--es-primary)",
      border: "1px solid var(--es-primary-border)",
    };
  }
  return {
    backgroundColor: "var(--es-bg-subtle)",
    color: "var(--es-text-secondary)",
    border: "1px solid var(--es-border)",
  };
}

export default function TeacherDashboardPage() {
  return (
    <AppLayout
      defaultRole="teacher"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "Dashboard" },
      ]}
    >
      <div className="es-stack">
        <div>
          <PageHeader
            title="Dashboard"
            subtitle="Your teaching workspace at a glance."
            actions={
              <>
                <span className="es-date-pill" title="Current academic date">
                  <Icon
                    name="calendar"
                    size={14}
                    style={{ color: "var(--es-text-muted)" }}
                  />
                  <span>13 Nov 2026</span>
                </span>

                <Link
                  href="/teacher/attendance?classId=class-9-a"
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Icon name="clipboard-check" size={15} />}
                  >
                    Mark Attendance
                  </Button>
                </Link>
              </>
            }
          />

          <div className="es-welcome-strip">
            <div>
              <h2 className="es-welcome-greeting">
                Good morning, {TEACHER_PROFILE.name}
              </h2>
              <p className="es-welcome-context">
                {TEACHER_PROFILE.department} Faculty ({TEACHER_PROFILE.teacherId})
                {" · "}You have 4 classes scheduled today and 1 pending
                attendance submission.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge variant="success" dot>
                Academic Session {TEACHER_PROFILE.academicYear}
              </Badge>
            </div>
          </div>
        </div>

        {/* 4 Compact Teacher KPI Cards */}
        <TeacherDashboardStats />

        {/* Today's Classes Schedule */}
        <TodaySchedule />

        {/* Attendance Trends & Recent Activity */}
        <section
          className="es-dashboard-grid-main"
          aria-label="Attendance Trends and Recent Activity"
        >
          <TeacherAttendanceChart />

          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <CardHeader>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest attendance submissions, roster updates, and notices
                </CardDescription>
              </div>
              <Link
                href="/teacher/notifications"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<Icon name="chevron-right" size={14} />}
                >
                  Notifications
                </Button>
              </Link>
            </CardHeader>

            <CardBody flush style={{ flex: 1 }}>
              <div className="es-activity-list">
                {TEACHER_RECENT_ACTIVITIES.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="es-activity-item"
                    style={{ textDecoration: "none" }}
                  >
                    <span
                      className="es-activity-icon"
                      style={getActivityIconStyle(item.badgeVariant)}
                    >
                      <Icon name={item.icon} size={15} />
                    </span>
                    <div className="es-activity-content" style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className="es-activity-text"
                          style={{ fontWeight: 600 }}
                        >
                          {item.title}
                        </span>
                        <Badge variant={item.badgeVariant}>
                          {item.badgeText}
                        </Badge>
                      </div>
                      <div
                        style={{
                          fontSize: "12.5px",
                          color: "var(--es-text-secondary)",
                          marginTop: "2px",
                          lineHeight: 1.45,
                        }}
                      >
                        {item.detail}
                      </div>
                      <div className="es-activity-time">{item.time}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardBody>

            <CardFooter>
              <Link
                href="/teacher/attendance"
                style={{
                  textDecoration: "none",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--es-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Review attendance workspace</span>
                <Icon name="chevron-right" size={14} />
              </Link>
              <span
                style={{ fontSize: "11.5px", color: "var(--es-text-subtle)" }}
              >
                Scoped to 4 assigned classes
              </span>
            </CardFooter>
          </Card>
        </section>

        {/* Teacher-only Quick Actions */}
        <section aria-label="Teacher Quick Actions">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <h2
              style={{
                fontSize: "14.5px",
                fontWeight: 600,
                color: "var(--es-text-primary)",
                margin: 0,
              }}
            >
              Quick Actions
            </h2>
            <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
              Daily teaching &amp; classroom workflows
            </span>
          </div>

          <div className="es-quick-actions-grid">
            {TEACHER_QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="es-quick-action-card"
                style={{ textDecoration: "none" }}
              >
                <span className="es-quick-action-icon">
                  <Icon name={action.icon} size={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="es-quick-action-label">{action.label}</div>
                  <div className="es-quick-action-sub">{action.subtitle}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
