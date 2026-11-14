"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Toast,
} from "@/components/ui";
import {
  NotificationFilters,
  NotificationList,
  NotificationSettingsModal,
  type NotificationReadFilter,
} from "@/components/notifications";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/config/notifications-data";
import {
  PARENT_NOTIFICATIONS,
  getStoredParentNotifications,
  saveStoredParentNotifications,
  type ParentNotificationItem,
} from "@/config/parent-data";

export interface ParentNotificationListProps {
  onUnreadCountChange?: (unreadCount: number) => void;
}

export function ParentNotificationList({
  onUnreadCountChange,
}: ParentNotificationListProps) {
  const [notifications, setNotifications] =
    useState<ParentNotificationItem[]>(PARENT_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<NotificationReadFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalPreferences, setModalPreferences] =
    useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const stored = getStoredParentNotifications();
    setNotifications(stored);
  }, []);

  const counts = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    const read = notifications.length - unread;
    return {
      all: notifications.length,
      unread,
      read,
    };
  }, [notifications]);

  useEffect(() => {
    onUnreadCountChange?.(counts.unread);
  }, [counts.unread, onUnreadCountChange]);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notifications.filter((item) => {
      if (activeTab === "unread" && item.read) return false;
      if (activeTab === "read" && !item.read) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.childName && item.childName.toLowerCase().includes(q))
      );
    });
  }, [notifications, activeTab, searchQuery, categoryFilter]);

  const hasSearchOrCategoryFilter =
    Boolean(searchQuery.trim()) || categoryFilter !== "all";

  function handleToggleRead(id: string) {
    const target = notifications.find((n) => n.id === id);
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n,
    );
    setNotifications(updated);
    saveStoredParentNotifications(updated);

    if (target) {
      setToast({
        title: target.read ? "Marked as unread" : "Marked as read",
        description: target.title,
      });
    }
  }

  function handleMarkAllRead() {
    if (counts.unread === 0) return;
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredParentNotifications(updated);
    setToast({
      title: "All notifications marked as read",
      description: `${counts.unread} parent alerts cleared.`,
    });
  }

  function handleClearFilters() {
    setSearchQuery("");
    setCategoryFilter("all");
  }

  function handleSaveModalPreferences(nextPrefs: NotificationPreferences) {
    setModalPreferences(nextPrefs);
    setToast({
      title: "Alert preferences updated",
      description:
        "Your parent portal notification settings have been saved (UI preview).",
    });
  }

  return (
    <div className="es-stack">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Parent Notification Center</CardTitle>
            <CardDescription>
              {counts.unread > 0
                ? `${counts.unread} unread alert${counts.unread === 1 ? "" : "s"} across attendance, fees, and school announcements`
                : "All parent notifications have been reviewed"}
            </CardDescription>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="settings" size={14} />}
              onClick={() => setIsSettingsOpen(true)}
            >
              Preferences
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="check-circle" size={14} />}
              disabled={counts.unread === 0}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <NotificationFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
            search={searchQuery}
            onSearchChange={setSearchQuery}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onClearFilters={handleClearFilters}
          />
        </CardBody>
      </Card>

      <NotificationList
        notifications={filteredNotifications}
        activeFilter={activeTab}
        hasSearchOrCategoryFilter={hasSearchOrCategoryFilter}
        onToggleRead={handleToggleRead}
        onClearFilters={handleClearFilters}
      />

      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={modalPreferences}
        onSave={handleSaveModalPreferences}
      />

      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
