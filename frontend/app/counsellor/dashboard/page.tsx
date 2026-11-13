"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
} from "@/components/ui";
import {
  ConversationStatusBadge,
  ReferralPriorityBadge,
  ReferralStatusBadge,
  SessionStatusBadge,
} from "@/components/counsellor";
import { useCounsellorStore } from "@/config/counsellor-store";

export default function CounsellorDashboardPage() {
  const {
    referrals,
    cases,
    sessions,
    notices,
    conversations,
    meetingRequests,
  } = useCounsellorStore();

  const stats = useMemo(() => {
    const pendingReferrals = referrals.filter(
      (r) => r.status === "Submitted" || r.status === "Under Review",
    ).length;
    const activeCases = cases.filter(
      (c) => c.status === "Open" || c.status === "In Progress" || c.status === "On Hold",
    ).length;
    const upcomingSessions = sessions.filter(
      (s) => s.status === "Scheduled",
    ).length;
    const unreadVoice = conversations.reduce(
      (sum, c) => sum + c.unreadByCounsellor,
      0,
    );
    const pendingMeetings = meetingRequests.filter(
      (m) => m.status === "Pending",
    ).length;
    const publishedNotices = notices.filter(
      (n) => n.status === "Published",
    ).length;

    return {
      pendingReferrals,
      activeCases,
      upcomingSessions,
      unreadVoice,
      pendingMeetings,
      publishedNotices,
    };
  }, [referrals, cases, sessions, notices, conversations, meetingRequests]);

  const recentReferrals = referrals.slice(0, 4);
  const upcomingSessionsList = sessions
    .filter((s) => s.status === "Scheduled")
    .slice(0, 4);
  const recentConversations = conversations.slice(0, 4);

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title="Wellbeing & Counselling Dashboard"
          subtitle="Monitor incoming student referrals, active support cases, scheduled sessions, and confidential Student Voice threads."
          actions={
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link href="/counsellor/referrals">
                <Button variant="secondary" leftIcon={<Icon name="inbox" size={15} />}>
                  Review Referrals
                </Button>
              </Link>
              <Link href="/counsellor/student-voice">
                <Button leftIcon={<Icon name="message-square" size={15} />}>
                  Student Voice Inbox
                </Button>
              </Link>
            </div>
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
            gap: "1rem",
          }}
        >
          <div className="es-stat-card">
            <div className="es-stat-label">Pending Referrals</div>
            <div className="es-stat-value">{stats.pendingReferrals}</div>
            <div className="es-stat-meta">Submitted or Under Review</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Active Cases</div>
            <div className="es-stat-value">{stats.activeCases}</div>
            <div className="es-stat-meta">Open, In Progress, or On Hold</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Upcoming Sessions</div>
            <div className="es-stat-value">{stats.upcomingSessions}</div>
            <div className="es-stat-meta">Scheduled support meetings</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Unread Student Voice</div>
            <div className="es-stat-value">{stats.unreadVoice}</div>
            <div className="es-stat-meta">Pseudonymous messages awaiting review</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Pending Meeting Requests</div>
            <div className="es-stat-value">{stats.pendingMeetings}</div>
            <div className="es-stat-meta">In-person support requests</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Published Notices</div>
            <div className="es-stat-value">{stats.publishedNotices}</div>
            <div className="es-stat-meta">Live school wellbeing updates</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          <Card>
            <CardHeader>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: "0.5rem",
                }}
              >
                <CardTitle>Recent Teacher Referrals</CardTitle>
                <Link href="/counsellor/referrals">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
              {recentReferrals.length === 0 ? (
                <EmptyState
                  icon="inbox"
                  title="No referrals yet"
                  description="Teacher-submitted wellbeing referrals will appear here."
                />
              ) : (
                recentReferrals.map((ref) => (
                  <Link
                    key={ref.id}
                    href={`/counsellor/referrals/${ref.id}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                      padding: "0.875rem",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      backgroundColor: "var(--es-surface-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {ref.studentName} · {ref.className}
                      </span>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <ReferralPriorityBadge priority={ref.priority} />
                        <ReferralStatusBadge status={ref.status} />
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--es-text-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {ref.description}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      {ref.referralRef} · Submitted by {ref.submittedByTeacherName} on{" "}
                      {ref.submittedDate}
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: "0.5rem",
                }}
              >
                <CardTitle>Upcoming Sessions</CardTitle>
                <Link href="/counsellor/sessions">
                  <Button variant="ghost" size="sm">
                    Schedule
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
              {upcomingSessionsList.length === 0 ? (
                <EmptyState
                  icon="calendar"
                  title="No upcoming sessions"
                  description="Scheduled counselling sessions appear here."
                />
              ) : (
                upcomingSessionsList.map((ses) => (
                  <Link
                    key={ses.id}
                    href="/counsellor/sessions"
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                      padding: "0.875rem",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      backgroundColor: "var(--es-surface-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {ses.studentName} ({ses.className})
                      </span>
                      <SessionStatusBadge status={ses.status} />
                    </div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--es-text-secondary)",
                      }}
                    >
                      {ses.date} · {ses.startTime}–{ses.endTime} · {ses.sessionType}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--es-text-muted)",
                        marginTop: "0.2rem",
                      }}
                    >
                      {ses.mode}: {ses.locationOrLink}
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          <Card>
            <CardHeader>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: "0.5rem",
                }}
              >
                <CardTitle>Recent Student Voice Activity</CardTitle>
                <Badge variant="primary">Pseudonymous</Badge>
              </div>
            </CardHeader>
            <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
              {recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/counsellor/student-voice/${conv.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    padding: "0.875rem",
                    borderRadius: "var(--es-radius-md)",
                    border: "1px solid var(--es-border-subtle)",
                    backgroundColor: "var(--es-surface-subtle)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Badge variant="primary">{conv.studentPseudonymRef}</Badge>
                      {conv.unreadByCounsellor > 0 && (
                        <Badge variant="warning">
                          {conv.unreadByCounsellor} unread
                        </Badge>
                      )}
                    </div>
                    <ConversationStatusBadge status={conv.status} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {conv.subject}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--es-text-secondary)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {conv.lastMessagePreview}
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Counsellor Actions</CardTitle>
            </CardHeader>
            <CardBody className="es-stack" style={{ gap: "0.625rem" }}>
              <Link href="/counsellor/referrals">
                <Button
                  variant="secondary"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                  leftIcon={<Icon name="clipboard-check" size={16} />}
                >
                  Review Pending Teacher Referrals ({stats.pendingReferrals})
                </Button>
              </Link>
              <Link href="/counsellor/cases">
                <Button
                  variant="secondary"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                  leftIcon={<Icon name="shield" size={16} />}
                >
                  Manage Confidential Counselling Cases ({stats.activeCases})
                </Button>
              </Link>
              <Link href="/counsellor/sessions">
                <Button
                  variant="secondary"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                  leftIcon={<Icon name="calendar" size={16} />}
                >
                  Schedule & Review Sessions ({stats.upcomingSessions} upcoming)
                </Button>
              </Link>
              <Link href="/counsellor/meeting-requests">
                <Button
                  variant="secondary"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                  leftIcon={<Icon name="user-check" size={16} />}
                >
                  Review Meeting Requests ({stats.pendingMeetings} pending)
                </Button>
              </Link>
              <Link href="/counsellor/notices">
                <Button
                  variant="secondary"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                  leftIcon={<Icon name="megaphone" size={16} />}
                >
                  Publish Wellbeing Notices ({stats.publishedNotices} active)
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
