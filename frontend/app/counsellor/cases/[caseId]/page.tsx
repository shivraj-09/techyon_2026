"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  EmptyState,
  Icon,
  Select,
  Toast,
} from "@/components/ui";
import {
  CaseStatusBadge,
  PrivateNotesSection,
  SessionFormModal,
  SessionStatusBadge,
} from "@/components/counsellor";
import {
  CASE_STATUSES,
  type CaseStatus,
  type PrivateNoteType,
} from "@/config/counsellor-data";
import {
  addPrivateCaseNote,
  createCounsellingSession,
  updateCounsellingCaseStatus,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function CounsellorCaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const { cases, privateNotes, sessions } = useCounsellorStore();

  const caseRecord = cases.find((c) => c.id === params?.caseId);
  const caseNotes = useMemo(
    () => privateNotes.filter((n) => n.caseId === params?.caseId),
    [privateNotes, params?.caseId],
  );
  const linkedSessions = useMemo(
    () => sessions.filter((s) => s.caseId === params?.caseId),
    [sessions, params?.caseId],
  );

  const [pendingStatus, setPendingStatus] = useState<CaseStatus | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(
    null,
  );

  function handleConfirmStatusChange() {
    if (!caseRecord || !pendingStatus) return;
    updateCounsellingCaseStatus(caseRecord.id, pendingStatus);
    setToast({
      title: "Case Status Updated",
      desc: `${caseRecord.caseRef} is now marked ${pendingStatus}.`,
    });
    setPendingStatus(null);
  }

  function handleAddNote(content: string, noteType: PrivateNoteType) {
    if (!caseRecord) return;
    addPrivateCaseNote(caseRecord.id, content, noteType);
    setToast({
      title: "Private Note Added",
      desc: "Confidential note saved in session memory.",
    });
  }

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title={
            caseRecord
              ? `${caseRecord.caseRef} — ${caseRecord.studentName}`
              : "Counselling Case Not Found"
          }
          subtitle="Restricted counselling workspace containing confidential notes, support timeline, and linked sessions."
          actions={
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link href="/counsellor/cases">
                <Button variant="secondary" leftIcon={<Icon name="arrow-left" size={15} />}>
                  All Cases
                </Button>
              </Link>
              {caseRecord && (
                <Button
                  onClick={() => setSessionModalOpen(true)}
                  leftIcon={<Icon name="calendar" size={15} />}
                >
                  Schedule Session
                </Button>
              )}
            </div>
          }
        />

        {toast && (
          <Toast
            variant="success"
            title={toast.title}
            description={toast.desc}
            onDismiss={() => setToast(null)}
          />
        )}

        {!caseRecord ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="shield"
                title="Case unavailable"
                description="This counselling case ID could not be located."
                action={
                  <Link href="/counsellor/cases">
                    <Button>Return to Cases</Button>
                  </Link>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: "1.25rem",
              alignItems: "start",
            }}
          >
            <div className="es-stack">
              <Card>
                <CardHeader>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <CardTitle>Case Overview</CardTitle>
                    <CaseStatusBadge status={caseRecord.status} />
                  </div>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "1rem" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 165px), 1fr))",
                      gap: "0.75rem 1rem",
                      padding: "0.875rem",
                      borderRadius: "var(--es-radius-md)",
                      backgroundColor: "var(--es-surface-subtle)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Student
                      </div>
                      <div style={{ fontWeight: 600 }}>{caseRecord.studentName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Class & Code
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {caseRecord.className} · {caseRecord.studentCode}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Assigned Counsellor
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {caseRecord.assignedCounsellor}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Source Referral
                      </div>
                      <Link href={`/counsellor/referrals/${caseRecord.sourceReferralId}`}>
                        <Badge variant="neutral">{caseRecord.sourceReferralRef}</Badge>
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="es-label" style={{ marginBottom: "0.25rem" }}>
                      Primary Focus Area
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>
                      {caseRecord.focusArea}
                    </p>
                  </div>

                  <div
                    style={{
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--es-border-subtle)",
                      maxWidth: "300px",
                    }}
                  >
                    <Select
                      id="case-status-selector"
                      label="Update Case Status"
                      value={caseRecord.status}
                      onChange={(e) => {
                        const next = e.target.value as CaseStatus;
                        if (next !== caseRecord.status) {
                          setPendingStatus(next);
                        }
                      }}
                      options={CASE_STATUSES.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                    />
                  </div>
                </CardBody>
              </Card>

              <PrivateNotesSection
                notes={caseNotes}
                onAddNote={handleAddNote}
              />
            </div>

            <div className="es-stack">
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
                    <CardTitle>Linked Counselling Sessions</CardTitle>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSessionModalOpen(true)}
                      leftIcon={<Icon name="plus" size={14} />}
                    >
                      Schedule
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                  {linkedSessions.length === 0 ? (
                    <EmptyState
                      icon="calendar"
                      title="No sessions linked yet"
                      description="Schedule an in-person or online session linked to this case."
                    />
                  ) : (
                    linkedSessions.map((ses) => (
                      <div
                        key={ses.id}
                        style={{
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
                          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                            {ses.sessionRef} · {ses.sessionType}
                          </span>
                          <SessionStatusBadge status={ses.status} />
                        </div>
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--es-text-secondary)",
                          }}
                        >
                          {ses.date} · {ses.startTime}–{ses.endTime}
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
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case Progression Timeline</CardTitle>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                  {caseRecord.timeline.map((evt) => (
                    <div
                      key={evt.id}
                      style={{
                        paddingBottom: "0.625rem",
                        borderBottom: "1px solid var(--es-border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <strong>{evt.title}</strong>
                        <span style={{ color: "var(--es-text-muted)" }}>
                          {evt.timestamp}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "0.25rem 0 0",
                          fontSize: "0.8125rem",
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        {evt.detail}
                      </p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={handleConfirmStatusChange}
        variant="primary"
        title="Confirm Case Status Change"
        description={`Change case ${caseRecord?.caseRef ?? ""} status from "${caseRecord?.status ?? ""}" to "${pendingStatus ?? ""}"?`}
        confirmLabel="Update Status"
      />

      {caseRecord && (
        <SessionFormModal
          isOpen={sessionModalOpen}
          onClose={() => setSessionModalOpen(false)}
          cases={cases}
          defaultCaseId={caseRecord.id}
          onSubmit={(input) => {
            createCounsellingSession(input);
            setToast({
              title: "Session Scheduled",
              desc: `Session scheduled for ${caseRecord.studentName} on ${input.date}.`,
            });
          }}
        />
      )}
    </AppLayout>
  );
}
