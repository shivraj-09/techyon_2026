"use client";

import React from "react";
import Link from "next/link";
import { Badge, Button, Icon, type BadgeVariant } from "@/components/ui";
import {
  NOTIFICATION_CATEGORY_ICONS,
  type NotificationCategory,
  type NotificationRecord,
} from "@/config/notifications-data";

export interface NotificationItemProps {
  notification: NotificationRecord;
  onToggleRead: (id: string) => void;
}

const CATEGORY_STYLE_MAP: Record<
  NotificationCategory,
  {
    bg: string;
    color: string;
    border: string;
    badgeVariant: BadgeVariant;
  }
> = {
  Student: {
    bg: "var(--es-primary-subtle)",
    color: "var(--es-primary)",
    border: "var(--es-primary-border)",
    badgeVariant: "primary",
  },
  Attendance: {
    bg: "var(--es-success-bg)",
    color: "var(--es-success)",
    border: "var(--es-success-border)",
    badgeVariant: "success",
  },
  Fees: {
    bg: "var(--es-warning-bg)",
    color: "var(--es-warning)",
    border: "var(--es-warning-border)",
    badgeVariant: "warning",
  },
  Announcement: {
    bg: "var(--es-primary-subtle)",
    color: "var(--es-primary)",
    border: "var(--es-primary-border)",
    badgeVariant: "primary",
  },
  "AI Insight": {
    bg: "var(--es-danger-bg)",
    color: "var(--es-danger)",
    border: "var(--es-danger-border)",
    badgeVariant: "danger",
  },
  System: {
    bg: "var(--es-bg-app)",
    color: "var(--es-text-secondary)",
    border: "var(--es-border-default)",
    badgeVariant: "neutral",
  },
};

export function NotificationItem({
  notification,
  onToggleRead,
}: NotificationItemProps) {
  const categoryStyle = CATEGORY_STYLE_MAP[notification.category];
  const iconName = NOTIFICATION_CATEGORY_ICONS[notification.category];
  const isUnread = !notification.read;

  return (
    <article
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "14px",
        padding: "16px 20px",
        backgroundColor: isUnread
          ? "var(--es-primary-subtle)"
          : "var(--es-bg-surface)",
        borderBottom: "1px solid var(--es-border-subtle)",
        transition: "background-color 0.15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Category Icon */}
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "var(--es-radius-md)",
            backgroundColor: categoryStyle.bg,
            color: categoryStyle.color,
            border: `1px solid ${categoryStyle.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <Icon name={iconName} size={18} />
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {isUnread && (
              <span
                aria-label="Unread notification"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "9999px",
                  backgroundColor: "var(--es-primary)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}

            <h3
              style={{
                margin: 0,
                fontSize: "14.5px",
                fontWeight: isUnread ? 700 : 600,
                color: "var(--es-text-primary)",
              }}
            >
              {notification.title}
            </h3>

            <Badge variant={categoryStyle.badgeVariant}>
              {notification.category}
            </Badge>
          </div>

          <p
            style={{
              margin: "5px 0 8px",
              fontSize: "13.5px",
              color: "var(--es-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {notification.description}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "12px",
              color: "var(--es-text-muted)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Icon name="clock" size={12} />
              <span>{notification.timestamp}</span>
            </span>

            {notification.targetHref && (
              <Link
                href={notification.targetHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--es-primary)",
                  textDecoration: "none",
                }}
              >
                <span>Open module</span>
                <Icon name="arrow-up-right" size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Read / Unread Toggle */}
      <div style={{ flexShrink: 0 }}>
        <Button
          variant={isUnread ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onToggleRead(notification.id)}
        >
          {isUnread ? "Mark as Read" : "Mark as Unread"}
        </Button>
      </div>
    </article>
  );
}

