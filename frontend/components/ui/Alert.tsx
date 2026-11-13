import React from "react";
import { Icon, type IconName } from "./Icon";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const ALERT_ICON: Record<AlertVariant, IconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  danger: "alert-triangle",
};

export function Alert({
  variant = "info",
  title,
  children,
  action,
  className = "",
}: AlertProps) {
  const isErrorLike = variant === "danger" || variant === "warning";

  return (
    <div
      className={`es-alert es-alert-${variant} ${className}`.trim()}
      role={isErrorLike ? "alert" : "status"}
    >
      <Icon name={ALERT_ICON[variant]} size={18} className="es-alert-icon" />
      <div className="es-alert-body">
        {title && <div className="es-alert-title">{title}</div>}
        <div>{children}</div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

