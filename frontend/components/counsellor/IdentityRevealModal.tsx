"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button, Icon, Modal } from "@/components/ui";
import type {
  MeetingRequestRecord,
  RevealedStudentIdentity,
} from "@/config/counsellor-data";

export interface IdentityRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MeetingRequestRecord | null;
  onAuthorizeReveal: (requestId: string) => {
    ok: boolean;
    identity?: RevealedStudentIdentity;
    error?: string;
  };
}

export function IdentityRevealModal({
  isOpen,
  onClose,
  request,
  onAuthorizeReveal,
}: IdentityRevealModalProps) {
  const [revealedIdentity, setRevealedIdentity] =
    useState<RevealedStudentIdentity | null>(null);
  const [error, setError] = useState("");
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRevealedIdentity(null);
      setError("");
      setConfirmedCheck(false);
    }
  }, [isOpen, request?.id]);

  if (!request) return null;

  function handleConfirmReveal() {
    if (!request) return;
    if (!confirmedCheck) {
      setError("Please confirm that identity access is needed for this approved meeting.");
      return;
    }
    const result = onAuthorizeReveal(request.id);
    if (!result.ok || !result.identity) {
      setError(result.error ?? "Unable to resolve student identity.");
      return;
    }
    setRevealedIdentity(result.identity);
    setError("");
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        revealedIdentity
          ? "Authorised Student Identity"
          : "Confirm Controlled Identity Reveal"
      }
      description={
        revealedIdentity
          ? `Temporary session view for ${request.requestRef} (${request.studentPseudonymRef})`
          : `Meeting request ${request.requestRef} · Pseudonym ${request.studentPseudonymRef}`
      }
      footer={
        revealedIdentity ? (
          <Button onClick={onClose}>Close & Clear View</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReveal}
              leftIcon={<Icon name="eye" size={14} />}
            >
              Confirm & View Identity
            </Button>
          </>
        )
      }
    >
      {!revealedIdentity ? (
        <div className="es-stack" style={{ gap: "0.875rem" }}>
          <div
            style={{
              padding: "0.875rem",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-warning-bg)",
              color: "var(--es-warning-text)",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
            }}
          >
            <Icon name="shield" size={18} />
            <div>
              <strong>Protected Identity Safeguard:</strong> You are about to
              view the student&apos;s real identity solely to coordinate the
              approved in-person counselling meeting ({request.confirmedSlot ?? request.preferredAvailability}).
            </div>
          </div>

          <div
            style={{
              fontSize: "0.8125rem",
              color: "var(--es-text-secondary)",
              lineHeight: 1.55,
            }}
          >
            In production, this lookup triggers an auditable server request to{" "}
            <code>
              GET /student-voice/meeting-requests/{request.id}/student-identity
            </code>
            . Revealed identity details are never stored in browser storage.
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              color: "var(--es-text-primary)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => {
                setConfirmedCheck(e.target.checked);
                if (error) setError("");
              }}
              style={{ marginTop: "0.2rem" }}
            />
            <span>
              I confirm this identity reveal is required for safeguarding and
              scheduling the approved in-person session.
            </span>
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
        </div>
      ) : (
        <div className="es-stack" style={{ gap: "0.875rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <Badge variant="success">Approved Meeting Access Granted</Badge>
            <Badge variant="neutral">Transient Session View</Badge>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--es-radius-md)",
              border: "1px solid var(--es-border-subtle)",
              backgroundColor: "var(--es-surface-subtle)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
              gap: "0.75rem 1rem",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                Full Name
              </div>
              <div style={{ fontWeight: 600, color: "var(--es-text-primary)" }}>
                {revealedIdentity.fullName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                Student ID
              </div>
              <div style={{ fontWeight: 600, color: "var(--es-text-primary)" }}>
                {revealedIdentity.studentCode}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                Class & Section
              </div>
              <div style={{ fontWeight: 600, color: "var(--es-text-primary)" }}>
                {revealedIdentity.className}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                Linked Account Ref
              </div>
              <div style={{ fontWeight: 500, color: "var(--es-text-secondary)" }}>
                {revealedIdentity.linkedAccountRef}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                Primary Guardian
              </div>
              <div style={{ fontWeight: 500, color: "var(--es-text-primary)" }}>
                {revealedIdentity.guardianName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--es-text-muted)" }}>
                Guardian Contact
              </div>
              <div style={{ fontWeight: 500, color: "var(--es-text-primary)" }}>
                {revealedIdentity.guardianContact}
              </div>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              color: "var(--es-text-muted)",
            }}
          >
            Closing this modal clears the revealed student identity from active
            UI state.
          </p>
        </div>
      )}
    </Modal>
  );
}

