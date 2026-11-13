import React from "react";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({
  variant = "neutral",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`es-badge es-badge-${variant} ${className}`.trim()}
      {...props}
    >
      {dot && <span className="es-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

