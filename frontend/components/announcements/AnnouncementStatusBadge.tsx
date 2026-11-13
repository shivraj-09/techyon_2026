import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui";
import type { AnnouncementStatus } from "@/config/announcements-data";

export interface AnnouncementStatusBadgeProps {
  status: AnnouncementStatus;
  className?: string;
}

const STATUS_VARIANT_MAP: Record<AnnouncementStatus, BadgeVariant> = {
  Published: "success",
  Scheduled: "primary",
  Draft: "neutral",
};

export function AnnouncementStatusBadge({
  status,
  className = "",
}: AnnouncementStatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANT_MAP[status]}
      dot
      className={className}
    >
      {status}
    </Badge>
  );
}

