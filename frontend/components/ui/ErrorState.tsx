"use client";

import React from "react";
import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export type ErrorStateKind = "404" | "403" | "401" | "500" | "network";

export interface ErrorStateProps {
  kind?: ErrorStateKind;
  title?: string;
  description?: string;
  referenceId?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const DEFAULTS: Record<
  ErrorStateKind,
  { code: string; title: string; description: string; icon: IconName }
> = {
  "404": {
    code: "404 Not Found",
    title: "Page not found",
    description:
      "The page you are looking for does not exist or may have moved to another section of EduSync.",
    icon: "search",
  },
  "403": {
    code: "403 Access Denied",
    title: "You do not have permission to view this page",
    description:
      "Your current school role does not include access to this area. Switch to your assigned workspace or contact your school administrator.",
    icon: "lock",
  },
  "401": {
    code: "401 Session Required",
    title: "Please sign in to continue",
    description:
      "Your session has expired or you are not currently signed in. Sign in with your school account to resume.",
    icon: "shield",
  },
  "500": {
    code: "500 Unexpected Error",
    title: "Something went wrong on our side",
    description:
      "We hit an unexpected issue while loading this view. You can try again now or return to your dashboard.",
    icon: "alert-triangle",
  },
  network: {
    code: "Connection Issue",
    title: "Unable to connect right now",
    description:
      "Please check your internet connection and try refreshing this page in a moment.",
    icon: "refresh-cw",
  },
};

export function ErrorState({
  kind = "500",
  title,
  description,
  referenceId,
  primaryAction,
  secondaryAction,
}: ErrorStateProps) {
  const preset = DEFAULTS[kind];

  return (
    <div className="es-error-shell">
      <div className="es-error-card" role="region" aria-label={title ?? preset.title}>
        <div className="es-error-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                backgroundColor: "#4F9CF9",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="brand-hub" size={16} />
            </span>
            <span style={{ fontWeight: 700, fontSize: "15px" }}>EduSync</span>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#FFE492",
              letterSpacing: "0.02em",
            }}
          >
            {preset.code}
          </span>
        </div>

        <div className="es-error-body">
          <div className="es-error-icon-wrap" aria-hidden="true">
            <Icon name={preset.icon} size={22} />
          </div>

          <h1 className="es-error-title">{title ?? preset.title}</h1>
          <p className="es-error-desc">{description ?? preset.description}</p>

          {referenceId && (
            <div style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
              Reference ID:{" "}
              <span className="es-code-ref">{referenceId}</span>
            </div>
          )}

          <div className="es-error-actions">
            {primaryAction &&
              (primaryAction.href ? (
                <Link
                  href={primaryAction.href}
                  className="es-btn es-btn-primary es-btn-md"
                >
                  {primaryAction.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="es-btn es-btn-primary es-btn-md"
                >
                  {primaryAction.label}
                </button>
              ))}

            {secondaryAction &&
              (secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="es-btn es-btn-secondary es-btn-md"
                >
                  {secondaryAction.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="es-btn es-btn-secondary es-btn-md"
                >
                  {secondaryAction.label}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

