"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Icon,
} from "@/components/ui";
import type { AnnouncementRecord } from "@/config/announcements-data";
import { AnnouncementStatusBadge } from "./AnnouncementStatusBadge";
import { PriorityBadge } from "./PriorityBadge";

export interface AnnouncementCardProps {
  announcement: AnnouncementRecord;
  onView?: (announcement: AnnouncementRecord) => void;
  onEdit?: (announcement: AnnouncementRecord) => void;
  onDelete?: (announcement: AnnouncementRecord) => void;
  viewHref?: string;
}

export function AnnouncementCard({
  announcement,
  onView,
  onEdit,
  onDelete,
  viewHref,
}: AnnouncementCardProps) {
  const dateLabel =
    announcement.status === "Scheduled" && announcement.scheduledDate
      ? `Scheduled: ${announcement.scheduledDate}${
          announcement.scheduledTime ? ` at ${announcement.scheduledTime}` : ""
        }`
      : announcement.status === "Draft"
        ? `Saved: ${announcement.publishedDate}`
        : `Published: ${announcement.publishedDate}`;

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <CardBody
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flex: 1,
        }}
      >
        {/* Top Status & Priority Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <AnnouncementStatusBadge status={announcement.status} />
            <PriorityBadge priority={announcement.priority} />
          </div>

          {announcement.attachmentName && (
            <span
              title={announcement.attachmentName}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "var(--es-text-muted)",
              }}
            >
              <Icon name="file-text" size={13} />
              <span>Attachment</span>
            </span>
          )}
        </div>

        {/* Title & Short Description */}
        <div>
          {viewHref ? (
            <Link
              href={viewHref}
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                textDecoration: "none",
                lineHeight: 1.35,
                display: "inline-block",
              }}
            >
              {announcement.title}
            </Link>
          ) : (
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                lineHeight: 1.35,
              }}
            >
              {announcement.title}
            </h3>
          )}
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13.5px",
              color: "var(--es-text-secondary)",
              lineHeight: 1.55,
            }}
          >
            {announcement.shortDescription}
          </p>
        </div>

        {/* Target Audience Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {announcement.audiences.map((audience) => {
            const label =
              audience === "Specific Class" && announcement.specificClass
                ? `Class: ${announcement.specificClass}`
                : audience;
            return (
              <Badge key={audience} variant="neutral">
                {label}
              </Badge>
            );
          })}
        </div>

        {/* Author & Date Meta */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "8px",
            borderTop: "1px solid var(--es-border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            fontSize: "12px",
            color: "var(--es-text-muted)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Icon name="users" size={13} />
            <span>
              {announcement.createdBy} ({announcement.createdByRole})
            </span>
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Icon name="calendar" size={13} />
            <span>{dateLabel}</span>
          </span>
        </div>
      </CardBody>

      <CardFooter
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "8px",
        }}
      >
        {viewHref ? (
          <Link href={viewHref} style={{ textDecoration: "none" }}>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<Icon name="arrow-up-right" size={14} />}
            >
              View
            </Button>
          </Link>
        ) : (
          onView && (
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<Icon name="arrow-up-right" size={14} />}
              onClick={() => onView(announcement)}
            >
              View
            </Button>
          )
        )}

        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(announcement)}
          >
            Edit
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(announcement)}
            style={{ color: "var(--es-danger)" }}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

