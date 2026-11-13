"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Input,
  Modal,
  Select,
  Toast,
} from "@/components/ui";
import {
  AnnouncementStatusBadge,
  PriorityBadge,
} from "@/components/announcements";
import {
  ANNOUNCEMENT_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  type AnnouncementPriority,
  type AnnouncementStatus,
} from "@/config/announcements-data";
import {
  TEACHER_ANNOUNCEMENTS,
  TEACHER_AUDIENCE_OPTIONS,
  TEACHER_PROFILE,
  getStoredTeacherAnnouncements,
  saveStoredTeacherAnnouncements,
  type TeacherAnnouncementRecord,
  type TeacherAudienceOption,
} from "@/config/teacher-data";

export interface TeacherAnnouncementListProps {
  initialCreateOpen?: boolean;
}

interface FormErrors {
  title?: string;
  shortDescription?: string;
  content?: string;
}

export function TeacherAnnouncementList({
  initialCreateOpen = false,
}: TeacherAnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<
    TeacherAnnouncementRecord[]
  >(TEACHER_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<
    "all" | "School Notice" | "Class Update"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | AnnouncementStatus
  >("all");

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<TeacherAnnouncementRecord | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(initialCreateOpen);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState<TeacherAudienceOption>(
    TEACHER_AUDIENCE_OPTIONS[0],
  );
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");
  const [errors, setErrors] = useState<FormErrors>({});

  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setAnnouncements(getStoredTeacherAnnouncements());
  }, []);

  useEffect(() => {
    if (initialCreateOpen) {
      setIsCreateOpen(true);
    }
  }, [initialCreateOpen]);

  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return announcements.filter((item) => {
      if (scopeFilter !== "all" && item.scope !== scopeFilter) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.createdBy.toLowerCase().includes(q) ||
        item.targetAudience.toLowerCase().includes(q)
      );
    });
  }, [announcements, searchQuery, scopeFilter, statusFilter]);

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    scopeFilter !== "all" ||
    statusFilter !== "all";

  function handleClearFilters() {
    setSearchQuery("");
    setScopeFilter("all");
    setStatusFilter("all");
  }

  function resetForm() {
    setTitle("");
    setShortDescription("");
    setContent("");
    setTargetAudience(TEACHER_AUDIENCE_OPTIONS[0]);
    setPriority("Normal");
    setErrors({});
  }

  function handleOpenCreate() {
    resetForm();
    setIsCreateOpen(true);
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Announcement title is required.";
    }
    if (!shortDescription.trim()) {
      nextErrors.shortDescription = "Short description is required.";
    }
    if (!content.trim()) {
      nextErrors.content = "Announcement message content is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newItem: TeacherAnnouncementRecord = {
      id: `t-ann-${Date.now()}`,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      content: content.trim(),
      status: "Published",
      priority,
      scope: "Class Update",
      targetAudience,
      createdBy: TEACHER_PROFILE.name,
      createdByRole: "Teacher",
      publishedDate: "2026-11-13",
    };

    const updated = [newItem, ...announcements];
    setAnnouncements(updated);
    saveStoredTeacherAnnouncements(updated);
    setIsCreateOpen(false);
    resetForm();
    setToast({
      title: "Class announcement published",
      description: `Shared "${newItem.title}" with ${newItem.targetAudience}.`,
    });
  }

  return (
    <div className="es-stack">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>School Notices &amp; Class Updates</CardTitle>
            <CardDescription>
              Showing {filteredAnnouncements.length} of {announcements.length}{" "}
              announcements visible to your teaching workspace
            </CardDescription>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="plus" size={14} />}
              onClick={handleOpenCreate}
            >
              Create Announcement
            </Button>
          </div>
        </CardHeader>

        {/* Search & Filters */}
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "var(--es-bg-app)",
            borderBottom: "1px solid var(--es-border-subtle)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "10px",
            alignItems: "end",
          }}
        >
          <Input
            aria-label="Search announcements"
            placeholder="Search title, class, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Icon name="search" size={14} />}
          />

          <Select
            aria-label="Filter by scope"
            value={scopeFilter}
            onChange={(e) =>
              setScopeFilter(
                e.target.value as "all" | "School Notice" | "Class Update",
              )
            }
            options={[
              { value: "all", label: "All Scopes" },
              { value: "School Notice", label: "School Notice" },
              { value: "Class Update", label: "Class Update" },
            ]}
          />

          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | AnnouncementStatus)
            }
            options={[
              { value: "all", label: "All Statuses" },
              ...ANNOUNCEMENT_STATUS_OPTIONS.map((st) => ({
                value: st,
                label: st,
              })),
            ]}
          />
        </div>

        <CardBody>
          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              icon="megaphone"
              title="No matching announcements"
              description="Try adjusting your search keywords, scope filter, or status filter."
              action={
                hasFilters ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                gap: "16px",
              }}
            >
              {filteredAnnouncements.map((item) => (
                <Card
                  key={item.id}
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <AnnouncementStatusBadge status={item.status} />
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <Badge
                        variant={
                          item.scope === "Class Update" ? "primary" : "neutral"
                        }
                      >
                        {item.scope}
                      </Badge>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedAnnouncement(item)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "15.5px",
                          fontWeight: 700,
                          color: "var(--es-text-primary)",
                          lineHeight: 1.35,
                        }}
                      >
                        {item.title}
                      </button>
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "13px",
                          color: "var(--es-text-secondary)",
                          lineHeight: 1.55,
                        }}
                      >
                        {item.shortDescription}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Badge variant="neutral">
                        Audience: {item.targetAudience}
                      </Badge>
                      {item.attachmentName && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11.5px",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          <Icon name="file-text" size={12} />
                          <span>{item.attachmentName}</span>
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "8px",
                        borderTop: "1px solid var(--es-border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        fontSize: "12px",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      <span>
                        {item.createdBy} ({item.createdByRole})
                      </span>
                      <span>{item.publishedDate}</span>
                    </div>
                  </CardBody>

                  <CardFooter>
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "var(--es-text-muted)",
                      }}
                    >
                      {item.scope === "School Notice"
                        ? "Read-only school notice"
                        : "Teacher class update"}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<Icon name="arrow-up-right" size={14} />}
                      onClick={() => setSelectedAnnouncement(item)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Announcement Detail Modal */}
      <Modal
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.title || "Announcement Details"}
        description={
          selectedAnnouncement
            ? `${selectedAnnouncement.createdBy} (${selectedAnnouncement.createdByRole}) · ${selectedAnnouncement.publishedDate}`
            : undefined
        }
        footer={
          <Button
            variant="secondary"
            onClick={() => setSelectedAnnouncement(null)}
          >
            Close
          </Button>
        }
      >
        {selectedAnnouncement && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <AnnouncementStatusBadge status={selectedAnnouncement.status} />
              <PriorityBadge priority={selectedAnnouncement.priority} />
              <Badge variant="primary">
                Audience: {selectedAnnouncement.targetAudience}
              </Badge>
              <Badge variant="neutral">{selectedAnnouncement.scope}</Badge>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--es-radius-md)",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
                fontSize: "13px",
                color: "var(--es-text-secondary)",
                fontWeight: 500,
              }}
            >
              {selectedAnnouncement.shortDescription}
            </div>

            <div
              style={{
                fontSize: "13.5px",
                lineHeight: 1.65,
                color: "var(--es-text-primary)",
                whiteSpace: "pre-line",
              }}
            >
              {selectedAnnouncement.content}
            </div>

            {selectedAnnouncement.attachmentName && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 12px",
                  borderRadius: "var(--es-radius-md)",
                  border: "1px solid var(--es-border)",
                  backgroundColor: "var(--es-bg-surface)",
                  fontSize: "12.5px",
                  color: "var(--es-text-secondary)",
                }}
              >
                <Icon name="file-text" size={15} />
                <span>Attachment: {selectedAnnouncement.attachmentName}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Teacher-Scoped Create Announcement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Class Announcement"
        description="Share an update with your assigned classes or parents of assigned classes."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="es-teacher-announcement-form"
              leftIcon={<Icon name="megaphone" size={14} />}
            >
              Publish to Class
            </Button>
          </>
        }
      >
        <form
          id="es-teacher-announcement-form"
          onSubmit={handleCreateSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          noValidate
        >
          <div>
            <Input
              id="es-t-ann-title"
              label="Title *"
              placeholder="e.g. Class 8-A Geometry Worksheet Reminder"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
            />
            {errors.title && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "var(--es-danger)",
                }}
              >
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <Input
              id="es-t-ann-desc"
              label="Description *"
              placeholder="Brief 1-line summary shown in the announcements feed"
              value={shortDescription}
              onChange={(e) => {
                setShortDescription(e.target.value);
                if (errors.shortDescription) {
                  setErrors((prev) => ({
                    ...prev,
                    shortDescription: undefined,
                  }));
                }
              }}
            />
            {errors.shortDescription && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "var(--es-danger)",
                }}
              >
                {errors.shortDescription}
              </p>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <Select
              id="es-t-ann-audience"
              label="Target Audience"
              value={targetAudience}
              onChange={(e) =>
                setTargetAudience(e.target.value as TeacherAudienceOption)
              }
              options={TEACHER_AUDIENCE_OPTIONS.map((aud) => ({
                value: aud,
                label: aud,
              }))}
            />

            <Select
              id="es-t-ann-priority"
              label="Priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as AnnouncementPriority)
              }
              options={PRIORITY_OPTIONS.map((pr) => ({
                value: pr,
                label: pr,
              }))}
            />
          </div>

          <div className="es-field">
            <label className="es-label" htmlFor="es-t-ann-content">
              Content *
            </label>
            <textarea
              id="es-t-ann-content"
              className="es-input"
              rows={4}
              style={{
                height: "auto",
                padding: "10px 12px",
                resize: "vertical",
                lineHeight: 1.5,
              }}
              placeholder="Write the full announcement message for your students or parents..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) {
                  setErrors((prev) => ({ ...prev, content: undefined }));
                }
              }}
            />
            {errors.content && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "var(--es-danger)",
                }}
              >
                {errors.content}
              </p>
            )}
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-bg-app)",
              border: "1px solid var(--es-border-subtle)",
              fontSize: "12px",
              color: "var(--es-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="info" size={14} />
            <span>
              Teacher announcements can only target your assigned classes and
              their parents.
            </span>
          </div>
        </form>
      </Modal>

      {/* Success Toast */}
      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
