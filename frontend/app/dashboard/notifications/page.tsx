"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import { Badge, Button, Card, CardBody, Icon, Toast } from "@/components/ui";
import {
  NotificationFilters,
  NotificationList,
  NotificationSettingsModal,
  type NotificationReadFilter,
} from "@/components/notifications";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getStoredNotifications,
  INITIAL_NOTIFICATIONS,
  saveStoredNotifications,
  type NotificationPreferences,
  type NotificationRecord,
} from "@/config/notifications-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACTS (Not called in Stage 6 Frontend Mode)
 * ============================================================================
 * - GET   /schools/{school_id}/notifications
 * - PATCH /schools/{school_id}/notifications/{notification_id}/read
 * ============================================================================
 */

export default function NotificationsPage() {
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/admin") ? "/admin" : "/dashboard";

  const [notifications, setNotifications] = useState<NotificationRecord[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [activeTab, setActiveTab] = useState<NotificationReadFilter>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    variant?: "info" | "success" | "warning";
  } | null>(null);

  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notifications.filter((item) => {
      if (activeTab === "unread" && item.read) return false;
      if (activeTab === "read" && !item.read) return false;
      if (category !== "all" && item.category !== category) return false;
      if (query) {
        const text = `${item.title} ${item.description} ${item.category}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  }, [notifications, activeTab, search, category]);

  function handleToggleRead(id: string) {
    let toggledToRead = false;
    let targetTitle = "";
    setNotifications((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) return item;
        toggledToRead = !item.read;
        targetTitle = item.title;
        return { ...item, read: !item.read };
      });
      saveStoredNotifications(next);
      return next;
    });
    setToast({
      title: toggledToRead ? "Marked as read" : "Marked as unread",
      description: targetTitle || "Notification status updated.",
      variant: "info",
    });
  }

  function handleMarkAllAsRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) => {
      const next = prev.map((item) => ({ ...item, read: true }));
      saveStoredNotifications(next);
      return next;
    });
    setToast({
      title: "All notifications marked as read",
      description: `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"} cleared.`,
      variant: "success",
    });
  }

  function handleClearFilters() {
    setSearch("");
    setCategory("all");
  }

  function handleSavePreferences(updated: NotificationPreferences) {
    setPreferences(updated);
    setToast({
      title: "Notification settings saved",
      description:
        "Your alert delivery preferences have been updated for this session.",
      variant: "success",
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: basePath },
        { label: "Notifications" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Notifications"
          subtitle="Stay updated on important school activities and events."
          actions={
            <>
              <Badge
                variant={unreadCount > 0 ? "primary" : "neutral"}
                dot={unreadCount > 0}
              >
                {unreadCount} Unread
              </Badge>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="check-circle" size={15} />}
                disabled={unreadCount === 0}
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </Button>

              <Button
                variant="primary"
                size="md"
                leftIcon={<Icon name="settings" size={15} />}
                onClick={() => setIsSettingsOpen(true)}
              >
                Notification Settings
              </Button>
            </>
          }
        />

        <Card>
          <CardBody>
            <NotificationFilters
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                all: notifications.length,
                unread: unreadCount,
                read: readCount,
              }}
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              onClearFilters={handleClearFilters}
            />
          </CardBody>
        </Card>

        <NotificationList
          notifications={filteredNotifications}
          activeFilter={activeTab}
          hasSearchOrCategoryFilter={Boolean(search.trim()) || category !== "all"}
          onToggleRead={handleToggleRead}
          onClearFilters={handleClearFilters}
        />
      </div>

      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSave={handleSavePreferences}
      />

      {toast && (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </AppLayout>
  );
}
