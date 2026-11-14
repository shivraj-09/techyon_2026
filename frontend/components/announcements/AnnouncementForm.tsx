"use client";

import React, { useEffect, useState } from "react";
import { Button, Icon, Input, Select } from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  PRIORITY_OPTIONS,
  type AnnouncementPriority,
  type AnnouncementRecord,
  type AnnouncementStatus,
  type AudienceTarget,
} from "@/config/announcements-data";
import { AudienceSelector } from "./AudienceSelector";

export type AnnouncementPublishMode = "now" | "draft" | "schedule";

export interface AnnouncementFormProps {
  initialAnnouncement?: AnnouncementRecord | null;
  onSubmit: (announcement: AnnouncementRecord, isEdit: boolean) => void;
  onCancel: () => void;
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AnnouncementForm({
  initialAnnouncement,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) {
  const isEdit = Boolean(initialAnnouncement);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [audiences, setAudiences] = useState<AudienceTarget[]>([]);
  const [specificClass, setSpecificClass] = useState("");
  const [publishMode, setPublishMode] =
    useState<AnnouncementPublishMode>("now");
  const [scheduledDate, setScheduledDate] = useState("2026-11-25");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  useEffect(() => {
    if (initialAnnouncement) {
      setTitle(initialAnnouncement.title);
      setShortDescription(initialAnnouncement.shortDescription);
      setContent(initialAnnouncement.content);
      setAudiences(initialAnnouncement.audiences);
      setSpecificClass(initialAnnouncement.specificClass || "");
      setPriority(initialAnnouncement.priority);
      setAttachmentName(initialAnnouncement.attachmentName || "");

      if (initialAnnouncement.status === "Scheduled") {
        setPublishMode("schedule");
        setScheduledDate(
          initialAnnouncement.scheduledDate || getTodayDateString(),
        );
        setScheduledTime(initialAnnouncement.scheduledTime || "09:00");
      } else if (initialAnnouncement.status === "Draft") {
        setPublishMode("draft");
      } else {
        setPublishMode("now");
      }
      setErrors({});
    } else {
      setTitle("");
      setShortDescription("");
      setContent("");
      setAudiences(["Entire School"]);
      setSpecificClass("");
      setPublishMode("now");
      setScheduledDate("2026-11-25");
      setScheduledTime("09:00");
      setPriority("Normal");
      setAttachmentName("");
      setErrors({});
    }
  }, [initialAnnouncement]);

  function validate(targetMode: AnnouncementPublishMode): boolean {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = "Announcement title is required.";
    }
    if (!shortDescription.trim()) {
      nextErrors.shortDescription = "Short description is required.";
    }
    if (!content.trim()) {
      nextErrors.content = "Full announcement content is required.";
    }
    if (audiences.length === 0) {
      nextErrors.audiences = "Please select at least one target audience.";
    }
    if (audiences.includes("Specific Class") && !specificClass.trim()) {
      nextErrors.specificClass = "Please choose a specific class.";
    }
    if (targetMode === "schedule") {
      if (!scheduledDate) {
        nextErrors.scheduledDate = "Scheduled date is required.";
      }
      if (!scheduledTime) {
        nextErrors.scheduledTime = "Scheduled time is required.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildRecord(targetMode: AnnouncementPublishMode): AnnouncementRecord {
    const status: AnnouncementStatus =
      targetMode === "now"
        ? "Published"
        : targetMode === "schedule"
          ? "Scheduled"
          : "Draft";

    const today = getTodayDateString();

    return {
      id: initialAnnouncement?.id || `ann-${Date.now()}`,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      content: content.trim(),
      status,
      priority,
      audiences,
      specificClass: audiences.includes("Specific Class")
        ? specificClass
        : undefined,
      createdBy: initialAnnouncement?.createdBy || "Arjun Mehta",
      createdByRole: initialAnnouncement?.createdByRole || "School Admin",
      publishedDate:
        targetMode === "schedule"
          ? scheduledDate
          : initialAnnouncement?.publishedDate || today,
      scheduledDate: targetMode === "schedule" ? scheduledDate : undefined,
      scheduledTime: targetMode === "schedule" ? scheduledTime : undefined,
      attachmentName: attachmentName || undefined,
    };
  }

  function handleSaveDraft() {
    if (!validate("draft")) return;
    onSubmit(buildRecord("draft"), isEdit);
  }

  function handlePrimarySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (publishMode === "draft") {
      handleSaveDraft();
      return;
    }
    if (!validate(publishMode)) return;

    if (publishMode === "now") {
      setIsPublishConfirmOpen(true);
      return;
    }

    onSubmit(buildRecord("schedule"), isEdit);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  }

  const audienceSummaryText = audiences
    .map((aud) =>
      aud === "Specific Class" && specificClass
        ? `${aud} (${specificClass})`
        : aud,
    )
    .join(", ");

  return (
    <>
      <form
        onSubmit={handlePrimarySubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Section 1: Basic Info */}
        <section
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--es-primary)",
            }}
          >
            Basic Information
          </div>

