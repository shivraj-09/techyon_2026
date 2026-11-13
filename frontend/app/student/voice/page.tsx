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
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Input,
  Modal,
  Select,
  Toast,
} from "@/components/ui";
import { ConversationStatusBadge } from "@/components/counsellor";
import {
  CURRENT_STUDENT_VOICE_OWNER,
  STUDENT_VOICE_CATEGORIES,
  type StudentVoiceCategory,
} from "@/config/counsellor-data";
import {
  createStudentVoiceConversation,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function StudentVoiceHomePage() {
  const router = useRouter();
  const { conversations, notices, meetingRequests, readNoticeIds } =
    useCounsellorStore();

  const myConversations = useMemo(
    () =>
      conversations.filter(
        (c) => c.ownerAccountKey === CURRENT_STUDENT_VOICE_OWNER.ownerAccountKey,
      ),
    [conversations],
  );

  const myMeetingRequests = useMemo(
    () =>
      meetingRequests.filter(
        (m) => m.ownerAccountKey === CURRENT_STUDENT_VOICE_OWNER.ownerAccountKey,
      ),
    [meetingRequests],
  );

  const studentNotices = useMemo(
    () =>
      notices.filter(
        (n) =>
          n.status === "Published" &&
          (n.audience === "Students" || n.audience === "All permitted users"),
      ),
    [notices],
  );

  const unreadNoticesCount = useMemo(
    () => studentNotices.filter((n) => !readNoticeIds.includes(n.id)).length,
    [studentNotices, readNoticeIds],
  );

  const [startModalOpen, setStartModalOpen] = useState(false);
  const [category, setCategory] =
    useState<StudentVoiceCategory>("Academic Stress");
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function handleStartConversation(e: React.FormEvent) {
    e.preventDefault();
    if (initialMessage.trim().length < 10) {
      setError(
        "Please write a few words about what you would like support with (min 10 characters).",
      );
      return;
    }
    const created = createStudentVoiceConversation({
      category,
      subject: subject.trim() || undefined,
      initialMessage: initialMessage.trim(),
    });
    setSubject("");
    setInitialMessage("");
    setError("");
    setStartModalOpen(false);
    setToastMsg(
      `Conversation ${created.conversationRef} started under pseudonym ${created.studentPseudonymRef}.`,
    );
    setTimeout(() => {
      router.push(`/student/voice/conversations/${created.id}`);
    }, 350);
  }

  return (
    <AppLayout defaultRole="student">
      <div className="es-stack">
        <PageHeader
          title="Your Voice Matters"
          subtitle="A calm, pseudonymous space to reach out to your School Counsellor at your own pace."
          actions={
            <Button
              onClick={() => setStartModalOpen(true)}
              leftIcon={<Icon name="message-square" size={16} />}
            >
              Start a Conversation
            </Button>
          }
        />

        {toastMsg && (
          <Toast
            variant="success"
            title="Conversation Created"
            description={toastMsg}
            onDismiss={() => setToastMsg(null)}
          />
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "1rem",
          }}
        >
          <Card>
            <CardBody className="es-stack" style={{ gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Badge variant="primary">How Privacy Works</Badge>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  color: "var(--es-text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                Your messages appear to the School Counsellor under a protected
                pseudonym (such as{" "}
                <strong>{CURRENT_STUDENT_VOICE_OWNER.defaultPseudonymRef}</strong>
                ) without your name or class. Identity is only shared through
                safeguarded authorisation if an in-person meeting request is
                approved.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="es-stack" style={{ gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Badge variant="warning">Support & Non-Emergency Note</Badge>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  color: "var(--es-text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                Counsellors review Student Voice messages during school hours.
                If you or someone else needs urgent or immediate help right now,
                please reach out to a trusted teacher, parent, or school office
                staff member immediately.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">My Conversations</div>
            <div className="es-stat-value">{myConversations.length}</div>
            <div className="es-stat-meta">Protected under pseudonym</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Meeting Requests</div>
            <div className="es-stat-value">{myMeetingRequests.length}</div>
            <div className="es-stat-meta">Optional in-person check-ins</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Wellbeing Notices</div>
            <div className="es-stat-value">{unreadNoticesCount}</div>
            <div className="es-stat-meta">
              Unread of {studentNotices.length} school notices
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
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
                <CardTitle>Your Recent Conversations</CardTitle>
                <Link href="/student/voice/conversations">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
              {myConversations.length === 0 ? (
                <EmptyState
                  icon="message-square"
                  title="No conversations yet"
                  description="Whenever you want to talk, start a pseudonymous message thread."
                  action={
                    <Button onClick={() => setStartModalOpen(true)}>
                      Start a Conversation
                    </Button>
                  }
                />
              ) : (
                myConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/student/voice/conversations/${conv.id}`}
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
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <Badge variant="primary">
                          {conv.studentPseudonymRef}
                        </Badge>
                        {conv.unreadByStudent > 0 && (
                          <Badge variant="warning">
                            {conv.unreadByStudent} new reply
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
                <CardTitle>Recent Wellbeing Notices</CardTitle>
                <Link href="/student/voice/notices">
                  <Button variant="ghost" size="sm">
                    Browse All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
              {studentNotices.slice(0, 3).map((notice) => (
                <Link
                  key={notice.id}
                  href="/student/voice/notices"
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
                      marginBottom: "0.3rem",
                    }}
                  >
                    <Badge variant="neutral">{notice.category}</Badge>
                    {!readNoticeIds.includes(notice.id) && (
                      <Badge variant="primary">Unread</Badge>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {notice.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--es-text-secondary)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {notice.summary}
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={startModalOpen}
        onClose={() => setStartModalOpen(false)}
        title="Start a Pseudonymous Conversation"
        description="Do not include your real name or student ID if you prefer to stay pseudonymous."
        footer={
          <>
            <Button variant="secondary" onClick={() => setStartModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="student-start-sv-form"
              leftIcon={<Icon name="send" size={14} />}
            >
              Send First Message
            </Button>
          </>
        }
      >
        <form
          id="student-start-sv-form"
          onSubmit={handleStartConversation}
          className="es-stack"
          style={{ gap: "0.875rem" }}
        >
          <Select
            id="sv-start-category"
            label="What would you like support with?"
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
            id="sv-start-subject"
            label="Short Topic (Optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Feeling overwhelmed before unit tests"
          />
          <label className="es-field" htmlFor="sv-start-message">
            <span className="es-label">Your Message *</span>
            <textarea
              id="sv-start-message"
              className="es-input"
              rows={4}
              value={initialMessage}
              onChange={(e) => {
                setInitialMessage(e.target.value);
                if (error) setError("");
              }}
              placeholder="Share whatever feels comfortable. Only your pseudonym reference is shown in chat..."
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
