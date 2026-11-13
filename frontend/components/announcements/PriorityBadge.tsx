import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui";
import type { AnnouncementPriority } from "@/config/announcements-data";

export interface PriorityBadgeProps {
  priority: AnnouncementPriority;
  className?: string;
}

const PRIORITY_VARIANT_MAP: Record<AnnouncementPriority, BadgeVariant> = {
  Normal: "neutral",
  Important: "warning",
  Urgent: "danger",
};

export function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  return (
    <Badge
      variant={PRIORITY_VARIANT_MAP[priority]}
      className={className}
    >
      {priority}
    </Badge>
  );
}

