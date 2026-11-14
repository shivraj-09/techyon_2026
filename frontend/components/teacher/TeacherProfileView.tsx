"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
  Toast,
  type IconName,
} from "@/components/ui";
import {
  TEACHER_ASSIGNED_CLASSES,
  TEACHER_PROFILE,
  type TeacherProfile,
} from "@/config/teacher-data";

export interface TeacherProfileViewProps {
  profile?: TeacherProfile;
}

interface PreferenceToggleConfig {
  id:
    | "pendingAttendanceReminders"
    | "classAnnouncementAlerts"
    | "studentRosterUpdates"
    | "dailyScheduleSummary";
  label: string;
  description: string;
  icon: IconName;
}

const TEACHER_PREFERENCE_ITEMS: PreferenceToggleConfig[] = [
  {
    id: "pendingAttendanceReminders",
    label: "Pending attendance reminders",
    description:
      "Receive a reminder 15 minutes after a scheduled period if roll call is still pending.",
    icon: "calendar-check",
  },
  {
    id: "classAnnouncementAlerts",
    label: "School & class announcement alerts",
    description:
      "Get notified when School Admin publishes notices relevant to your classes.",
    icon: "megaphone",
  },
  {
    id: "studentRosterUpdates",
    label: "Student roster & enrollment updates",
    description:
      "Show alerts when a student transfers into or updates guardian contact in your classes.",
    icon: "user-plus",
  },
  {
    id: "dailyScheduleSummary",
    label: "Morning teaching schedule digest",
    description:
      "Display your daily 4-class Mathematics timetable summary at the start of the day.",
    icon: "clock",
  },
];

export function TeacherProfileView({
  profile = TEACHER_PROFILE,
}: TeacherProfileViewProps) {
  const [preferences, setPreferences] = useState({
    pendingAttendanceReminders: true,
    classAnnouncementAlerts: true,
    studentRosterUpdates: true,
    dailyScheduleSummary: false,
  });
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  function togglePref(id: PreferenceToggleConfig["id"]) {
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function handleSavePreferences() {
    setToast({
      title: "Preferences saved",
      description:
        "Your teacher workspace notification settings have been updated.",
    });
  }

  return (
    <div className="es-stack">
      {/* Faculty Profile Header Card */}
      <Card>
        <CardBody>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <Avatar
                name={profile.name}
                size="lg"
                style={{ width: "60px", height: "60px", fontSize: "20px" }}
              />
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "var(--es-text-primary)",
                    }}
                  >
                    {profile.name}
                  </h2>
                  <Badge variant="primary">Teacher</Badge>
                  <Badge variant="success" dot>
                    Active Faculty
                  </Badge>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--es-text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  {profile.designation} · {profile.department} Department
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginTop: "6px",
                    fontSize: "12.5px",
                    color: "var(--es-text-muted)",
                  }}
                >
                  <span>
                    Teacher ID:{" "}
                    <strong
                      style={{
                        fontFamily: "var(--es-font-mono)",
                        color: "var(--es-text-secondary)",
                      }}
                    >
                      {profile.teacherId}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>{profile.email}</span>
                  <span>·</span>
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>

            <Link href="/teacher/dashboard" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="md">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Assigned Subjects & Classes + Notification Toggles */}
      <div className="es-dashboard-grid-main">
        {/* Teaching Assignment Details */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Faculty Assignment</CardTitle>
              <CardDescription>
                Subjects and classes assigned for Academic Year{" "}
                {profile.academicYear}
              </CardDescription>
            </div>
          </CardHeader>

          <CardBody
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--es-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "8px",
                }}
              >
                Assigned Subjects
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {profile.subjects.map((subject) => (
                  <Badge key={subject} variant="primary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--es-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "8px",
                }}
              >
                Assigned Classes ({TEACHER_ASSIGNED_CLASSES.length})
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {TEACHER_ASSIGNED_CLASSES.map((cls) => (
                  <div
                    key={cls.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      backgroundColor: "var(--es-bg-app)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {cls.name} — {cls.subject}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {cls.studentCount} students · {cls.scheduleTime} ·{" "}
                        {cls.room}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {cls.isClassTeacher && (
                        <Badge variant="primary">Class Teacher</Badge>
                      )}
                      <Link
                        href={`/teacher/classes/${cls.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Button variant="ghost" size="sm">
                          Open
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* UI-Only Notification & Workspace Preferences */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Notification &amp; Workspace Preferences</CardTitle>
              <CardDescription>
                Customize reminders for your daily classes and notices
              </CardDescription>
            </div>
          </CardHeader>

          <CardBody
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {TEACHER_PREFERENCE_ITEMS.map((item) => {
              const enabled = preferences[item.id];
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "var(--es-radius-md)",
                    border: "1px solid var(--es-border-subtle)",
                    backgroundColor: "var(--es-bg-app)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--es-radius-md)",
                        backgroundColor: "var(--es-primary-subtle)",
                        color: "var(--es-primary)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <Icon name={item.icon} size={16} />
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--es-text-muted)",
                          marginTop: "2px",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={item.label}
                    onClick={() => togglePref(item.id)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: "9999px",
                      border: 0,
                      padding: "2px",
                      cursor: "pointer",
                      backgroundColor: enabled
                        ? "var(--es-primary)"
                        : "var(--es-border-strong)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: enabled ? "flex-end" : "flex-start",
                      transition: "background-color 0.15s ease",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "9999px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </CardBody>

          <CardFooter>
            <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
              Preview workspace settings (local UI state)
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSavePreferences}
            >
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </div>

      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}

