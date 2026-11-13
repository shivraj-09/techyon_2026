"use client";

import React from "react";
import { Button, Icon, Input, Select, Tabs } from "@/components/ui";
import { NOTIFICATION_CATEGORIES } from "@/config/notifications-data";

export type NotificationReadFilter = "all" | "unread" | "read";

export interface NotificationFiltersProps {
  activeTab: NotificationReadFilter;
  onTabChange: (tab: NotificationReadFilter) => void;
  counts: {
    all: number;
    unread: number;
    read: number;
  };
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onClearFilters?: () => void;
}

export function NotificationFilters({
  activeTab,
  onTabChange,
  counts,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onClearFilters,
}: NotificationFiltersProps) {
  const hasFilter = Boolean(search.trim()) || category !== "all";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Tabs
          tabs={[
            { id: "all", label: "All", count: counts.all },
            { id: "unread", label: "Unread", count: counts.unread },
            { id: "read", label: "Read", count: counts.read },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => onTabChange(tabId as NotificationReadFilter)}
        />

        {hasFilter && onClearFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <Input
          aria-label="Search notifications"
          placeholder="Search notifications by title or details..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Icon name="search" size={14} />}
        />

        <Select
          aria-label="Filter by notification category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { value: "all", label: "All Categories" },
            ...NOTIFICATION_CATEGORIES.map((cat) => ({
              value: cat,
              label: cat,
            })),
          ]}
        />
      </div>
    </div>
  );
}

