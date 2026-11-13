"use client";

import React, { useEffect, useState } from "react";
import { Button, Icon, Input, Modal, Select } from "@/components/ui";
import {
  CURRENT_COUNSELLOR_ACTOR,
  SESSION_MODES,
  SESSION_TYPES,
  type CounsellingCaseRecord,
  type SessionMode,
  type SessionType,
} from "@/config/counsellor-data";
import type { CreateSessionInput } from "@/config/counsellor-store";

export interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CounsellingCaseRecord[];
  defaultCaseId?: string;
  onSubmit: (input: CreateSessionInput) => void;
}

export function SessionFormModal({
  isOpen,
  onClose,
  cases,
  defaultCaseId,
  onSubmit,
}: SessionFormModalProps) {
  const activeCases = cases.filter(
    (c) => c.status !== "Closed",
  );
  const initialCase =
    cases.find((c) => c.id === defaultCaseId) ??
    activeCases[0] ??
    cases[0];

  const [selectedCaseId, setSelectedCaseId] = useState(
    defaultCaseId ?? initialCase?.id ?? "",
  );
  const [date, setDate] = useState("2026-11-17");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:45");
  const [sessionType, setSessionType] = useState<SessionType>(
    "Individual Counselling",
  );
  const [mode, setMode] = useState<SessionMode>("In Person");
  const [locationOrLink, setLocationOrLink] = useState("Counselling Room 104");
  const [schedulingNotes, setSchedulingNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const target =
        cases.find((c) => c.id === defaultCaseId) ??
        activeCases[0] ??
        cases[0];
      setSelectedCaseId(defaultCaseId ?? target?.id ?? "");
      setError("");
    }
  }, [isOpen, defaultCaseId, cases]);

  const linkedCase = cases.find((c) => c.id === selectedCaseId);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!linkedCase) {
      setError("Please select an active counselling case.");
      return;
    }
    if (!date) {
      setError("Please select a session date.");
      return;
    }
    if (!startTime || !endTime || endTime <= startTime) {
      setError("End time must be later than start time.");
      return;
    }
    if (!locationOrLink.trim()) {
      setError(
        mode === "Online"
          ? "Please enter an online meeting link or room code."
          : "Please enter the counselling room or location.",
      );
      return;
    }

    onSubmit({
      caseId: linkedCase.id,
      caseRef: linkedCase.caseRef,
      studentName: linkedCase.studentName,
      className: linkedCase.className,
      date,
      startTime,
      endTime,
      sessionType,
      mode,
      locationOrLink: locationOrLink.trim(),
      assignedCounsellor: CURRENT_COUNSELLOR_ACTOR.name,
      schedulingNotes: schedulingNotes.trim() || undefined,
    });
    setSchedulingNotes("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Counselling Session"
      description="Create a scheduled appointment linked to an accepted counselling case."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="counsellor-session-form" leftIcon={<Icon name="calendar" size={14} />}>
            Schedule Session
          </Button>
        </>
      }
    >
      <form
        id="counsellor-session-form"
        onSubmit={handleSave}
        className="es-stack"
        style={{ gap: "0.875rem" }}
      >
        <Select
          id="session-case"
          label="Linked Counselling Case"
          value={selectedCaseId}
          disabled={Boolean(defaultCaseId)}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          options={cases.map((c) => ({
            value: c.id,
            label: `${c.caseRef} — ${c.studentName} (${c.className})`,
          }))}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: "0.75rem",
          }}
        >
          <Input
            id="session-date"
            label="Session Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            id="session-start"
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            id="session-end"
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "0.75rem",
          }}
        >
          <Select
            id="session-type"
            label="Session Type"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value as SessionType)}
            options={SESSION_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Select
            id="session-mode"
            label="Session Mode"
            value={mode}
            onChange={(e) => {
              const next = e.target.value as SessionMode;
              setMode(next);
              setLocationOrLink(
                next === "Online"
                  ? "https://meet.edusync.local/cns-room"
                  : "Counselling Room 104",
              );
            }}
            options={SESSION_MODES.map((m) => ({ value: m, label: m }))}
          />
        </div>

        <Input
          id="session-location"
          label={mode === "Online" ? "Secure Video Meeting Link" : "Room / Campus Location"}
          value={locationOrLink}
          onChange={(e) => setLocationOrLink(e.target.value)}
          placeholder={mode === "Online" ? "https://..." : "Counselling Room 104"}
          required
        />

        <label className="es-field" htmlFor="session-notes">
          <span className="es-label">Scheduling Agenda (Non-confidential)</span>
          <textarea
            id="session-notes"
            className="es-input"
            rows={3}
            value={schedulingNotes}
            onChange={(e) => setSchedulingNotes(e.target.value)}
            placeholder="Brief scheduling preparation or logistic details..."
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
      </form>
    </Modal>
  );
}

