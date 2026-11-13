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
  Modal,
  Select,
} from "@/components/ui";
import { ConversationStatusBadge } from "@/components/counsellor";
import {
  CURRENT_STUDENT_VOICE_OWNER,
  STUDENT_VOICE_CATEGORIES,
  type ConversationStatus,
  type StudentVoiceCategory,
} from "@/config/counsellor-data";
import {
  createStudentVoiceConversation,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function StudentVoiceConversationsPage() {
  const router = useRouter();
  const { conversations } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ConversationStatus
  >("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] =
    useState<StudentVoiceCategory>("General Support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const myConversations = useMemo(
    () =>
      conversations.filter(
        (c) => c.ownerAccountKey === CURRENT_STUDENT_VOICE_OWNER.ownerAccountKey,
      ),
    [conversations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myConversations.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.subject.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.conversationRef.toLowerCase().includes(q)
      );
    });
  }, [myConversations, search, statusFilter]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError("Please share at least 10 characters in your message.");
      return;
    }
    const created = createStudentVoiceConversation({
      category,
      subject: subject.trim() || undefined,
      initialMessage: message.trim(),
    });
    setModalOpen(false);
    setSubject("");
    setMessage("");
    setError("");
    router.push(`/student/voice/conversations/${created.id}`);
  }

  return (
    <AppLayout defaultRole="student">
      <div className="es-stack">
        <PageHeader
          title="My Conversations"
          subtitle="All threads remain pseudonymous between you and the School Counsellor."
          actions={
            <Button
              onClick={() => setModalOpen(true)}
              leftIcon={<Icon name="plus" size={16} />}
            >
              Start Conversation
            </Button>
          }
        />

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="sv-my-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search topic or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="sv-my-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | ConversationStatus)
                }
                options={[
                  { value: "ALL", label: "All Conversations" },
                  { value: "Open", label: "Open" },
                  { value: "Awaiting Reply", label: "Awaiting Reply" },
                  { value: "Resolved", label: "Resolved" },
                ]}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="message-square"
                title="No conversations found"
                description="Start a confidential pseudonymous conversation whenever you want support."
                action={
                  <Button onClick={() => setModalOpen(true)}>
                    Start Conversation
                  </Button>
                }
              />
            ) : (
              <div className="es-stack" style={{ gap: "0.75rem" }}>
                {filtered.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/student/voice/conversations/${conv.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                      textDecoration: "none",
                      color: "inherit",
                      padding: "1rem",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      backgroundColor: "var(--es-surface-subtle)",
                    }}
                  >
                    <div style={{ minWidth: "220px", flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.45rem",
                          flexWrap: "wrap",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <Badge variant="primary">
                          {conv.studentPseudonymRef}
                        </Badge>
                        <Badge variant="neutral">{conv.category}</Badge>
                        <ConversationStatusBadge status={conv.status} />
                        {conv.unreadByStudent > 0 && (
                          <Badge variant="warning">
                            {conv.unreadByStudent} new reply
                          </Badge>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        {conv.lastMessageAt}
                      </span>
                      <Button size="sm" variant="secondary">
                        Open Chat
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Start a Conversation"
        description="Your message stays pseudonymous unless you later request an approved in-person meeting."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="student-conv-new-form">
              Start Chat
            </Button>
          </>
        }
      >
        <form
          id="student-conv-new-form"
          onSubmit={handleCreate}
          className="es-stack"
          style={{ gap: "0.875rem" }}
        >
          <Select
            id="sv-conv-category"
            label="Support Topic"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as StudentVoiceCategory)
            }
            options={STUDENT_VOICE_CATEGORIES.map((c) => ({
              value: c,
              label: c,
            }))}
          />
          <Input
            id="sv-conv-subject"
            label="Topic Title (Optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary without your name"
          />
          <label className="es-field" htmlFor="sv-conv-msg">
            <span className="es-label">Message *</span>
            <textarea
              id="sv-conv-msg"
              className="es-input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              style={{
                height: "auto",
                padding: "0.625rem 0.75rem",
                resize: "vertical",
              }}
            />
          </label>
          {error && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--es-danger-text)" }}>
              {error}
            </p>
          )}
        </form>
      </Modal>
    </AppLayout>
  );
}
