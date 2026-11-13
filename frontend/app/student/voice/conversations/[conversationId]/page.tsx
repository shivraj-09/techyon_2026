"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  Input,
  Modal,
  Toast,
} from "@/components/ui";
import { StudentVoiceChatWorkspace } from "@/components/counsellor";
import { CURRENT_STUDENT_VOICE_OWNER } from "@/config/counsellor-data";
import {
  createMeetingRequest,
  markStudentVoiceConversationRead,
  sendStudentVoiceMessage,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function StudentVoiceConversationDetailPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { conversations, messages } = useCounsellorStore();

  const conversation = conversations.find(
    (c) =>
      c.id === params?.conversationId &&
      c.ownerAccountKey === CURRENT_STUDENT_VOICE_OWNER.ownerAccountKey,
  );
  const threadMessages = useMemo(
    () => messages.filter((m) => m.conversationId === params?.conversationId),
    [messages, params?.conversationId],
  );

  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [availability, setAvailability] = useState(
    "Tuesday or Thursday during lunch break (12:45–1:15 PM)",
  );
  const [studentMessage, setStudentMessage] = useState("");
  const [meetingError, setMeetingError] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (conversation && conversation.unreadByStudent > 0) {
      markStudentVoiceConversationRead(conversation.id, "student");
    }
  }, [conversation?.id, conversation?.unreadByStudent]);

  function handleRequestMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!conversation) return;
    if (availability.trim().length < 5) {
      setMeetingError("Please share your preferred availability.");
      return;
    }
    const res = createMeetingRequest({
      conversationId: conversation.id,
      preferredAvailability: availability.trim(),
      studentMessage: studentMessage.trim() || undefined,
    });
    if (!res.ok) {
      setMeetingError(res.error ?? "Unable to submit meeting request.");
      return;
    }
    setMeetingModalOpen(false);
    setStudentMessage("");
    setMeetingError("");
    setToastMsg(
      "In-person meeting request sent to the School Counsellor. You can track approval on Meeting Requests.",
    );
  }

  return (
    <AppLayout defaultRole="student">
      <div className="es-stack">
        <PageHeader
          title={conversation ? conversation.subject : "Conversation Not Found"}
          subtitle="Confidential support thread with your School Counsellor."
          actions={
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link href="/student/voice/conversations">
                <Button variant="secondary" leftIcon={<Icon name="arrow-left" size={15} />}>
                  All Conversations
                </Button>
              </Link>
              {conversation && (
                <Button
                  variant="secondary"
                  onClick={() => setMeetingModalOpen(true)}
                  leftIcon={<Icon name="user-check" size={15} />}
                >
                  Request In-Person Meeting
                </Button>
              )}
            </div>
          }
        />

        {toastMsg && (
          <Toast
            variant="success"
            title="Meeting Request Submitted"
            description={toastMsg}
            onDismiss={() => setToastMsg(null)}
          />
        )}

        {!conversation ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="message-square"
                title="Conversation unavailable"
                description="This conversation does not belong to your current Student Voice profile."
                action={
                  <Link href="/student/voice/conversations">
                    <Button>Back to My Conversations</Button>
                  </Link>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <StudentVoiceChatWorkspace
            conversation={conversation}
            messages={threadMessages}
            viewerRole="student"
            bannerText={`You are messaging under pseudonym ${conversation.studentPseudonymRef}. Your name and class remain hidden unless a requested in-person meeting is approved.`}
            onSendMessage={(body) =>
              sendStudentVoiceMessage(conversation.id, "student", body)
            }
            headerActions={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  sendStudentVoiceMessage(
                    conversation.id,
                    "counsellor",
                    "Preview Demo Reply: Thank you for checking in. Take your time — I am here during school hours if you would like to keep chatting or set up a quiet 15-minute slot.",
                  );
                }}
              >
                Simulate Counsellor Reply (Demo)
              </Button>
            }
          />
        )}
      </div>

      <Modal
        isOpen={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        title="Request an In-Person Meeting"
        description="Optional step if you would like to speak with the School Counsellor face-to-face."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setMeetingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="sv-meeting-req-form">
              Submit Request
            </Button>
          </>
        }
      >
        <form
          id="sv-meeting-req-form"
          onSubmit={handleRequestMeeting}
          className="es-stack"
          style={{ gap: "0.875rem" }}
        >
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-primary-subtle)",
              fontSize: "0.8125rem",
              color: "var(--es-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Your request stays pseudonymous while Pending. Only if the
            Counsellor approves an in-person meeting can your student identity
            be resolved to coordinate room scheduling.
          </div>
          <Input
            id="sv-mr-avail"
            label="Preferred Availability *"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            required
          />
          <label className="es-field" htmlFor="sv-mr-msg">
            <span className="es-label">Note for Counsellor (Optional)</span>
            <textarea
              id="sv-mr-msg"
              className="es-input"
              rows={3}
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
              placeholder="e.g. Prefer a quiet afternoon slot after Period 6..."
              style={{
                height: "auto",
                padding: "0.625rem 0.75rem",
                resize: "vertical",
              }}
            />
          </label>
          {meetingError && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--es-danger-text)" }}>
              {meetingError}
            </p>
          )}
          <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
            You can view and cancel pending requests anytime on{" "}
            <button
              type="button"
              onClick={() => router.push("/student/voice/meeting-requests")}
              style={{
                border: "none",
                background: "none",
                padding: 0,
                color: "var(--es-primary)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Meeting Requests
            </button>
            .
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
