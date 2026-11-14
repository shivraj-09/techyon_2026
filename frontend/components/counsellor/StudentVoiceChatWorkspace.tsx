"use client";

import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, CardBody, EmptyState, Icon } from "@/components/ui";
import type {
  StudentVoiceConversation,
  StudentVoiceMessage,
} from "@/config/counsellor-data";
import { ConversationStatusBadge } from "./CounsellorBadges";

export interface StudentVoiceChatWorkspaceProps {
  conversation: StudentVoiceConversation;
  messages: StudentVoiceMessage[];
  viewerRole: "student" | "counsellor";
  onSendMessage: (body: string) => void;
  headerActions?: React.ReactNode;
  bannerText?: string;
}

export function StudentVoiceChatWorkspace({
  conversation,
  messages,
  viewerRole,
  onSendMessage,
  headerActions,
  bannerText,
}: StudentVoiceChatWorkspaceProps) {
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submitMessage() {
    const clean = draft.trim();
    if (!clean) {
      setSendError("Please write a message before sending.");
      return;
    }
    onSendMessage(clean);
    setDraft("");
    setSendError("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  return (
    <Card style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--es-border-subtle)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
          backgroundColor: "var(--es-surface)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "0.375rem",
            }}
          >
            <Badge variant="primary">{conversation.studentPseudonymRef}</Badge>
            <Badge variant="neutral">{conversation.conversationRef}</Badge>
            <Badge variant="neutral">{conversation.category}</Badge>
            <ConversationStatusBadge status={conversation.status} />
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "var(--es-text-primary)",
            }}
          >
            {conversation.subject}
          </h2>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.75rem",
              color: "var(--es-text-muted)",
            }}
          >
            Started {conversation.createdAt} · Last activity {conversation.lastMessageAt}
          </p>
        </div>

        {headerActions && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {headerActions}
          </div>
        )}
      </div>

      {bannerText && (
        <div
          style={{
            padding: "0.625rem 1.25rem",
            backgroundColor: "var(--es-primary-subtle)",
            borderBottom: "1px solid var(--es-border-subtle)",
            fontSize: "0.8125rem",
            color: "var(--es-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Icon name="shield" size={15} />
          <span>{bannerText}</span>
        </div>
      )}

      <CardBody style={{ padding: 0 }}>
        <div
          style={{
            maxHeight: "440px",
            minHeight: "280px",
            overflowY: "auto",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
            backgroundColor: "var(--es-bg)",
          }}
        >
          {messages.length === 0 ? (
            <EmptyState
              icon="message-square"
              title="No messages yet"
              description="Send the first supportive message below to start the conversation."
            />
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderRole === viewerRole;
              const isCounsellor = msg.senderRole === "counsellor";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isOwn ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "min(85%, 560px)",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--es-radius-lg)",
                      backgroundColor: isOwn
                        ? "var(--es-primary)"
                        : "var(--es-surface)",
                      color: isOwn
                        ? "var(--es-primary-foreground)"
                        : "var(--es-text-primary)",
                      border: isOwn
                        ? "none"
                        : "1px solid var(--es-border-subtle)",
                      boxShadow: "var(--es-shadow-xs)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        marginBottom: "0.375rem",
                        fontSize: "0.75rem",
                        opacity: isOwn ? 0.9 : 1,
                        color: isOwn
                          ? "var(--es-primary-foreground)"
                          : "var(--es-text-muted)",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {isCounsellor
                          ? viewerRole === "counsellor"
                            ? "You (Counsellor)"
                            : "School Counsellor"
                          : viewerRole === "student"
                            ? `You (${conversation.studentPseudonymRef})`
                            : conversation.studentPseudonymRef}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage();
          }}
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid var(--es-border-subtle)",
            backgroundColor: "var(--es-surface)",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          }}
        >
          <label htmlFor="sv-chat-composer" className="es-label">
            {viewerRole === "counsellor"
              ? `Reply to ${conversation.studentPseudonymRef}`
              : "Send a confidential message to the School Counsellor"}
          </label>
          <textarea
            id="sv-chat-composer"
            className="es-input"
            rows={3}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (sendError) setSendError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write your message... (Press Enter to send, Shift+Enter for a new line)"
            style={{ height: "auto", padding: "0.625rem 0.75rem", resize: "vertical" }}
          />
          {sendError && (
            <p
              style={{
                margin: 0,
                fontSize: "0.8125rem",
                color: "var(--es-danger-text)",
              }}
            >
              {sendError}
            </p>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
              {viewerRole === "student"
                ? `Your identity remains hidden behind ${conversation.studentPseudonymRef} unless an approved in-person meeting requires support reveal.`
                : "Messages appear in real time for the pseudonymous student thread during this session."}
            </span>
            <Button type="submit" leftIcon={<Icon name="send" size={14} />}>
              Send Message
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

