"use client";

import React from "react";
import { Button, Card, CardBody, EmptyState } from "@/components/ui";
import type { NotificationRecord } from "@/config/notifications-data";
import type { NotificationReadFilter } from "./NotificationFilters";
import { NotificationItem } from "./NotificationItem";

export interface NotificationListProps {
  notifications: NotificationRecord[];
  activeFilter: NotificationReadFilter;
  hasSearchOrCategoryFilter?: boolean;
  onToggleRead: (id: string) => void;
  onClearFilters?: () => void;
}

export function NotificationList({
  notifications,
  activeFilter,
  hasSearchOrCategoryFilter = false,
  onToggleRead,
  onClearFilters,
}: NotificationListProps) {
  if (notifications.length === 0) {
    const emptyConfig = hasSearchOrCategoryFilter
      ? {
          icon: "search" as const,
          title: "No matching notifications",
          description:
            "Try clearing or adjusting your search query and category filter.",
        }
      : activeFilter === "unread"
        ? {
            icon: "check-circle" as const,
            title: "You're all caught up!",
            description:
              "All school notifications have been reviewed and marked as read.",
          }
        : activeFilter === "read"
          ? {
              icon: "inbox" as const,
              title: "No read notifications yet",
              description:
                "Notifications that you mark as read will be archived here.",
            }
          : {
              icon: "bell" as const,
              title: "No notifications",
              description:
                "Important school activity alerts and system updates will appear here.",
            };

    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={emptyConfig.icon}
            title={emptyConfig.title}
            description={emptyConfig.description}
            action={
              hasSearchOrCategoryFilter && onClearFilters ? (
                <Button variant="secondary" onClick={onClearFilters}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody flush>
        <div role="list" aria-label="Notifications feed">
          {notifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onToggleRead={onToggleRead}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

