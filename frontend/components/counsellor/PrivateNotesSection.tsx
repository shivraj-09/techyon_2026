"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Select,
} from "@/components/ui";
import {
  PRIVATE_NOTE_TYPES,
  type PrivateCaseNoteRecord,
  type PrivateNoteType,
} from "@/config/counsellor-data";

export interface PrivateNotesSectionProps {
  notes: PrivateCaseNoteRecord[];
  onAddNote: (content: string, noteType: PrivateNoteType) => void;
}

export function PrivateNotesSection({
  notes,
  onAddNote,
}: PrivateNotesSectionProps) {
  const [noteType, setNoteType] = useState<PrivateNoteType>(
    "Session Observation",
  );
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = content.trim();
    if (clean.length < 10) {
      setError("Please enter at least 10 characters for a clinical case note.");
      return;
    }
    onAddNote(clean, noteType);
    setContent("");
    setError("");
  }

  return (
    <Card>
      <CardHeader>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--es-radius-md)",
                backgroundColor: "var(--es-warning-bg)",
                color: "var(--es-warning-text)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="lock" size={16} />
            </span>
            <CardTitle>Private Counsellor Case Notes</CardTitle>
          </div>
          <Badge variant="warning">CONFIDENTIAL — COUNSELLOR ACCESS ONLY</Badge>
        </div>
      </CardHeader>
      <CardBody className="es-stack">
        <div
          style={{
            padding: "0.75rem 0.875rem",
            borderRadius: "var(--es-radius-md)",
            backgroundColor: "var(--es-surface-subtle)",
            border: "1px solid var(--es-border-subtle)",
            fontSize: "0.8125rem",
            color: "var(--es-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          These notes are never visible to teachers, parents, admins, or the
          student. Stored strictly in-memory for the active session and excluded
          from browser storage.
        </div>

        <form onSubmit={handleSubmit} className="es-stack" style={{ gap: "0.75rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: "0.75rem",
              alignItems: "end",
            }}
          >
            <Select
              id="private-note-type"
              label="Note Category"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as PrivateNoteType)}
              options={PRIVATE_NOTE_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <label className="es-field" htmlFor="private-note-content">
            <span className="es-label">Confidential Note</span>
            <textarea
              id="private-note-content"
              className="es-input"
              rows={4}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError("");
              }}
              placeholder="Document confidential observations, protective factors, or support follow-up..."
              style={{ height: "auto", padding: "0.625rem 0.75rem", resize: "vertical" }}
            />
          </label>

          {error && (
            <p
              style={{
                margin: 0,
                fontSize: "0.8125rem",
                color: "var(--es-danger-text)",
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" leftIcon={<Icon name="lock" size={14} />}>
              Add Confidential Note
            </Button>
          </div>
        </form>

        <div
          style={{
            borderTop: "1px solid var(--es-border-subtle)",
            paddingTop: "1rem",
          }}
        >
          {notes.length === 0 ? (
            <EmptyState
              icon="lock"
              title="No private notes recorded yet"
              description="Add confidential session notes or observations above. Notes remain isolated to the Counselling workspace."
            />
          ) : (
            <div className="es-stack" style={{ gap: "0.75rem" }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "var(--es-radius-md)",
                    border: "1px solid var(--es-border-subtle)",
                    backgroundColor: "var(--es-surface)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <Badge variant="neutral">{note.noteType}</Badge>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      {note.authorName} · {note.createdAt}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: "var(--es-text-primary)",
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

