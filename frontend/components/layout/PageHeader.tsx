import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="es-page-header">
      <div>
        <h1 className="es-page-title">{title}</h1>
        {subtitle && <p className="es-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="es-page-actions">{actions}</div>}
    </div>
  );
}

