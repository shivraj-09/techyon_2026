"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Icon } from "./Icon";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--es-radius-md)",
            backgroundColor:
              variant === "danger"
                ? "var(--es-danger-bg)"
                : "var(--es-primary-subtle)",
            color:
              variant === "danger" ? "var(--es-danger)" : "var(--es-primary)",
            border: `1px solid ${
              variant === "danger"
                ? "var(--es-danger-border)"
                : "var(--es-primary-border)"
            }`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            name={variant === "danger" ? "alert-triangle" : "info"}
            size={18}
          />
        </span>
        <p
          style={{
            margin: 0,
            fontSize: "13.5px",
            color: "var(--es-text-secondary)",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      </div>
    </Modal>
  );
}
