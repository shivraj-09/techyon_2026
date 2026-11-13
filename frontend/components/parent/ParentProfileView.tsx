"use client";

import React, { useEffect, useState } from "react";
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
import { formatINR } from "@/config/fee-data";
import {
  DEFAULT_PARENT_NOTIFICATION_PREFERENCES,
  PARENT_CHILDREN,
  PARENT_PROFILE,
  getStoredParentPreferences,
  saveStoredParentPreferences,
  type ParentChildRecord,
  type ParentNotificationPreferences,
  type ParentProfile,
} from "@/config/parent-data";

export interface ParentProfileViewProps {
  profile?: ParentProfile;
  childrenList?: ParentChildRecord[];
}

interface ParentPreferenceToggleConfig {
  id: keyof ParentNotificationPreferences;
  label: string;
  description: string;
  icon: IconName;
}

const PARENT_PREFERENCE_ITEMS: ParentPreferenceToggleConfig[] = [
  {
    id: "attendanceAlerts",
    label: "Daily attendance alerts",
    description:
      "Get notified when your child is marked absent, late, or excused.",
    icon: "clipboard-check",
  },
  {
    id: "feeReminders",
    label: "Fee invoice & due date reminders",
    description:
      "Receive timely reminders ahead of upcoming tuition or transport due dates.",
    icon: "indian-rupee",
  },
  {
    id: "schoolAnnouncements",
    label: "School-wide announcements",
    description:
      "Stay informed about PTM schedules, exam timetables, and holiday circulars.",
    icon: "megaphone",
  },
  {
    id: "classUpdates",
    label: "Class-specific teacher updates",
    description:
      "Receive notices shared directly by your children's class teachers.",
    icon: "book-open",
  },
  {
    id: "emailDigest",
    label: "Weekly email summary digest",
    description:
      "Send a consolidated Friday evening attendance and fee digest to your email.",
    icon: "bell",
  },
];

export function ParentProfileView({
  profile = PARENT_PROFILE,
  childrenList = PARENT_CHILDREN,
}: ParentProfileViewProps) {
  const [preferences, setPreferences] =
    useState<ParentNotificationPreferences>(
      DEFAULT_PARENT_NOTIFICATION_PREFERENCES,
    );
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setPreferences(getStoredParentPreferences());
  }, []);

  function togglePreference(key: keyof ParentNotificationPreferences) {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function handleSavePreferences() {
    saveStoredParentPreferences(preferences);
    setToast({
      title: "Notification preferences saved",
      description:
        "Your parent portal alert preferences have been updated (UI preview).",
    });
  }

  return (
    <div className="es-stack">
      {/* Parent Guardian Profile Header */}
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
                style={{ width: 60, height: 60, fontSize: "20px" }}
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
                  <Badge variant="primary">Parent / Guardian</Badge>
                  <Badge variant="success" dot>
                    {childrenList.length} Linked Children
                  </Badge>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--es-text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  Primary Guardian ({profile.relationship}) ·{" "}
                  {profile.occupation}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "6px",
                    fontSize: "12.5px",
                    color: "var(--es-text-muted)",
                  }}
                >
                  <span>{profile.email}</span>
                  <span>·</span>
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>

            <Link href="/parent/dashboard" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="md">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Guardian Details + Linked Children | Notification Preferences */}
      <div className="es-dashboard-grid-main">
        {/* Left Column: Guardian Contact + Linked Children */}
        <div className="es-stack">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Guardian Contact Information</CardTitle>
                <CardDescription>
                  Verified guardian profile details on school record
                </CardDescription>
              </div>
              <Badge variant="neutral">Read-Only</Badge>
            </CardHeader>

            <CardBody>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: "14px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
                  >
                    Full Name
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "3px" }}>
                    {profile.name}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
                  >
                    Email Address
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "3px" }}>
                    {profile.email}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
                  >
                    Phone Number
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "3px" }}>
                    {profile.phone}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
                  >
                    Emergency Contact
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "3px" }}>
                    {profile.emergencyContact}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
                  >
                    Residential Address
                  </div>
                  <div
                    style={{
                      fontWeight: 500,
                      marginTop: "3px",
                      color: "var(--es-text-secondary)",
                    }}
                  >
                    {profile.address}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Linked Children ({childrenList.length})</CardTitle>
                <CardDescription>
                  Students connected to your guardian account
                </CardDescription>
              </div>
            </CardHeader>

            <CardBody
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "var(--es-radius-md)",
                    border: "1px solid var(--es-border-subtle)",
                    backgroundColor: "var(--es-bg-app)",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Avatar name={child.fullName} size="md" />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "14px",
                            color: "var(--es-text-primary)",
                          }}
                        >
                          {child.fullName}
                        </strong>
                        <Badge variant="primary">{child.relationship}</Badge>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--es-text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        {child.studentId} · {child.className} · Attendance{" "}
                        {child.attendancePercentage.toFixed(1)}% ·{" "}
                        {child.outstandingBalance > 0
                          ? `Fee due ${formatINR(child.outstandingBalance)}`
                          : "Fees paid"}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/parent/children/${child.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<Icon name="chevron-right" size={14} />}
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: UI-Only Notification Preference Toggles */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader>
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which updates you want highlighted in your portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardBody
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flex: 1,
            }}
          >
            {PARENT_PREFERENCE_ITEMS.map((item) => {
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
                    onClick={() => togglePreference(item.id)}
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
              Saved locally in preview session
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
