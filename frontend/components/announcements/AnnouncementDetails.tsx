"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Icon,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import type { AnnouncementRecord } from "@/config/announcements-data";
import { AnnouncementStatusBadge } from "./AnnouncementStatusBadge";
import { PriorityBadge } from "./PriorityBadge";

export interface AnnouncementDetailsProps {
  announcement: AnnouncementRecord;
  onEdit?: (announcement: AnnouncementRecord) => void;
  onDelete?: (announcement: AnnouncementRecord) => void;
  onPublishNow?: (announcement: AnnouncementRecord) => void;
  onCancelSchedule?: (announcement: AnnouncementRecord) => void;
  backHref?: string;
}

export function AnnouncementDetails({
  announcement,
  onEdit,
  onDelete,
  onPublishNow,
  onCancelSchedule,
  backHref,
}: AnnouncementDetailsProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCancelScheduleConfirmOpen, setIsCancelScheduleConfirmOpen] =
    useState(false);

  const scheduleText =
    announcement.status === "Scheduled" && announcement.scheduledDate
      ? `${announcement.scheduledDate}${
          announcement.scheduledTime ? ` at ${announcement.scheduledTime}` : ""
        }`
      : announcement.publishedDate;

  return (
    <>
      <Card>
        <CardHeader
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AnnouncementStatusBadge status={announcement.status} />
              <PriorityBadge priority={announcement.priority} />
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                lineHeight: 1.3,
              }}
            >
              {announcement.title}
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "var(--es-text-secondary)",
              }}
            >
              {announcement.shortDescription}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {announcement.status === "Draft" && onPublishNow && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="check-circle" size={14} />}
                onClick={() => onPublishNow(announcement)}
              >
                Publish Now
              </Button>
            )}

            {announcement.status === "Scheduled" && onCancelSchedule && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name="clock" size={14} />}
                onClick={() => setIsCancelScheduleConfirmOpen(true)}
              >
                Cancel Schedule
              </Button>
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
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Metadata strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              padding: "14px",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-bg-app)",
              border: "1px solid var(--es-border-subtle)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--es-text-muted)",
                }}
              >
                Author
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                  marginTop: "3px",
                }}
              >
                {announcement.createdBy}
              </div>
              <div style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                {announcement.createdByRole}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--es-text-muted)",
                }}
              >
                {announcement.status === "Scheduled"
                  ? "Scheduled Release"
                  : announcement.status === "Draft"
                    ? "Last Saved"
                    : "Published Date"}
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                  marginTop: "3px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon name="calendar" size={14} />
                <span>{scheduleText}</span>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--es-text-muted)",
                }}
              >
                Target Audience
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: "5px",
                }}
              >
                {announcement.audiences.map((aud) => (
                  <Badge key={aud} variant="primary">
                    {aud === "Specific Class" && announcement.specificClass
                      ? `Class: ${announcement.specificClass}`
                      : aud}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Full Content */}
          <div
            style={{
              fontSize: "14.5px",
              lineHeight: 1.7,
              color: "var(--es-text-primary)",
              whiteSpace: "pre-line",
            }}
          >
            {announcement.content}
          </div>

          {/* Attachment */}
          {announcement.attachmentName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "var(--es-radius-md)",
                border: "1px solid var(--es-border-default)",
                backgroundColor: "var(--es-bg-app)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "var(--es-radius-md)",
                    backgroundColor: "var(--es-primary-subtle)",
                    color: "var(--es-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="file-text" size={17} />
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--es-text-primary)",
                    }}
                  >
                    {announcement.attachmentName}
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
                  >
                    Attached circular document
                  </div>
                </div>
              </div>
              <Badge variant="neutral">Attached</Badge>
            </div>
          )}
        </CardBody>

        {backHref && (
          <CardFooter>
            <Link href={backHref} style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="sm">
                Back to Announcements
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>

      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => onDelete?.(announcement)}
        title="Delete Announcement?"
        description={`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`}
        confirmLabel="Delete Announcement"
        cancelLabel="Keep"
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={isCancelScheduleConfirmOpen}
        onClose={() => setIsCancelScheduleConfirmOpen(false)}
        onConfirm={() => onCancelSchedule?.(announcement)}
        title="Cancel Scheduled Release?"
        description={`Canceling the schedule for "${announcement.title}" will revert this announcement back to Draft status.`}
        confirmLabel="Revert to Draft"
        cancelLabel="Keep Schedule"
        variant="primary"
      />
    </>
  );
}

