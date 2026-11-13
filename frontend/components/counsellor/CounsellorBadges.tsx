"use client";

import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui";
import type {
  CaseStatus,
  ConversationStatus,
  MeetingRequestStatus,
  NoticeStatus,
  ReferralPriority,
  ReferralStatus,
  SessionStatus,
} from "@/config/counsellor-data";

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  const variantMap: Record<ReferralStatus, BadgeVariant> = {
    Submitted: "neutral",
    "Under Review": "warning",
    Accepted: "success",
    Declined: "danger",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

export function ReferralPriorityBadge({
  priority,
}: {
  priority: ReferralPriority;
}) {
  const variantMap: Record<ReferralPriority, BadgeVariant> = {
    Low: "neutral",
    Medium: "primary",
    High: "warning",
    Urgent: "danger",
  };
  return <Badge variant={variantMap[priority]}>{priority}</Badge>;
}

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const variantMap: Record<CaseStatus, BadgeVariant> = {
    Open: "primary",
    "In Progress": "warning",
    "On Hold": "neutral",
    Resolved: "success",
    Closed: "neutral",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const variantMap: Record<SessionStatus, BadgeVariant> = {
    Scheduled: "primary",
    Completed: "success",
    Cancelled: "danger",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

export function NoticeStatusBadge({ status }: { status: NoticeStatus }) {
  const variant: BadgeVariant = status === "Published" ? "success" : "warning";
  return <Badge variant={variant}>{status}</Badge>;
}

export function ConversationStatusBadge({
  status,
}: {
  status: ConversationStatus;
}) {
  const variantMap: Record<ConversationStatus, BadgeVariant> = {
    Open: "primary",
    "Awaiting Reply": "warning",
    Resolved: "success",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

export function MeetingRequestStatusBadge({
  status,
}: {
  status: MeetingRequestStatus;
}) {
  const variantMap: Record<MeetingRequestStatus, BadgeVariant> = {
    Pending: "warning",
    Approved: "success",
    Declined: "danger",
    Cancelled: "neutral",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

