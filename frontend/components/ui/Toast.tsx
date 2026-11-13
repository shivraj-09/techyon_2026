"use client";

import React from "react";
import { Icon } from "./Icon";

export type ToastVariant = "info" | "success" | "warning";

export interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

export function Toast({
  title,
  description,
  variant = "info",
  onDismiss,
}: ToastProps) {
  const iconName =
    variant === "success"
      ? "check-circle"
      : variant === "warning"
        ? "alert-triangle"
        : "info";

  const iconColor =
    variant === "success"
      ? "var(--es-success)"
      : variant === "warning"
        ? "var(--es-warning)"
        : "var(--es-primary)";

  return (
    <div className="es-toast" role="status" aria-live="polite">
      <span style={{ color: iconColor, marginTop: "0.125rem", flexShrink: 0 }}>
        <Icon name={iconName} size={18} />
      </span>
      <div className="es-toast-content">
        <div className="es-toast-title">{title}</div>
        {description && <div className="es-toast-desc">{description}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="es-icon-btn"
          style={{ width: 24, height: 24, border: "none" }}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

