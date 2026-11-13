"use client";

import React, { useEffect, useMemo, useState } from "react";
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
} from "@/components/ui";
import { PriorityBadge } from "@/components/announcements";
import {
  ChildAttendanceSummary,
  ChildCard,
  ParentDashboardStats,
  ParentFeeSummary,
} from "@/components/parent";
import {
  PARENT_ANNOUNCEMENTS,
  PARENT_CHILDREN,
  PARENT_NOTIFICATIONS,
  PARENT_OVERVIEW_STATS,
  PARENT_PROFILE,
  getSelectedChildId,
  getStoredParentNotifications,
  getSyncedParentAnnouncements,
  saveSelectedChildId,
  type ParentAnnouncementItem,
  type ParentChildRecord,
  type ParentNotificationItem,
} from "@/config/parent-data";

export default function ParentDashboardPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    PARENT_CHILDREN[0]?.id ?? "stu-1024",
  );
  const [notifications, setNotifications] = useState<ParentNotificationItem[]>(
    PARENT_NOTIFICATIONS,
  );
  const [announcements, setAnnouncements] = useState<ParentAnnouncementItem[]>(
    PARENT_ANNOUNCEMENTS,
  );

  useEffect(() => {
    setSelectedChildId(getSelectedChildId());
    setNotifications(getStoredParentNotifications());
    setAnnouncements(getSyncedParentAnnouncements());
  }, []);

  const selectedChild: ParentChildRecord = useMemo(
    () =>
      PARENT_CHILDREN.find((c) => c.id === selectedChildId) ??
      PARENT_CHILDREN[0],
    [selectedChildId],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const recentAnnouncements = useMemo(
    () => announcements.slice(0, 3),
    [announcements],
  );

  const recentNotifications = useMemo(
    () => notifications.slice(0, 4),
    [notifications],
  );

  function handleSelectChild(child: ParentChildRecord) {
    setSelectedChildId(child.id);
    saveSelectedChildId(child.id);
  }

  return (
    <AppLayout
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "Dashboard" },
      ]}
    >
      <div className="es-stack">
        <div>
          <PageHeader
            title="Dashboard"
            subtitle="Stay connected with your children's school journey."
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

                <Link href="/parent/fees" style={{ textDecoration: "none" }}>
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<Icon name="credit-card" size={15} />}
                  >
                    Fee Details
                  </Button>
                </Link>
              </>
            }
          />

          <div className="es-welcome-strip">
            <div>
              <h2 className="es-welcome-greeting">
                Welcome back, {PARENT_PROFILE.name}
              </h2>
              <p className="es-welcome-context">
                Parent / Guardian · Linked to {PARENT_CHILDREN.length} children
                (Aarav Naik &amp; Ananya Naik) · Academic Year 2026-2027
              </p>
            </div>
            <div className="es-welcome-badge">
              <Icon name="check-circle" size={15} />
              <span>Guardian Portal Active</span>
            </div>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <ParentDashboardStats
          stats={PARENT_OVERVIEW_STATS}
          unreadCount={unreadCount}
        />

        {/* My Children Selector Cards */}
        <section aria-label="My Children">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--es-text-primary)",
                }}
              >
                My Children
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "13px",
                  color: "var(--es-text-muted)",
                }}
              >
                Click a child card to preview their attendance and fee summary
                below.
              </p>
            </div>
            <Link href="/parent/children" style={{ textDecoration: "none" }}>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<Icon name="chevron-right" size={14} />}
              >
                View All Children
              </Button>
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {PARENT_CHILDREN.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                selected={child.id === selectedChild.id}
                onSelect={handleSelectChild}
              />
            ))}
          </div>
        </section>

        {/* Active Child Attendance Summary & Fee Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          <ChildAttendanceSummary child={selectedChild} showChart />

          <ParentFeeSummary
            totalFees={selectedChild.totalFees}
            amountPaid={selectedChild.amountPaid}
            outstandingBalance={selectedChild.outstandingBalance}
            nextDueDate={selectedChild.nextDueDate}
            childName={selectedChild.fullName}
            viewDetailsHref="/parent/fees"
            title={`Fee Summary — ${selectedChild.fullName}`}
          />
        </div>

        {/* Recent Announcements & Recent Notifications */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          {/* Recent Announcements */}
          <Card style={{ display: "flex", flexDirection: "column" }}>
            <CardHeader>
              <div>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>
                  Latest school and class notices for parents
                </CardDescription>
              </div>
              <Badge variant="neutral">Read-Only</Badge>
            </CardHeader>
            <CardBody
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {recentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--es-radius-md)",
                    border: "1px solid var(--es-border-subtle)",
                    backgroundColor: "var(--es-bg-app)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <PriorityBadge priority={ann.priority} />
                      <Badge variant="neutral">{ann.category}</Badge>
                    </div>
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      {ann.publishedDate}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--es-text-primary)",
                    }}
                  >
                    {ann.title}
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12.5px",
                      color: "var(--es-text-secondary)",
                      lineHeight: 1.45,
                    }}
                  >
                    {ann.shortDescription}
                  </p>
                </div>
              ))}
            </CardBody>
            <CardFooter
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                Showing latest {recentAnnouncements.length} announcements
              </span>
              <Link
                href="/parent/announcements"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<Icon name="chevron-right" size={14} />}
                >
                  View Announcements
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Recent Notifications */}
          <Card style={{ display: "flex", flexDirection: "column" }}>
            <CardHeader>
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  Attendance updates, fee reminders &amp; notices
                </CardDescription>
              </div>
              <Badge variant={unreadCount > 0 ? "primary" : "neutral"} dot={unreadCount > 0}>
                {unreadCount} Unread
              </Badge>
            </CardHeader>
            <CardBody
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {recentNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.targetHref || "/parent/notifications"}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--es-radius-md)",
                      border: !notif.read
                        ? "1px solid var(--es-primary-border)"
                        : "1px solid var(--es-border-subtle)",
                      backgroundColor: !notif.read
                        ? "var(--es-primary-subtle)"
                        : "var(--es-bg-app)",
                      transition: "border-color var(--es-transition-fast)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {!notif.read && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "9999px",
                              backgroundColor: "var(--es-primary)",
                              display: "inline-block",
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "13.5px",
                            fontWeight: 600,
                            color: "var(--es-text-primary)",
                          }}
                        >
                          {notif.title}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {notif.timestamp}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12.5px",
                        color: "var(--es-text-secondary)",
                        lineHeight: 1.45,
                      }}
                    >
                      {notif.description}
                    </p>
                  </div>
                </Link>
              ))}
            </CardBody>
            <CardFooter
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </span>
              <Link
                href="/parent/notifications"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<Icon name="chevron-right" size={14} />}
                >
                  View All
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

