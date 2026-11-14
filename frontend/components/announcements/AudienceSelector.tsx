"use client";

import React from "react";
import { Icon, Select } from "@/components/ui";
import {
  AUDIENCE_OPTIONS,
  type AudienceTarget,
} from "@/config/announcements-data";
import { CLASS_OPTIONS } from "@/config/stage3-data";

export interface AudienceSelectorProps {
  selectedAudiences: AudienceTarget[];
  onChangeAudiences: (audiences: AudienceTarget[]) => void;
  specificClass?: string;
  onChangeSpecificClass?: (className: string) => void;
  error?: string;
  specificClassError?: string;
}

export function AudienceSelector({
  selectedAudiences,
  onChangeAudiences,
  specificClass = "",
  onChangeSpecificClass,
  error,
  specificClassError,
}: AudienceSelectorProps) {
  const hasSpecificClass = selectedAudiences.includes("Specific Class");

  function toggleAudience(target: AudienceTarget) {
    const exists = selectedAudiences.includes(target);
    if (exists) {
      const next = selectedAudiences.filter((item) => item !== target);
      onChangeAudiences(next);
      if (target === "Specific Class" && onChangeSpecificClass) {
        onChangeSpecificClass("");
      }
      return;
    }

    onChangeAudiences([...selectedAudiences, target]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div className="es-field" style={{ margin: 0 }}>
        <span className="es-label">
          Target Audience <span style={{ color: "var(--es-danger)" }}>*</span>
        </span>
        <div
          role="group"
          aria-label="Target Audience"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          {AUDIENCE_OPTIONS.map((option) => {
            const isSelected = selectedAudiences.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleAudience(option)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 12px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${
                    isSelected
                      ? "var(--es-primary)"
                      : "var(--es-border-default)"
                  }`,
                  backgroundColor: isSelected
                    ? "var(--es-primary-subtle)"
                    : "var(--es-bg-surface)",
                  color: isSelected
                    ? "var(--es-primary)"
                    : "var(--es-text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                {isSelected && <Icon name="check-circle" size={14} />}
                <span>{option}</span>
              </button>
            );
          })}
        </div>
        {error && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "12px",
              color: "var(--es-danger)",
              fontWeight: 500,
            }}
          >
            {error}
          </p>
        )}
      </div>

      {hasSpecificClass && (
        <div style={{ maxWidth: "320px" }}>
          <Select
            id="announcement-specific-class"
            label="Select Class"
            value={specificClass}
            onChange={(e) => onChangeSpecificClass?.(e.target.value)}
            options={[
              { value: "", label: "Choose a class..." },
              ...CLASS_OPTIONS.map((cls) => ({
                value: cls.name,
                label: cls.name,
              })),
            ]}
          />
          {specificClassError && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: "var(--es-danger)",
                fontWeight: 500,
              }}
            >
              {specificClassError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

