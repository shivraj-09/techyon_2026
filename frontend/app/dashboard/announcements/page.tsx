"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Icon,
  Input,
  Modal,
  Select,
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  AnnouncementForm,
  AnnouncementList,
  AnnouncementStats,
} from "@/components/announcements";
import {
  ANNOUNCEMENT_STATUS_OPTIONS,
  AUDIENCE_OPTIONS,
  computeAnnouncementStats,
  getStoredAnnouncements,
  INITIAL_ANNOUNCEMENTS,
  saveStoredAnnouncements,
  type AnnouncementRecord,
} from "@/config/announcements-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACTS (Not called in Stage 6 Frontend Mode)
 * ============================================================================
 * - GET  /schools/{school_id}/announcements
 * - POST /schools/{school_id}/announcements
 * ============================================================================
 */

export default function AnnouncementsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = pathname?.startsWith("/admin") ? "/admin" : "/dashboard";

  const [announcements, setAnnouncements] =
    useState<AnnouncementRecord[]>(INITIAL_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementRecord | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<AnnouncementRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    variant?: "info" | "success" | "warning";
  } | null>(null);

  useEffect(() => {
    setAnnouncements(getStoredAnnouncements());
  }, []);

  const stats = computeAnnouncementStats(announcements);
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    audienceFilter !== "all" ||
    statusFilter !== "all";

  function handleClearFilters() {
    setSearchQuery("");
    setAudienceFilter("all");
    setStatusFilter("all");
  }

  function handleSaveAnnouncement(
    updated: AnnouncementRecord,
    isEdit: boolean,
  ) {
    setAnnouncements((prev) => {
      const next = isEdit
        ? prev.map((item) => (item.id === updated.id ? updated : item))
        : [updated, ...prev];
      saveStoredAnnouncements(next);
      return next;
    });
    setEditingAnnouncement(null);
    setToast({
      title:
        updated.status === "Published"
          ? isEdit
            ? "Announcement updated & published"
            : "Announcement published"
          : updated.status === "Scheduled"
            ? "Announcement scheduled"
            : "Draft saved",
      description: `"${updated.title}" has been saved (${updated.status}).`,
      variant: "success",
    });
  }

  function handleConfirmDelete() {
    if (!deletingAnnouncement) return;
    const removedTitle = deletingAnnouncement.title;
    setAnnouncements((prev) => {
      const next = prev.filter((item) => item.id !== deletingAnnouncement.id);
      saveStoredAnnouncements(next);
      return next;
    });
    setDeletingAnnouncement(null);
    setToast({
      title: "Announcement deleted",
      description: `"${removedTitle}" has been removed from school communications.`,
      variant: "info",
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: basePath },
        { label: "Announcements" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Announcements"
          subtitle="Create and manage school-wide communications."
          actions={
            <>
              <div style={{ minWidth: "220px" }}>
                <Input
                  aria-label="Search announcements"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Icon name="search" size={14} />}
                />
              </div>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="filter" size={14} />}
                onClick={() => setShowFilters((prev) => !prev)}
                aria-expanded={showFilters}
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </Button>

              <Link
                href={`${basePath}/announcements/new`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Icon name="plus" size={15} />}
                >
                  Create Announcement
                </Button>
              </Link>
            </>
          }
        />

        {/* Summary KPI Strip */}
        <AnnouncementStats stats={stats} />

        {/* Collapsible Audience & Status Filters */}
        {showFilters && (
          <Card>
            <CardBody
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  flex: 1,
                }}
              >
                <Select
                  id="announcements-audience-filter"
                  label="Audience"
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Audiences" },
                    ...AUDIENCE_OPTIONS.map((aud) => ({
                      value: aud,
                      label: aud,
                    })),
                  ]}
                />

                <Select
                  id="announcements-status-filter"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Statuses" },
                    ...ANNOUNCEMENT_STATUS_OPTIONS.map((status) => ({
                      value: status,
                      label: status,
                    })),
                  ]}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {hasActiveFilters && (
                  <>
                    <Badge variant="primary">Filtered</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Announcements List */}
        <AnnouncementList
          announcements={announcements}
          externalSearch={searchQuery}
          externalAudience={audienceFilter}
          externalStatus={statusFilter}
          showFilters={false}
          getViewHref={(item) => `${basePath}/announcements/${item.id}`}
          onView={(item) => router.push(`${basePath}/announcements/${item.id}`)}
          onEdit={(item) => setEditingAnnouncement(item)}
          onDelete={(item) => setDeletingAnnouncement(item)}
        />
      </div>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={editingAnnouncement !== null}
        onClose={() => setEditingAnnouncement(null)}
        title="Edit Announcement"
        description="Update notice content, target audiences, priority, or publication schedule."
      >
        {editingAnnouncement && (
          <AnnouncementForm
            initialAnnouncement={editingAnnouncement}
            onSubmit={handleSaveAnnouncement}
            onCancel={() => setEditingAnnouncement(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingAnnouncement !== null}
        onClose={() => setDeletingAnnouncement(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement?"
        description={
          deletingAnnouncement
            ? `Are you sure you want to delete "${deletingAnnouncement.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Announcement"
        cancelLabel="Cancel"
        variant="danger"
      />

      {toast && (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </AppLayout>
  );
}
