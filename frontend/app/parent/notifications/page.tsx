"use client";

import React, { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { ParentNotificationList } from "@/components/parent";
import { PARENT_OVERVIEW_STATS } from "@/config/parent-data";

export default function ParentNotificationsPage() {
  const [unreadCount, setUnreadCount] = useState<number>(
    PARENT_OVERVIEW_STATS.unreadNotifications,
  );

  return (
    <AppLayout
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "Notifications" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Notifications"
          subtitle="Stay updated on attendance alerts, fee reminders and school notices."
          actions={
            <Badge
              variant={unreadCount > 0 ? "primary" : "neutral"}
              dot={unreadCount > 0}
            >
              {unreadCount} Unread
            </Badge>
          }
        />

        <ParentNotificationList onUnreadCountChange={setUnreadCount} />
      </div>
    </AppLayout>
  );
}

