"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  Input,
  Modal,
  Select,
  Toast,
} from "@/components/ui";
import {
  IdentityRevealModal,
  MeetingRequestStatusBadge,
} from "@/components/counsellor";
import type {
  MeetingRequestRecord,
  MeetingRequestStatus,
} from "@/config/counsellor-data";
import {
  resolveAuthorizedIdentityForMeetingRequest,
  reviewMeetingRequestByCounsellor,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function CounsellorMeetingRequestsPage() {
  const { meetingRequests } = useCounsellorStore();

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | MeetingRequestStatus
  >("ALL");
  const [search, setSearch] = useState("");
  const [reviewTarget, setReviewTarget] = useState<{
    request: MeetingRequestRecord;
    decision: "Approved" | "Declined";
  } | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState(
    "Tuesday, 18 Nov · 11:00–11:30 AM",
  );
  const [confirmedLocation, setConfirmedLocation] = useState(
    "Wellbeing & Counselling Room 104",
  );
  const [counsellorResponse, setCounsellorResponse] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [revealRequest, setRevealRequest] =
    useState<MeetingRequestRecord | null>(null);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return meetingRequests.filter((m) => {
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.requestRef.toLowerCase().includes(q) ||
        m.studentPseudonymRef.toLowerCase().includes(q) ||
        m.conversationRef.toLowerCase().includes(q) ||
        m.preferredAvailability.toLowerCase().includes(q)
      );
    });
  }, [meetingRequests, statusFilter, search]);

  const counts = useMemo(
    () => ({
      pending: meetingRequests.filter((m) => m.status === "Pending").length,
      approved: meetingRequests.filter((m) => m.status === "Approved").length,
      declined: meetingRequests.filter((m) => m.status === "Declined").length,
    }),
    [meetingRequests],
  );

  function openReview(
    request: MeetingRequestRecord,
    decision: "Approved" | "Declined",
  ) {
    setReviewTarget({ request, decision });
    setConfirmedSlot(request.preferredAvailability);
    setConfirmedLocation("Wellbeing & Counselling Room 104");
    setCounsellorResponse(
      decision === "Approved"
        ? "Thank you for reaching out. Looking forward to meeting in a quiet, private space."
        : "Let us continue in Student Voice chat for now, or suggest an alternative afternoon slot.",
    );
    setReviewError("");
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewTarget) return;
    if (reviewTarget.decision === "Approved") {
      if (!confirmedSlot.trim() || !confirmedLocation.trim()) {
        setReviewError("Please specify confirmed meeting slot and location.");
        return;
      }
    } else if (counsellorResponse.trim().length < 10) {
      setReviewError("Please provide a supportive explanation (min 10 characters).");
      return;
    }

    reviewMeetingRequestByCounsellor(
      reviewTarget.request.id,
      reviewTarget.decision,
      {
        confirmedSlot:
          reviewTarget.decision === "Approved"
            ? confirmedSlot.trim()
            : undefined,
        confirmedLocation:
          reviewTarget.decision === "Approved"
            ? confirmedLocation.trim()
            : undefined,
        counsellorResponse: counsellorResponse.trim() || undefined,
      },
    );

    setToast({
      title: `Meeting Request ${reviewTarget.decision}`,
      desc:
        reviewTarget.decision === "Approved"
          ? `${reviewTarget.request.requestRef} approved. Authorised identity reveal is now available if needed.`
          : `${reviewTarget.request.requestRef} declined.`,
    });
    setReviewTarget(null);
  }

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title="In-Person Meeting Requests"
          subtitle="Review student requests to transition from pseudonymous Student Voice chat to an in-person counselling slot."
        />

        {toast && (
          <Toast
            variant="success"
            title={toast.title}
            description={toast.desc}
            onDismiss={() => setToast(null)}
          />
        )}

        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--es-radius-md)",
            backgroundColor: "var(--es-warning-bg)",
            color: "var(--es-warning-text)",
            fontSize: "0.8125rem",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
          }}
        >
          <Icon name="shield" size={16} />
          <span>
            <strong>Controlled Identity Reveal Rule:</strong> Student identities
            stay strictly masked on <strong>Pending</strong>,{" "}
            <strong>Declined</strong>, and <strong>Cancelled</strong> requests.
            Only after explicit <strong>Approval</strong> does{" "}
            <strong>View Student Identity</strong> unlock via a safeguarded
            confirmation prompt.
          </span>
        </div>

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Pending Review</div>
            <div className="es-stat-value">{counts.pending}</div>
            <div className="es-stat-meta">Awaiting time & room confirmation</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Approved Meetings</div>
            <div className="es-stat-value">{counts.approved}</div>
            <div className="es-stat-meta">Eligible for safeguarded reveal</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Declined</div>
            <div className="es-stat-value">{counts.declined}</div>
            <div className="es-stat-meta">Identity remains masked</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="cns-mr-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search MR ref, SV pseudonym, availability..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="cns-mr-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | MeetingRequestStatus)
                }
                options={[
                  { value: "ALL", label: "All Statuses" },
                  { value: "Pending", label: "Pending" },
                  { value: "Approved", label: "Approved" },
                  { value: "Declined", label: "Declined" },
                  { value: "Cancelled", label: "Cancelled" },
                ]}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="user-check"
                title="No matching meeting requests"
                description="Requests submitted from Student Voice conversations will appear here."
              />
            ) : (
              <div className="es-stack" style={{ gap: "0.875rem" }}>
                {filtered.map((req) => (
                  <Card
                    key={req.id}
                    style={{ backgroundColor: "var(--es-surface-subtle)" }}
                  >
                    <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                          <Badge variant="primary">{req.studentPseudonymRef}</Badge>
                          <Badge variant="neutral">{req.requestRef}</Badge>
                          <Link href={`/counsellor/student-voice/${req.conversationId}`}>
                            <Badge variant="neutral">
                              Thread {req.conversationRef}
                            </Badge>
                          </Link>
                        </div>
                        <MeetingRequestStatusBadge status={req.status} />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
                          gap: "0.75rem",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <div>
                          <div style={{ color: "var(--es-text-muted)" }}>
                            Student Preferred Availability
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            {req.preferredAvailability}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "var(--es-text-muted)" }}>
                            Submitted Date
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            {req.submittedDate}
                          </div>
                        </div>
                        {req.confirmedSlot && (
                          <div>
                            <div style={{ color: "var(--es-text-muted)" }}>
                              Confirmed Slot & Location
                            </div>
                            <div style={{ fontWeight: 600 }}>
                              {req.confirmedSlot} · {req.confirmedLocation}
                            </div>
                          </div>
                        )}
                      </div>

                      {req.studentMessage && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8125rem",
                            color: "var(--es-text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          &ldquo;{req.studentMessage}&rdquo;
                        </p>
                      )}

                      {req.counsellorResponse && (
                        <div
                          style={{
                            padding: "0.625rem 0.875rem",
                            borderRadius: "var(--es-radius-md)",
                            backgroundColor: "var(--es-surface)",
                            border: "1px solid var(--es-border-subtle)",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <strong>Counsellor Response:</strong>{" "}
                          {req.counsellorResponse}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {req.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openReview(req, "Approved")}
                              leftIcon={<Icon name="check-circle" size={14} />}
                            >
                              Approve & Assign Slot
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => openReview(req, "Declined")}
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {req.status === "Approved" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setRevealRequest(req)}
                            leftIcon={<Icon name="eye" size={14} />}
                          >
                            View Student Identity
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        title={
          reviewTarget?.decision === "Approved"
            ? "Approve In-Person Meeting Request"
            : "Decline Meeting Request"
        }
        description={
          reviewTarget
            ? `${reviewTarget.request.requestRef} · ${reviewTarget.request.studentPseudonymRef}`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewTarget(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="review-mr-form"
              variant={
                reviewTarget?.decision === "Declined" ? "danger" : "primary"
              }
            >
              {reviewTarget?.decision === "Approved"
                ? "Confirm Approval"
                : "Confirm Decline"}
            </Button>
          </>
        }
      >
        <form
          id="review-mr-form"
          onSubmit={handleSubmitReview}
          className="es-stack"
          style={{ gap: "0.875rem" }}
        >
          {reviewTarget?.decision === "Approved" && (
            <>
              <Input
                id="mr-confirmed-slot"
                label="Confirmed Day & Time Slot"
                value={confirmedSlot}
                onChange={(e) => setConfirmedSlot(e.target.value)}
                required
              />
              <Input
                id="mr-confirmed-location"
                label="Counselling Location / Room"
                value={confirmedLocation}
                onChange={(e) => setConfirmedLocation(e.target.value)}
                required
              />
            </>
          )}

          <label className="es-field" htmlFor="mr-response-note">
            <span className="es-label">Supportive Note to Student</span>
            <textarea
              id="mr-response-note"
              className="es-input"
              rows={3}
              value={counsellorResponse}
              onChange={(e) => setCounsellorResponse(e.target.value)}
              style={{
                height: "auto",
                padding: "0.625rem 0.75rem",
                resize: "vertical",
              }}
            />
          </label>

          {reviewError && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--es-danger-text)" }}>
              {reviewError}
            </p>
          )}
        </form>
      </Modal>

      <IdentityRevealModal
        isOpen={Boolean(revealRequest)}
        onClose={() => setRevealRequest(null)}
        request={revealRequest}
        onAuthorizeReveal={resolveAuthorizedIdentityForMeetingRequest}
      />
    </AppLayout>
  );
}
