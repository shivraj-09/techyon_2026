import React from "react";

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="es-tooltip-wrapper" data-tooltip={content}>
      {children}
    </span>
  );
}

