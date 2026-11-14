"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Input,
} from "@/components/ui";
import {
  ASK_EDUSYNC_SUGGESTIONS,
  resolveMockAnalyticsResponse,
  type DateRangeKey,
} from "@/config/ai-insights-data";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  scopeNote?: string;
  isLimitation?: boolean;
}

export interface AskEduSyncSectionProps {
  activeRange: DateRangeKey;
}

function formatTimeNow(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderInlineEmphasis(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function AskEduSyncSection({ activeRange }: AskEduSyncSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const historyRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, isResponding]);

  function submitQuestion(rawQuestion: string) {
    const trimmed = rawQuestion.trim();
    if (!trimmed || isResponding) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: formatTimeNow(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsResponding(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const resolved = resolveMockAnalyticsResponse(trimmed, activeRange);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now() + 1}`,
        role: "assistant",
        content: resolved.answer,
        timestamp: formatTimeNow(),
        scopeNote: resolved.scopeNote,
        isLimitation: !resolved.matched,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsResponding(false);
    }, 450);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitQuestion(inputValue);
  }

  function handleResetConversation() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsResponding(false);
    setMessages([]);
    setInputValue("");
  }

  return (
    <section aria-labelledby="ask-circle-heading">
      <Card>
        <CardHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--es-radius-sm)",
                backgroundColor: "var(--es-primary-subtle)",
                color: "var(--es-primary)",
                border: "1px solid var(--es-primary-border)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="sparkles" size={16} />
            </span>
            <div>
              <CardTitle id="ask-circle-heading">Ask CIRCLE</CardTitle>
              <CardDescription>
                Ask questions about your school&apos;s attendance, fees and
                overall performance.
              </CardDescription>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge variant="primary">Rule-based summaries</Badge>
            {messages.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name="refresh-cw" size={13} />}
                onClick={handleResetConversation}
              >
                New Conversation
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="es-stack" style={{ gap: "14px" }}>
          {/* Suggested Question Chips */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--es-text-muted)",
                marginBottom: "8px",
              }}
            >
              Suggested questions
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {ASK_EDUSYNC_SUGGESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isResponding}
                  onClick={() => submitQuestion(question)}
                  style={{
                    fontSize: "12.5px",
                    padding: "6px 11px",
                    borderRadius: "999px",
                    border: "1px solid var(--es-border)",
                    backgroundColor: "var(--es-bg-subtle)",
                    color: "var(--es-text-primary)",
                    cursor: isResponding ? "not-allowed" : "pointer",
                    opacity: isResponding ? 0.6 : 1,
                    transition:
                      "background-color 140ms ease, border-color 140ms ease",
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Conversation History */}
          <div
            ref={historyRef}
            aria-live="polite"
            style={{
              minHeight: "220px",
              maxHeight: "340px",
              overflowY: "auto",
              padding: "16px",
              borderRadius: "var(--es-radius-md)",
              border: "1px solid var(--es-border)",
              backgroundColor: "var(--es-bg-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  margin: "auto",
                  textAlign: "center",
                  maxWidth: "440px",
                  padding: "18px 8px",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "var(--es-bg-surface)",
                    border: "1px solid var(--es-border)",
                    color: "var(--es-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px",
                  }}
                >
                  <Icon name="sparkles" size={18} />
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                  }}
                >
                  Ask a question about school metrics
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--es-text-muted)",
                    marginTop: "4px",
                    lineHeight: 1.5,
                  }}
                >
                  Select one of the suggested prompts above or type your own
                  question below. Responses are generated locally from available
                  school aggregate data.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "82%",
                        padding: "10px 13px",
                        borderRadius: "var(--es-radius-md)",
                        backgroundColor: isUser
                          ? "var(--es-primary)"
                          : "var(--es-bg-surface)",
                        color: isUser
                          ? "var(--es-primary-foreground)"
                          : "var(--es-text-primary)",
                        border: isUser
                          ? "1px solid var(--es-primary)"
                          : msg.isLimitation
                            ? "1px solid var(--es-warning-border)"
                            : "1px solid var(--es-border)",
                        fontSize: "13px",
                        lineHeight: 1.55,
                        boxShadow: "var(--es-shadow-xs)",
                      }}
                    >
                      {!isUser && msg.scopeNote && (
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: msg.isLimitation
                              ? "var(--es-warning)"
                              : "var(--es-primary)",
                            marginBottom: "4px",
                          }}
                        >
                          Summary based on available school data ·{" "}
                          {msg.scopeNote}
                        </div>
                      )}
                      <div>{renderInlineEmphasis(msg.content)}</div>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--es-text-subtle)",
                      }}
                    >
                      {isUser ? "You" : "CIRCLE Summary"} · {msg.timestamp}
                    </span>
                  </div>
                );
              })
            )}

            {isResponding && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 13px",
                  borderRadius: "var(--es-radius-md)",
                  backgroundColor: "var(--es-bg-surface)",
                  border: "1px solid var(--es-border)",
                  alignSelf: "flex-start",
                  fontSize: "12.5px",
                  color: "var(--es-text-muted)",
                }}
              >
                <Icon name="clock" size={14} />
                <span>Compiling summary from school records...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "240px" }}>
              <Input
                aria-label="Ask CIRCLE a question about school metrics"
                placeholder="Ask about attendance trends, lowest classes, or outstanding fees..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isResponding}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputValue.trim() || isResponding}
              leftIcon={<Icon name="sparkles" size={15} />}
            >
              {isResponding ? "Summarising..." : "Send"}
            </Button>
          </form>

          <p
            style={{
              fontSize: "11.5px",
              color: "var(--es-text-subtle)",
              margin: 0,
            }}
          >
            Insights are summarized from your institution&apos;s current academic,
            attendance, and fee records.
          </p>
        </CardBody>
      </Card>
    </section>
  );
}

