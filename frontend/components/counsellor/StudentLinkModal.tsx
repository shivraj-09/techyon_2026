"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Icon, Input, Modal } from "@/components/ui";
import {
  AVAILABLE_AUTH_ACCOUNTS,
  type StudentVoiceLinkRecord,
} from "@/config/counsellor-data";

export interface StudentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentVoiceLinkRecord | null;
  existingLinks: StudentVoiceLinkRecord[];
  onConfirmLink: (
    linkRecordId: string,
    accountId: string,
    accountLabel: string,
  ) => { ok: boolean; error?: string };
}

export function StudentLinkModal({
  isOpen,
  onClose,
  record,
  existingLinks,
  onConfirmLink,
}: StudentLinkModalProps) {
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAccountSearch("");
      setSelectedAccountId("");
      setStep("select");
      setError("");
    }
  }, [isOpen, record?.id]);

  const takenAccountIds = useMemo(
    () =>
      new Set(
        existingLinks
          .filter((l) => l.status === "Linked" && l.linkedAccountId)
          .map((l) => l.linkedAccountId as string),
      ),
    [existingLinks],
  );

  const filteredAccounts = useMemo(() => {
    const q = accountSearch.trim().toLowerCase();
    return AVAILABLE_AUTH_ACCOUNTS.filter((acc) => {
      if (!q) return true;
      return (
        acc.accountRef.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q)
      );
    });
  }, [accountSearch]);

  if (!record) return null;

  const chosenAccount = AVAILABLE_AUTH_ACCOUNTS.find(
    (a) => a.id === selectedAccountId,
  );

  function handleNextStep() {
    if (!chosenAccount) {
      setError("Please select an authenticated student account to link.");
      return;
    }
    if (takenAccountIds.has(chosenAccount.id)) {
      setError("This auth account is already linked to another student.");
      return;
    }
    setError("");
    setStep("confirm");
  }

  function handleSubmit() {
    if (!record || !chosenAccount) return;
    const res = onConfirmLink(
      record.id,
      chosenAccount.id,
      chosenAccount.accountRef,
    );
    if (!res.ok) {
      setError(res.error ?? "Unable to link account.");
      return;
    }
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === "select"
          ? "Link Student Voice Account"
          : "Confirm Student Account Link"
      }
      description={`${record.studentName} (${record.studentCode}) · ${record.className}`}
      footer={
        step === "select" ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleNextStep} rightIcon={<Icon name="arrow-right" size={14} />}>
              Review Link
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep("select")}>
              Back
            </Button>
            <Button onClick={handleSubmit} leftIcon={<Icon name="link" size={14} />}>
              Confirm Account Link
            </Button>
          </>
        )
      }
    >
      {step === "select" ? (
        <div className="es-stack" style={{ gap: "0.875rem" }}>
          <Input
            id="admin-link-acc-search"
            label="Search Verified Auth Accounts"
            leftIcon={<Icon name="search" size={15} />}
            placeholder="Search by account reference or email..."
            value={accountSearch}
            onChange={(e) => setAccountSearch(e.target.value)}
          />

          <div className="es-stack" style={{ gap: "0.5rem", maxHeight: "260px", overflowY: "auto" }}>
            {filteredAccounts.map((acc) => {
              const isTaken = takenAccountIds.has(acc.id);
              const isSelected = selectedAccountId === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  disabled={isTaken}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    if (error) setError("");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.75rem 0.875rem",
                    borderRadius: "var(--es-radius-md)",
                    border: isSelected
                      ? "2px solid var(--es-primary)"
                      : "1px solid var(--es-border-subtle)",
                    backgroundColor: isSelected
                      ? "var(--es-primary-subtle)"
                      : "var(--es-surface)",
                    opacity: isTaken ? 0.55 : 1,
                    cursor: isTaken ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--es-text-primary)",
                      }}
                    >
                      {acc.accountRef}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      {acc.email} · {acc.verifiedAt}
                    </div>
                  </div>
                  <Badge variant={isTaken ? "neutral" : isSelected ? "primary" : "success"}>
                    {isTaken ? "Already Linked" : isSelected ? "Selected" : "Available"}
                  </Badge>
                </button>
              );
            })}
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--es-danger-text)" }}>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="es-stack" style={{ gap: "0.875rem" }}>
          <div
            style={{
              padding: "0.875rem",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-surface-subtle)",
              border: "1px solid var(--es-border-subtle)",
              fontSize: "0.8125rem",
              lineHeight: 1.55,
              color: "var(--es-text-secondary)",
            }}
          >
            <div>
              <strong>Student Roster Record:</strong> {record.studentName} ({record.studentCode}, {record.className})
            </div>
            <div style={{ marginTop: "0.35rem" }}>
              <strong>Target Auth Account:</strong> {chosenAccount?.accountRef} ({chosenAccount?.email})
            </div>
          </div>

          <div
            style={{
              padding: "0.75rem 0.875rem",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-primary-subtle)",
              color: "var(--es-text-secondary)",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <Icon name="shield" size={16} />
            <span>
              Linking enables verified access to Student Voice without granting
              Admin access to private counselling case notes or Student Voice chat contents.
            </span>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--es-danger-text)" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

