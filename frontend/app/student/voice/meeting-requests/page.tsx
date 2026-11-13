"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  ConfirmationDialog,
  EmptyState,
  Icon,
  Input,
  Modal,
  Select,
  Toast,
} from "@/components/ui";
import { MeetingRequestStatusBadge } from "@/components/counsellor";
import { CURRENT_STUDENT_VOICE_OWNER } from "@/config/counsellor-data";
import {
  cancelMeetingRequestByStudent,
  createMeetingRequest,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function StudentVoiceMeetingRequestsPage() {
  const { meetingRequests, conversations } = useCounsellorStore();

  const myConversations = useMemo(
    () =>
      conversations.filter(
        (c) => c.ownerAccountKey === CURRENT_STUDENT_VOICE_OWNER.ownerAccountKey,
      ),
    [conversations],
  );

  const myRequests = useMemo(
    () =>
      meetingRequests.filter(
        (m) => m.ownerAccountKey === CURRENT_STUDENT_VOICE_OWNER.ownerAccountKey,
      ),
    [meetingRequests],
  );

  const [newOpen, setNewOpen] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState(
    myConversations[0]?.id ?? "",
  );
  const [availability, setAvailability] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [error, setError] = useState("");
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const convId = selectedConvId || myConversations[0]?.id;
    if (!convId) {
      setError("Please start a Student Voice conversation first.");
      return;
    }
    if (availability.trim().length < 5) {
      setError("Please share preferred days or break timings.");
      return;
    }
    const res = createMeetingRequest({
      conversationId: convId,
      preferredAvailability: availability.trim(),
      studentMessage: studentNote.trim() || undefined,
    });
    if (!res.ok) {
      setError(res.error ?? "Unable to submit request.");
      return;
    }
    setAvailability("");
    setStudentNote("");
    setError("");
    setNewOpen(false);
    setToastMsg("Meeting request submitted to the School Counsellor.");
  }

  return (
    <AppLayout defaultRole="student">
      <div className="es-stack">
        <PageHeader
          title="In-Person Meeting Requests"
          subtitle="Request an optional face-to-face session linked to one of your Student Voice conversations."
          actions={
            <Button
              onClick={() => {
                setSelectedConvId(myConversations[0]?.id ?? "");
                setNewOpen(true);
              }}
              leftIcon={<Icon name="plus" size={16} />}
            >
              New Meeting Request
            </Button>
          }
        />

        {toastMsg && (
          <Toast
            variant="success"
            title="Updated"
            description={toastMsg}
            onDismiss={() => setToastMsg(null)}
          />
        )}

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            {myRequests.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No meeting requests yet"
                description="If you prefer to talk in person, you can request a private meeting slot here or inside any conversation."
                action={
                  <Button onClick={() => setNewOpen(true)}>
                    Request In-Person Meeting
                  </Button>
                }
              />
            ) : (
              myRequests.map((req) => (
                <Card
                  key={req.id}
                  style={{ backgroundColor: "var(--es-surface-subtle)" }}
                >
                  <CardBody className="es-stack" style={{ gap: "0.625rem" }}>
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
                        <Link href={`/student/voice/conversations/${req.conversationId}`}>
                          <Badge variant="neutral">
                            Thread {req.conversationRef}
                          </Badge>
                        </Link>
                      </div>
                      <MeetingRequestStatusBadge status={req.status} />
                    </div>

                    <div style={{ fontSize: "0.875rem" }}>
                      <strong>Preferred Availability:</strong>{" "}
                      {req.preferredAvailability}
                    </div>

                    {req.studentMessage && (
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        Your note: &ldquo;{req.studentMessage}&rdquo;
                      </div>
                    )}

                    {req.status === "Approved" && (
                      <div
                        style={{
                          padding: "0.75rem",
                          borderRadius: "var(--es-radius-md)",
                          backgroundColor: "var(--es-success-bg)",
                          color: "var(--es-success-text)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <div>
                          <strong>Confirmed Slot:</strong>{" "}
                          {req.confirmedSlot ?? req.preferredAvailability}
                        </div>
                        {req.confirmedLocation && (
                          <div>
                            <strong>Location:</strong> {req.confirmedLocation}
                          </div>
                        )}
                      </div>
                    )}

                    {req.counsellorResponse && (
                      <div
                        style={{
                          padding: "0.75rem",
                          borderRadius: "var(--es-radius-md)",
                          backgroundColor: "var(--es-surface)",
                          border: "1px solid var(--es-border-subtle)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <strong>Counsellor Note:</strong> {req.counsellorResponse}
                      </div>
                    )}

                    {req.status === "Pending" && (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCancelTargetId(req.id)}
                        >
                          Cancel Pending Request
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={newOpen}
        onClose={() => setNewOpen(false)}
        title="Request In-Person Counselling Meeting"
        description="Your request stays pseudonymous until approved by the School Counsellor."
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="student-new-mr-form">
              Submit Request
            </Button>
          </>
        }
      >
        <form
          id="student-new-mr-form"
          onSubmit={handleSubmit}
          className="es-stack"
          style={{ gap: "0.875rem" }}
        >
          <Select
            id="sv-mr-conv"
            label="Linked Conversation"
            value={selectedConvId || myConversations[0]?.id || ""}
            onChange={(e) => setSelectedConvId(e.target.value)}
            options={
              myConversations.length > 0
                ? myConversations.map((c) => ({
                    value: c.id,
                    label: `${c.conversationRef} — ${c.subject}`,
                  }))
                : [{ value: "", label: "Start a conversation first" }]
            }
          />
          <Input
            id="sv-mr-availability"
            label="Preferred Availability *"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="e.g. Wednesday lunch break or Friday after 3 PM"
            required
          />
          <label className="es-field" htmlFor="sv-mr-note">
            <span className="es-label">Additional Message (Optional)</span>
            <textarea
              id="sv-mr-note"
              className="es-input"
              rows={3}
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Anything that helps make the check-in comfortable..."
              style={{
                height: "auto",
                padding: "0.625rem 0.75rem",
                resize: "vertical",
              }}
            />
          </label>
          {error && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--es-danger-text)" }}>
              {error}
            </p>
          )}
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(cancelTargetId)}
        onClose={() => setCancelTargetId(null)}
        onConfirm={() => {
          if (!cancelTargetId) return;
          cancelMeetingRequestByStudent(cancelTargetId);
          setToastMsg("Pending meeting request cancelled.");
          setCancelTargetId(null);
        }}
        variant="danger"
        title="Cancel Meeting Request"
        description="Are you sure you want to withdraw this in-person meeting request? You can always continue chatting in Student Voice."
        confirmLabel="Cancel Request"
      />
    </AppLayout>
  );
}
