"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  unread?: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Term 2 fee schedule published for Grade 10",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Morning attendance submitted for 18 of 20 sections",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Parent-Teacher conference circular scheduled",
    time: "Yesterday",
    unread: false,
  },
];

export interface NotificationButtonProps {
  notificationsHref?: string;
}

export function NotificationButton({
  notificationsHref = "/dashboard/notifications",
}: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div className="es-popover-anchor" ref={containerRef}>
      <button
        type="button"
        className="es-icon-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        title="Notifications"
      >
        <Icon name="bell" size={17} />
        {unreadCount > 0 && <span className="es-unread-dot" />}
      </button>

      {open && (
        <div className="es-popover" style={{ width: "19rem" }}>
          <div
            className="es-popover-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--es-text)",
                }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="primary">{unreadCount} new</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.75rem",
                  color: "var(--es-primary)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            {notifications.map((item) => (
              <Link
                key={item.id}
                href={notificationsHref}
                className="es-popover-item"
                style={{
                  alignItems: "flex-start",
                  flexDirection: "column",
                  gap: "0.125rem",
                }}
                onClick={() => setOpen(false)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    width: "100%",
                  }}
                >
                  {item.unread && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "9999px",
                        background: "var(--es-primary)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: item.unread ? 600 : 400,
                      color: "var(--es-text)",
                      lineHeight: 1.35,
                    }}
                  >
                    {item.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--es-text-subtle)",
                  }}
                >
                  {item.time}
                </span>
              </Link>
            ))}
          </div>

          <div className="es-popover-divider" />
          <Link
            href={notificationsHref}
            className="es-popover-item"
            style={{ justifyContent: "center", color: "var(--es-primary)" }}
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

