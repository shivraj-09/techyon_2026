"use client";

import React, { useEffect, useState } from "react";
import { Button, Icon, Modal, type IconName } from "@/components/ui";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/config/notifications-data";

export interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences?: NotificationPreferences;
  onSave?: (preferences: NotificationPreferences) => void;
}

interface PreferenceItemConfig {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: IconName;
}

const PREFERENCE_ITEMS: PreferenceItemConfig[] = [
  {
    key: "studentRegistration",
    label: "Student registration alerts",
    description:
      "Notify when new students are enrolled or guardian records are updated.",
    icon: "user-plus",
  },
  {
    key: "attendanceAlerts",
    label: "Attendance alerts",
    description:
      "Notify when daily class attendance is submitted or drops below 75%.",
    icon: "clipboard-check",
  },
  {
    key: "feePaymentAlerts",
    label: "Fee payment alerts",
    description:
      "Receive instant alerts when student fee payments or receipts are recorded.",
    icon: "indian-rupee",
  },
  {
    key: "overdueFeeAlerts",
    label: "Overdue fee alerts",
    description:
      "Highlight invoices that pass their scheduled due date without settlement.",
    icon: "alert-triangle",
  },
  {
    key: "announcementUpdates",
    label: "Announcement updates",
    description:
      "Stay informed when school-wide notices are published or scheduled.",
    icon: "megaphone",
  },
  {
    key: "aiInsightAlerts",
    label: "AI insight alerts",
    description:
      "Surface predictive attendance anomalies and fee collection trends.",
    icon: "sparkles",
  },
];

export function NotificationSettingsModal({
  isOpen,
  onClose,
  preferences = DEFAULT_NOTIFICATION_PREFERENCES,
  onSave,
}: NotificationSettingsModalProps) {
  const [draft, setDraft] = useState<NotificationPreferences>(preferences);

  useEffect(() => {
    if (isOpen) {
      setDraft(preferences);
    }
  }, [isOpen, preferences]);

  function toggleKey(key: keyof NotificationPreferences) {
    setDraft((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function handleSave() {
    onSave?.(draft);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Settings"
      description="Customize which school activity alerts appear in your notification feed."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Preferences
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {PREFERENCE_ITEMS.map((item) => {
          const enabled = draft[item.key];
          return (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px",
                borderRadius: "var(--es-radius-md)",
                border: "1px solid var(--es-border-subtle)",
                backgroundColor: "var(--es-bg-app)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--es-radius-md)",
                    backgroundColor: "var(--es-primary-subtle)",
                    color: "var(--es-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <Icon name={item.icon} size={16} />
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--es-text-primary)",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--es-text-muted)",
                      marginTop: "2px",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={item.label}
                onClick={() => toggleKey(item.key)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: "9999px",
                  border: 0,
                  padding: "2px",
                  cursor: "pointer",
                  backgroundColor: enabled
                    ? "var(--es-primary)"
                    : "var(--es-border-default)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: enabled ? "flex-end" : "flex-start",
                  transition: "background-color 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