          <div>
            <Input
              id="announcement-title"
              label="Title *"
              placeholder="e.g., Annual Sports Day Circular"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "var(--es-danger)",
                  fontWeight: 500,
                }}
              >
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <Input
              id="announcement-short-description"
              label="Short Description *"
              placeholder="Brief 1-2 line summary shown in announcement cards"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
            {errors.shortDescription && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "var(--es-danger)",
                  fontWeight: 500,
                }}
              >
                {errors.shortDescription}
              </p>
            )}
          </div>

          <div className="es-field" style={{ margin: 0 }}>
            <label className="es-label" htmlFor="announcement-content">
              Full Content <span style={{ color: "var(--es-danger)" }}>*</span>
            </label>
            <textarea
              id="announcement-content"
              rows={6}
              className="es-input"
              placeholder="Write the full circular or notice details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                minHeight: "130px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.55,
              }}
            />
            {errors.content && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "var(--es-danger)",
                  fontWeight: 500,
                }}
              >
                {errors.content}
              </p>
            )}
          </div>
        </section>

        {/* Section 2: Target Audience */}
        <section
          style={{
            paddingTop: "14px",
            borderTop: "1px solid var(--es-border-subtle)",
          }}
        >
          <AudienceSelector
            selectedAudiences={audiences}
            onChangeAudiences={setAudiences}
            specificClass={specificClass}
            onChangeSpecificClass={setSpecificClass}
            error={errors.audiences}
            specificClassError={errors.specificClass}
          />
        </section>

        {/* Section 3: Publishing Options */}
        <section
          style={{
            paddingTop: "14px",
            borderTop: "1px solid var(--es-border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--es-primary)",
            }}
          >
            Publishing Options
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "10px",
            }}
          >
            {(
              [
                {
                  id: "now",
                  title: "Publish Now",
                  desc: "Go live immediately",
                  icon: "check-circle",
                },
                {
                  id: "draft",
                  title: "Save as Draft",
                  desc: "Review before sending",
                  icon: "file-text",
                },
                {
                  id: "schedule",
                  title: "Schedule for Later",
                  desc: "Pick release date & time",
                  icon: "clock",
                },
              ] as const
            ).map((opt) => {
              const active = publishMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPublishMode(opt.id)}
                  aria-pressed={active}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px",
                    textAlign: "left",
                    borderRadius: "var(--es-radius-md)",
                    cursor: "pointer",
                    border: `1px solid ${
                      active
                        ? "var(--es-primary)"
                        : "var(--es-border-default)"
                    }`,
                    backgroundColor: active
                      ? "var(--es-primary-subtle)"
                      : "var(--es-bg-surface)",
                  }}
                >
                  <span
                    style={{
                      color: active
                        ? "var(--es-primary)"
                        : "var(--es-text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    <Icon name={opt.icon} size={16} />
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "var(--es-text-primary)",
                      }}
                    >
                      {opt.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--es-text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {publishMode === "schedule" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                padding: "12px",
                backgroundColor: "var(--es-bg-app)",
                borderRadius: "var(--es-radius-md)",
                border: "1px solid var(--es-border-subtle)",
              }}
            >
              <div>
                <Input
                  id="announcement-schedule-date"
                  type="date"
                  label="Scheduled Date *"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                {errors.scheduledDate && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "var(--es-danger)",
                      fontWeight: 500,
                    }}
                  >
                    {errors.scheduledDate}
                  </p>
                )}
              </div>

              <div>
                <Input
                  id="announcement-schedule-time"
                  type="time"
                  label="Scheduled Time *"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
                {errors.scheduledTime && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "var(--es-danger)",
                      fontWeight: 500,
                    }}
                  >
                    {errors.scheduledTime}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Optional Fields (Priority & Attachment) */}
        <section
          style={{
            paddingTop: "14px",
            borderTop: "1px solid var(--es-border-subtle)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            alignItems: "start",
          }}
        >
          <Select
            id="announcement-priority"
            label="Priority"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as AnnouncementPriority)
            }
            options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))}
          />

          <div className="es-field" style={{ margin: 0 }}>
            <span className="es-label">Attachment (Optional)</span>
            <div
              style={{
                border: "1px dashed var(--es-border-default)",
                borderRadius: "var(--es-radius-md)",
                padding: "10px 12px",
                backgroundColor: "var(--es-bg-app)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              {attachmentName ? (
                <>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "var(--es-text-primary)",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon name="file-text" size={15} />
                    <span>{attachmentName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachmentName("")}
                    aria-label="Remove attachment"
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "var(--es-danger)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon name="x" size={15} />
                  </button>
                </>
              ) : (
                <label
                  htmlFor="announcement-attachment"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "var(--es-primary)",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <Icon name="plus" size={15} />
                  <span>Attach PDF, DOC, or image circular</span>
                  <input
                    id="announcement-attachment"
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: "10px",
            paddingTop: "14px",
            borderTop: "1px solid var(--es-border-subtle)",
          }}
        >
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          {publishMode !== "draft" && (
            <Button variant="secondary" onClick={handleSaveDraft}>
              Save Draft
            </Button>
          )}
          <Button type="submit" variant="primary">
            {publishMode === "now"
              ? isEdit
                ? "Publish Announcement"
                : "Publish Announcement"
              : publishMode === "schedule"
                ? "Schedule Announcement"
                : "Save Draft"}
          </Button>
        </div>
      </form>

      <ConfirmationDialog
        isOpen={isPublishConfirmOpen}
        onClose={() => setIsPublishConfirmOpen(false)}
        onConfirm={() => onSubmit(buildRecord("now"), isEdit)}
        title="Publish Announcement?"
        description={`This announcement "${title.trim() || "Untitled"}" will be published immediately to: ${audienceSummaryText || "selected audiences"}.`}
        confirmLabel="Publish Now"
        cancelLabel="Review"
        variant="primary"
      />
    </>
  );
}

