"use client";

import React from "react";
import { Avatar, Icon } from "@/components/ui";
import {
  PARENT_CHILDREN,
  type ParentChildRecord,
} from "@/config/parent-data";

export interface ChildSelectorProps {
  childrenList?: ParentChildRecord[];
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
  includeAllOption?: boolean;
  allLabel?: string;
  label?: string;
}

export function ChildSelector({
  childrenList = PARENT_CHILDREN,
  selectedChildId,
  onSelectChild,
  includeAllOption = false,
  allLabel = "All Children",
  label,
}: ChildSelectorProps) {
  if (childrenList.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}
      role="tablist"
      aria-label={label || "Select child"}
    >
      {label && (
        <span
          style={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--es-text-muted)",
            marginRight: "2px",
          }}
        >
          {label}
        </span>
      )}

      {includeAllOption && (
        <button
          type="button"
          role="tab"
          aria-selected={selectedChildId === "all"}
          onClick={() => onSelectChild("all")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "var(--es-radius-md)",
            border:
              selectedChildId === "all"
                ? "1.5px solid var(--es-primary)"
                : "1px solid var(--es-border)",
            backgroundColor:
              selectedChildId === "all"
                ? "var(--es-primary-subtle)"
                : "var(--es-bg-surface)",
            color:
              selectedChildId === "all"
                ? "var(--es-primary)"
                : "var(--es-text-secondary)",
            fontSize: "13px",
            fontWeight: selectedChildId === "all" ? 600 : 500,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "var(--es-shadow-xs)",
            transition: "all var(--es-transition-fast)",
          }}
        >
          <Icon name="users" size={15} />
          <span>{allLabel}</span>
        </button>
      )}

      {childrenList.map((child) => {
        const isActive = selectedChildId === child.id;
        return (
          <button
            key={child.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectChild(child.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              padding: "7px 13px",
              borderRadius: "var(--es-radius-md)",
              border: isActive
                ? "1.5px solid var(--es-primary)"
                : "1px solid var(--es-border)",
              backgroundColor: isActive
                ? "var(--es-primary-subtle)"
                : "var(--es-bg-surface)",
              color: isActive
                ? "var(--es-primary)"
                : "var(--es-text-primary)",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "var(--es-shadow-xs)",
              transition: "all var(--es-transition-fast)",
              textAlign: "left",
            }}
          >
            <Avatar name={child.fullName} size="sm" />
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.2,
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {child.fullName}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: isActive
                    ? "var(--es-primary)"
                    : "var(--es-text-muted)",
                }}
              >
                {child.className} · {child.studentId}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
