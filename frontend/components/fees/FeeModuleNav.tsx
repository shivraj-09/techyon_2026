"use client";

import React from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";

export type FeeModuleTab = "overview" | "invoices" | "balances" | "payments";

export interface FeeModuleNavProps {
  activeTab: FeeModuleTab;
  onTabChange?: (tab: FeeModuleTab) => void;
}

const NAV_ITEMS: {
  id: FeeModuleTab;
  label: string;
  href: string;
  icon: IconName;
}[] = [
  {
    id: "overview",
    label: "1. Overview",
    href: "/dashboard/fees",
    icon: "layout-dashboard",
  },
  {
    id: "invoices",
    label: "2. Invoices",
    href: "/dashboard/fees/invoices",
    icon: "file-text",
  },
  {
    id: "balances",
    label: "3. Outstanding Balances",
    href: "/dashboard/fees/balances",
    icon: "indian-rupee",
  },
  {
    id: "payments",
    label: "4. Payment History",
    href: "/dashboard/fees/payments",
    icon: "credit-card",
  },
];

export function FeeModuleNav({ activeTab, onTabChange }: FeeModuleNavProps) {
  return (
    <nav
      aria-label="Fee Management Module Navigation"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        padding: "6px",
        backgroundColor: "var(--es-bg-surface)",
        border: "1px solid var(--es-border)",
        borderRadius: "var(--es-radius-lg)",
        boxShadow: "var(--es-shadow-xs)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexWrap: "wrap",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeTab;
          const buttonStyle: React.CSSProperties = {
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 14px",
            fontSize: "13px",
            fontWeight: isActive ? 600 : 500,
            color: isActive ? "var(--es-primary)" : "var(--es-text-secondary)",
            backgroundColor: isActive
              ? "var(--es-primary-subtle)"
              : "transparent",
            border: isActive
              ? "1px solid var(--es-primary-border)"
              : "1px solid transparent",
            borderRadius: "var(--es-radius-sm)",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 140ms ease",
          };

          if (onTabChange) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                style={buttonStyle}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href} style={buttonStyle}>
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingRight: "8px",
          fontSize: "12px",
        }}
      >
        <Link
          href="/dashboard/fees/invoices"
          style={{
            color: "var(--es-text-muted)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Invoices Route →
        </Link>
        <span style={{ color: "var(--es-border-strong)" }}>|</span>
        <Link
          href="/dashboard/fees/balances"
          style={{
            color: "var(--es-text-muted)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Balances Route →
        </Link>
        <span style={{ color: "var(--es-border-strong)" }}>|</span>
        <Link
          href="/dashboard/fees/payments"
          style={{
            color: "var(--es-text-muted)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Payments Route →
        </Link>
      </div>
    </nav>
  );
}
