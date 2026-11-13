"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  Input,
  Select,
} from "@/components/ui";
import { ConversationStatusBadge } from "@/components/counsellor";
import {
  STUDENT_VOICE_CATEGORIES,
  type ConversationStatus,
  type StudentVoiceCategory,
} from "@/config/counsellor-data";
import { useCounsellorStore } from "@/config/counsellor-store";

export default function CounsellorStudentVoiceInboxPage() {
  const router = useRouter();
  const { conversations } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ConversationStatus
  >("ALL");
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | StudentVoiceCategory
  >("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && c.category !== categoryFilter)
        return false;
      if (unreadOnly && c.unreadByCounsellor === 0) return false;
      if (!q) return true;
      return (
        c.studentPseudonymRef.toLowerCase().includes(q) ||
        c.conversationRef.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, statusFilter, categoryFilter, unreadOnly]);

  const counts = useMemo(
    () => ({
      total: conversations.length,
      unread: conversations.reduce((s, c) => s + c.unreadByCounsellor, 0),
      open: conversations.filter((c) => c.status !== "Resolved").length,
      resolved: conversations.filter((c) => c.status === "Resolved").length,
    }),
    [conversations],
  );

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title="Student Voice Inbox"
          subtitle="Respond compassionately to pseudonymous student conversations. Student identities stay protected here."
          actions={
            <Link href="/counsellor/meeting-requests">
              <Button variant="secondary" leftIcon={<Icon name="user-check" size={15} />}>
                Meeting Requests
              </Button>
            </Link>
          }
        />

        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--es-radius-md)",
            backgroundColor: "var(--es-primary-subtle)",
            border: "1px solid var(--es-border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            fontSize: "0.8125rem",
            color: "var(--es-text-secondary)",
          }}
        >
          <Icon name="shield" size={16} />
          <span>
            <strong>Pseudonymity Active:</strong> Conversations display
            protected student reference tags (e.g. SV-2041) only. Controlled
            identity lookup is restricted exclusively to{" "}
            <Link
              href="/counsellor/meeting-requests"
              style={{ color: "var(--es-primary)", fontWeight: 600 }}
            >
              Approved Meeting Requests
            </Link>
            .
          </span>
        </div>

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Active Threads</div>
            <div className="es-stat-value">{counts.open}</div>
            <div className="es-stat-meta">Open or awaiting reply</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Unread Messages</div>
            <div className="es-stat-value">{counts.unread}</div>
            <div className="es-stat-meta">New student replies</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Total Conversations</div>
            <div className="es-stat-value">{counts.total}</div>
            <div className="es-stat-meta">Pseudonymous support history</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Resolved</div>
            <div className="es-stat-value">{counts.resolved}</div>
            <div className="es-stat-meta">Completed threads</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 195px), 1fr))",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <Input
                id="cns-sv-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search SV-ref, subject, topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="cns-sv-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | ConversationStatus)
                }
                options={[
                  { value: "ALL", label: "All Statuses" },
                  { value: "Open", label: "Open" },
                  { value: "Awaiting Reply", label: "Awaiting Reply" },
                  { value: "Resolved", label: "Resolved" },
                ]}
              />
              <Select
                id="cns-sv-category"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value as "ALL" | StudentVoiceCategory,
                  )
                }
                options={[
                  { value: "ALL", label: "All Topics" },
                  ...STUDENT_VOICE_CATEGORIES.map((c) => ({
                    value: c,
                    label: c,
                  })),
                ]}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--es-text-primary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                />
                Unread messages only
              </label>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="message-square"
                title="No matching Student Voice threads"
                description="Try clearing filters to view all pseudonymous conversations."
              />
            ) : (
              <div className="es-stack" style={{ gap: "0.75rem" }}>
                {filtered.map((conv) => (
                  <div
                    key={conv.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      router.push(`/counsellor/student-voice/${conv.id}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/counsellor/student-voice/${conv.id}`);
                      }
                    }}
                    style={{
                      padding: "1rem 1.125rem",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      backgroundColor: "var(--es-surface-subtle)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: "220px", flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <Badge variant="primary">{conv.studentPseudonymRef}</Badge>
                        <Badge variant="neutral">{conv.conversationRef}</Badge>
                        <Badge variant="neutral">{conv.category}</Badge>
                        <ConversationStatusBadge status={conv.status} />
                        {conv.unreadByCounsellor > 0 && (
                          <Badge variant="warning">
                            {conv.unreadByCounsellor} unread
                          </Badge>
                        )}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "var(--es-text-primary)",
                        }}
                      >
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
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {conv.lastMessageAt}
                      </span>
                      <Button size="sm" variant="secondary">
                        Open Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
