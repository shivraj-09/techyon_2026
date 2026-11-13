import React from "react";
import { Icon, type IconName } from "./Icon";

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`es-empty-state ${className}`.trim()}>
      <div className="es-empty-icon">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="es-empty-title">{title}</h3>
      <p className="es-empty-desc">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

