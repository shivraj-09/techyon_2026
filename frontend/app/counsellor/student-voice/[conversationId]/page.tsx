"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  Select,
} from "@/components/ui";
import { StudentVoiceChatWorkspace } from "@/components/counsellor";
import type { ConversationStatus } from "@/config/counsellor-data";
import {
  markStudentVoiceConversationRead,
  sendStudentVoiceMessage,
  updateStudentVoiceConversationStatus,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function CounsellorStudentVoiceThreadPage() {
  const params = useParams<{ conversationId: string }>();
  const { conversations, messages } = useCounsellorStore();

  const conversation = conversations.find(
    (c) => c.id === params?.conversationId,
  );
  const threadMessages = useMemo(
    () => messages.filter((m) => m.conversationId === params?.conversationId),
    [messages, params?.conversationId],
  );

  useEffect(() => {
    if (conversation && conversation.unreadByCounsellor > 0) {
      markStudentVoiceConversationRead(conversation.id, "counsellor");
    }
  }, [conversation?.id, conversation?.unreadByCounsellor]);

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title={
            conversation
              ? `Conversation ${conversation.studentPseudonymRef}`
              : "Conversation Not Found"
          }
          subtitle="Support the student within this protected pseudonymous channel."
          actions={
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link href="/counsellor/student-voice">
                <Button variant="secondary" leftIcon={<Icon name="arrow-left" size={15} />}>
                  Back to Inbox
                </Button>
              </Link>
              <Link href="/counsellor/meeting-requests">
                <Button variant="secondary" leftIcon={<Icon name="user-check" size={15} />}>
                  Meeting Requests
                </Button>
              </Link>
            </div>
          }
        />

        {!conversation ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="message-square"
                title="Conversation unavailable"
                description="This Student Voice thread could not be found."
                action={
                  <Link href="/counsellor/student-voice">
                    <Button>Return to Student Voice Inbox</Button>
                  </Link>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <StudentVoiceChatWorkspace
            conversation={conversation}
            messages={threadMessages}
            viewerRole="counsellor"
            bannerText={`Pseudonymous view: real student name, class, and admission ID are hidden behind ${conversation.studentPseudonymRef}.`}
            onSendMessage={(body) =>
              sendStudentVoiceMessage(conversation.id, "counsellor", body)
            }
            headerActions={
              <div style={{ minWidth: "160px" }}>
                <Select
                  id="counsellor-sv-status"
                  value={conversation.status}
                  onChange={(e) =>
                    updateStudentVoiceConversationStatus(
                      conversation.id,
                      e.target.value as ConversationStatus,
                    )
                  }
                  options={[
                    { value: "Open", label: "Status: Open" },
                    { value: "Awaiting Reply", label: "Status: Awaiting Reply" },
                    { value: "Resolved", label: "Status: Resolved" },
                  ]}
                />
              </div>
            }
          />
        )}
      </div>
    </AppLayout>
  );
}
