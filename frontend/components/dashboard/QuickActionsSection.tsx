"use client";

import React from "react";
import { Icon } from "@/components/ui";
import {
  QUICK_ACTIONS,
  type QuickActionItem,
} from "@/config/admin-dashboard-data";

export interface QuickActionsSectionProps {
  onSelectAction: (action: QuickActionItem) => void;
}

export function QuickActionsSection({
  onSelectAction,
}: QuickActionsSectionProps) {
  return (
    <section aria-label="Quick Actions">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h2
          style={{
            fontSize: "14.5px",
            fontWeight: 600,
            color: "var(--es-text-primary)",
            margin: 0,
          }}
        >
          Quick Actions
        </h2>
        <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
          Common administrative workflows
        </span>
      </div>

      <div className="es-quick-actions-grid">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="es-quick-action-card"
            onClick={() => onSelectAction(action)}
          >
            <span className="es-quick-action-icon">
              <Icon name={action.icon} size={18} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="es-quick-action-label">{action.label}</div>
              <div className="es-quick-action-sub">{action.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

