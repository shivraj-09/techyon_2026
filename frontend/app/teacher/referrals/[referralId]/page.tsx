"use client";

import React from "react";
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
  EmptyState,
  Icon,
} from "@/components/ui";
import {
  ReferralPriorityBadge,
  ReferralStatusBadge,
} from "@/components/counsellor";
import { CURRENT_TEACHER_ACTOR } from "@/config/counsellor-data";
import { useCounsellorStore } from "@/config/counsellor-store";

export default function TeacherReferralDetailPage() {
  const params = useParams<{ referralId: string }>();
  const { referrals } = useCounsellorStore();

  const referral = referrals.find(
    (r) =>
      r.id === params?.referralId &&
      r.submittedByTeacherId === CURRENT_TEACHER_ACTOR.id,
  );

  return (
    <AppLayout defaultRole="teacher">
      <div className="es-stack">
        <PageHeader
          title={
            referral
              ? `${referral.referralRef} — ${referral.studentName}`
              : "Referral Not Found"
          }
          subtitle="Permitted status updates and non-confidential classroom guidance for your submitted referral."
          actions={
            <Link href="/teacher/referrals">
              <Button variant="secondary" leftIcon={<Icon name="arrow-left" size={15} />}>
                Back to My Referrals
              </Button>
            </Link>
          }
        />

        {!referral ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="clipboard-check"
                title="Referral unavailable"
                description="This referral does not exist or belongs to a different staff submission."
                action={
                  <Link href="/teacher/referrals">
                    <Button>Return to My Referrals</Button>
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
                "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
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
                    <CardTitle>Submitted Referral Summary</CardTitle>
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
                      <div style={{ fontWeight: 600 }}>{referral.studentName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Class
                      </div>
                      <div style={{ fontWeight: 600 }}>{referral.className}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Category
                      </div>
                      <div style={{ fontWeight: 600 }}>{referral.category}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                        Date Observed
                      </div>
                      <div style={{ fontWeight: 600 }}>{referral.observedDate}</div>
                    </div>
                  </div>

                  <div>
                    <div className="es-label" style={{ marginBottom: "0.25rem" }}>
                      Summary Description
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.55 }}>
                      {referral.description}
                    </p>
                  </div>

                  <div>
                    <div className="es-label" style={{ marginBottom: "0.25rem" }}>
                      Factual Observations
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
                        Classroom Actions Already Taken
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          lineHeight: 1.55,
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        {referral.actionsTaken}
                      </p>
                    </div>
                  )}

                  {referral.additionalContext && (
                    <div>
                      <div className="es-label" style={{ marginBottom: "0.25rem" }}>
                        Additional Context
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          lineHeight: 1.55,
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        {referral.additionalContext}
                      </p>
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
                      gap: "0.5rem",
                      width: "100%",
                    }}
                  >
                    <CardTitle>Permitted Counsellor Updates</CardTitle>
                    <Badge variant="neutral">Non-Confidential</Badge>
                  </div>
                </CardHeader>
                <CardBody className="es-stack" style={{ gap: "0.875rem" }}>
                  {referral.teacherFeedbackNote ? (
                    <div
                      style={{
                        padding: "0.875rem 1rem",
                        borderRadius: "var(--es-radius-md)",
                        backgroundColor: "var(--es-primary-subtle)",
                        fontSize: "0.875rem",
                        lineHeight: 1.55,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          marginBottom: "0.25rem",
                          color: "var(--es-primary)",
                        }}
                      >
                        Classroom Guidance from School Counsellor
                      </div>
                      {referral.teacherFeedbackNote}
                    </div>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      No non-confidential guidance note has been shared yet.
                    </p>
                  )}

                  {referral.status === "Declined" && referral.declineReason && (
                    <div
                      style={{
                        padding: "0.875rem 1rem",
                        borderRadius: "var(--es-radius-md)",
                        backgroundColor: "var(--es-danger-bg)",
                        color: "var(--es-danger-text)",
                        fontSize: "0.875rem",
                        lineHeight: 1.55,
                      }}
                    >
                      <strong>Decline Rationale:</strong> {referral.declineReason}
                    </div>
                  )}

                  <div
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                      fontSize: "0.75rem",
                      color: "var(--es-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Icon name="lock" size={14} />
                    <span>
                      Private counselling case notes, session logs, and Student
                      Voice transcripts are strictly excluded from teacher access.
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardBody className="es-stack" style={{ gap: "0.875rem" }}>
                {referral.timeline.map((evt) => (
                  <div
                    key={evt.id}
                    style={{
                      paddingBottom: "0.75rem",
                      borderBottom: "1px solid var(--es-border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {evt.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {evt.timestamp}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--es-text-muted)",
                        marginTop: "0.2rem",
                      }}
                    >
                      Updated by {evt.actorRole}
                    </div>
                    {evt.note && (
                      <p
                        style={{
                          margin: "0.35rem 0 0",
                          fontSize: "0.8125rem",
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        {evt.note}
                      </p>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
