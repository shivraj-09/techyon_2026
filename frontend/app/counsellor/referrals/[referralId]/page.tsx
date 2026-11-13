"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Modal,
  Toast,
} from "@/components/ui";
import {
  ReferralPriorityBadge,
  ReferralStatusBadge,
} from "@/components/counsellor";
import {
  addReferralNonConfidentialUpdate,
  createCaseFromAcceptedReferral,
  updateReferralStatusByCounsellor,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function CounsellorReferralDetailPage() {
  const params = useParams<{ referralId: string }>();
  const router = useRouter();
  const { referrals } = useCounsellorStore();

  const referral = referrals.find((r) => r.id === params?.referralId);

  const [teacherUpdateText, setTeacherUpdateText] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineError, setDeclineError] = useState("");
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(
    null,
  );

  function handleMarkUnderReview() {
    if (!referral) return;
    updateReferralStatusByCounsellor(referral.id, "Under Review");
    setToast({
      title: "Referral Under Review",
      desc: `${referral.referralRef} marked as Under Review.`,
    });
  }

  function handleConfirmAccept() {
    if (!referral) return;
    updateReferralStatusByCounsellor(referral.id, "Accepted");
    setToast({
      title: "Referral Accepted",
      desc: "You can now create a confidential Counselling Case from this referral.",
    });
  }

  function handleConfirmDecline(e: React.FormEvent) {
    e.preventDefault();
    if (!referral) return;
    if (declineReason.trim().length < 10) {
      setDeclineError("Please provide a brief, constructive rationale (min 10 characters).");
      return;
    }
    updateReferralStatusByCounsellor(referral.id, "Declined", {
      declineReason: declineReason.trim(),
    });
    setDeclineReason("");
    setDeclineError("");
    setDeclineModalOpen(false);
    setToast({
      title: "Referral Declined",
      desc: "Status updated and rationale recorded for the referring teacher.",
    });
  }

  function handleSaveTeacherUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!referral || !teacherUpdateText.trim()) return;
    addReferralNonConfidentialUpdate(referral.id, teacherUpdateText.trim());
    setTeacherUpdateText("");
    setToast({
      title: "Teacher Feedback Updated",
      desc: "Non-confidential guidance shared on the referring teacher's tracker.",
    });
  }

  function handleCreateCase() {
    if (!referral) return;
    const res = createCaseFromAcceptedReferral(referral.id);
    if (!res.ok || !res.caseRecord) {
      setToast({
        title: "Unable to Create Case",
        desc: res.error ?? "Only accepted referrals can create a case.",
      });
      return;
    }
    router.push(`/counsellor/cases/${res.caseRecord.id}`);
  }

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title={
            referral
              ? `${referral.referralRef} — ${referral.studentName}`
              : "Referral Not Found"
          }
          subtitle="Review teacher observations, update referral status, share classroom-safe guidance, and initiate a Counselling Case when accepted."
          actions={
            <Link href="/counsellor/referrals">
              <Button variant="secondary" leftIcon={<Icon name="arrow-left" size={15} />}>
                Back to Referrals
              </Button>
            </Link>
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

        {!referral ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="inbox"
                title="Referral not found"
                description="This referral ID does not exist in the current workspace."
                action={
                  <Link href="/counsellor/referrals">
                    <Button>Return to Referrals</Button>
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
                "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
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
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      width: "100%",
                    }}
                  >
                    <CardTitle>Referral Dossier</CardTitle>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <ReferralPriorityBadge priority={referral.priority} />
                      <ReferralStatusBadge status={referral.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "1rem" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
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
                      <div style={{ fontWeight: 600 }}>{referral.studentName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Class & ID
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {referral.className} · {referral.studentCode}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Submitted By
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {referral.submittedByTeacherName}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Observed / Submitted
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {referral.observedDate} / {referral.submittedDate}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="es-label" style={{ marginBottom: "0.25rem" }}>
                      Category & Summary
                    </div>
                    <Badge variant="neutral" style={{ marginBottom: "0.4rem" }}>
                      {referral.category}
                    </Badge>
                    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.55 }}>
                      {referral.description}
                    </p>
                  </div>

                  <div>
                    <div className="es-label" style={{ marginBottom: "0.25rem" }}>
                      Teacher&apos;s Factual Observations
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        lineHeight: 1.55,
                        color: "var(--es-text-secondary)",
                      }}
                    >
                      {referral.observations}
                    </p>
                  </div>

                  {referral.actionsTaken && (
                    <div>
                      <div className="es-label" style={{ marginBottom: "0.25rem" }}>
                        Classroom Support Attempted
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        {referral.actionsTaken}
                      </p>
                    </div>
                  )}

                  {referral.declineReason && (
                    <div
                      style={{
                        padding: "0.75rem",
                        borderRadius: "var(--es-radius-md)",
                        backgroundColor: "var(--es-danger-bg)",
                        color: "var(--es-danger-text)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <strong>Decline Rationale:</strong> {referral.declineReason}
                    </div>
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
                    <CardTitle>Non-Confidential Teacher Feedback</CardTitle>
                    <Badge variant="neutral">Visible to Referring Teacher</Badge>
                  </div>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "0.875rem" }}>
                  {referral.teacherFeedbackNote && (
                    <div
                      style={{
                        padding: "0.75rem 0.875rem",
                        borderRadius: "var(--es-radius-md)",
                        backgroundColor: "var(--es-primary-subtle)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <strong>Current Shared Note:</strong>{" "}
                      {referral.teacherFeedbackNote}
                    </div>
                  )}

                  <form
                    onSubmit={handleSaveTeacherUpdate}
                    className="es-stack"
                    style={{ gap: "0.625rem" }}
                  >
                    <label className="es-field" htmlFor="cns-teacher-update">
                      <span className="es-label">
                        Post Classroom-Safe Update for {referral.submittedByTeacherName}
                      </span>
                      <textarea
                        id="cns-teacher-update"
                        className="es-input"
                        rows={3}
                        value={teacherUpdateText}
                        onChange={(e) => setTeacherUpdateText(e.target.value)}
                        placeholder="Share high-level classroom strategies only — never include private session disclosures..."
                        style={{
                          height: "auto",
                          padding: "0.625rem 0.75rem",
                          resize: "vertical",
                        }}
                      />
                    </label>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="secondary"
                        disabled={!teacherUpdateText.trim()}
                      >
                        Share Non-Confidential Update
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </div>

            <div className="es-stack">
              <Card>
                <CardHeader>
                  <CardTitle>Triage & Case Progression</CardTitle>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                  {referral.status === "Submitted" && (
                    <Button
                      variant="secondary"
                      onClick={handleMarkUnderReview}
                      leftIcon={<Icon name="clock" size={15} />}
                    >
                      Mark Under Review
                    </Button>
                  )}

                  {(referral.status === "Submitted" ||
                    referral.status === "Under Review") && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <Button
                        onClick={() => setAcceptConfirmOpen(true)}
                        leftIcon={<Icon name="check-circle" size={15} />}
                      >
                        Accept Referral
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeclineModalOpen(true)}
                        leftIcon={<Icon name="x" size={15} />}
                      >
                        Decline Referral
                      </Button>
                    </div>
                  )}

                  <div
                    style={{
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--es-border-subtle)",
                    }}
                  >
                    {referral.linkedCaseId ? (
                      <Link href={`/counsellor/cases/${referral.linkedCaseId}`}>
                        <Button
                          style={{ width: "100%" }}
                          leftIcon={<Icon name="shield" size={15} />}
                        >
                          Open Linked Counselling Case
                        </Button>
                      </Link>
                    ) : (
                      <div className="es-stack" style={{ gap: "0.5rem" }}>
                        <Button
                          onClick={handleCreateCase}
                          disabled={referral.status !== "Accepted"}
                          style={{ width: "100%" }}
                          leftIcon={<Icon name="shield" size={15} />}
                        >
                          Create Counselling Case
                        </Button>
                        {referral.status !== "Accepted" && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
                              color: "var(--es-text-muted)",
                            }}
                          >
                            Gated workflow: Only <strong>Accepted</strong>{" "}
                            referrals can create a Counselling Case.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referral Audit Timeline</CardTitle>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                  {referral.timeline.map((evt) => (
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
                        <strong>{evt.label}</strong>
                        <span style={{ color: "var(--es-text-muted)" }}>
                          {evt.timestamp}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {evt.actorRole}
                      </div>
                      {evt.note && (
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--es-text-secondary)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {evt.note}
                        </div>
                      )}
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={acceptConfirmOpen}
        onClose={() => setAcceptConfirmOpen(false)}
        onConfirm={handleConfirmAccept}
        variant="primary"
        title="Accept Student Referral"
        description="Accepting this referral enables creation of a confidential Counselling Case and schedules initial follow-up."
        confirmLabel="Accept Referral"
      />

      <Modal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title="Decline Referral"
        description="Provide a brief non-confidential rationale explaining why a formal counselling case is not required."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeclineModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="decline-referral-form" variant="danger">
              Confirm Decline
            </Button>
          </>
        }
      >
        <form
          id="decline-referral-form"
          onSubmit={handleConfirmDecline}
          className="es-stack"
          style={{ gap: "0.75rem" }}
        >
          <label className="es-field" htmlFor="decline-reason-input">
            <span className="es-label">Rationale for Referring Teacher *</span>
            <textarea
              id="decline-reason-input"
              className="es-input"
              rows={3}
              value={declineReason}
              onChange={(e) => {
                setDeclineReason(e.target.value);
                if (declineError) setDeclineError("");
              }}
              placeholder="e.g. Better addressed via subject teacher homework accommodation rather than formal counselling..."
              style={{
                height: "auto",
                padding: "0.625rem 0.75rem",
                resize: "vertical",
              }}
            />
          </label>
          {declineError && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--es-danger-text)" }}>
              {declineError}
            </p>
          )}
        </form>
      </Modal>
    </AppLayout>
  );
}
