"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Modal,
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  AnnouncementDetails,
  AnnouncementForm,
} from "@/components/announcements";
import {
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

export default function AnnouncementDetailPage() {
  const params = useParams<{ announcementId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const basePath = pathname?.startsWith("/admin") ? "/admin" : "/dashboard";
  const announcementId = params?.announcementId || "";

  const [announcements, setAnnouncements] =
    useState<AnnouncementRecord[]>(INITIAL_ANNOUNCEMENTS);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [publishCandidate, setPublishCandidate] =
    useState<AnnouncementRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    variant?: "info" | "success" | "warning";
  } | null>(null);

  useEffect(() => {
    setAnnouncements(getStoredAnnouncements());
  }, []);

  const announcement = announcements.find(
    (item) => item.id === announcementId,
  );

  function handleSaveEdit(updated: AnnouncementRecord) {
    setAnnouncements((prev) => {
      const next = prev.map((item) =>
        item.id === updated.id ? updated : item,
      );
      saveStoredAnnouncements(next);
      return next;
    });
    setIsEditOpen(false);
    setToast({
      title: "Announcement updated",
      description: `"${updated.title}" has been updated (${updated.status}).`,
      variant: "success",
    });
  }

  function handleConfirmPublishDraft() {
    if (!publishCandidate) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated: AnnouncementRecord = {
      ...publishCandidate,
      status: "Published",
      publishedDate: today,
      scheduledDate: undefined,
      scheduledTime: undefined,
    };
    setAnnouncements((prev) => {
      const next = prev.map((item) =>
        item.id === updated.id ? updated : item,
      );
      saveStoredAnnouncements(next);
      return next;
    });
    setPublishCandidate(null);
    setToast({
      title: "Draft published",
      description: `"${updated.title}" is now live to its target audiences.`,
      variant: "success",
    });
  }

  function handleCancelSchedule(target: AnnouncementRecord) {
    const updated: AnnouncementRecord = {
      ...target,
      status: "Draft",
      scheduledDate: undefined,
      scheduledTime: undefined,
    };
    setAnnouncements((prev) => {
      const next = prev.map((item) =>
        item.id === updated.id ? updated : item,
      );
      saveStoredAnnouncements(next);
      return next;
    });
    setToast({
      title: "Schedule cancelled",
      description: `"${updated.title}" has been reverted to Draft status.`,
      variant: "info",
    });
  }

  function handleDelete(target: AnnouncementRecord) {
    setAnnouncements((prev) => {
      const next = prev.filter((item) => item.id !== target.id);
      saveStoredAnnouncements(next);
      return next;
    });
    setToast({
      title: "Announcement deleted",
      description: `"${target.title}" has been deleted.`,
      variant: "info",
    });
    router.push(`${basePath}/announcements`);
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Admin", href: basePath },
        { label: "Announcements", href: `${basePath}/announcements` },
        { label: announcement ? announcement.title : "Announcement Details" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title={announcement ? announcement.title : "Announcement Details"}
          subtitle={
            announcement
              ? "Review announcement delivery details, target audience, and lifecycle controls."
              : "The requested announcement could not be located."
          }
          actions={
            <Link
              href={`${basePath}/announcements`}
              style={{ textDecoration: "none" }}
            >
              <Button variant="secondary" size="md">
                Back to Announcements
              </Button>
            </Link>
          }
        />

        {!announcement ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="megaphone"
                title="Announcement not found"
                description="This announcement may have been deleted or the URL identifier is invalid."
                action={
                  <Link
                    href={`${basePath}/announcements`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="primary">Return to Announcements</Button>
                  </Link>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <AnnouncementDetails
            announcement={announcement}
            backHref={`${basePath}/announcements`}
            onEdit={() => setIsEditOpen(true)}
            onDelete={handleDelete}
            onPublishNow={(item) => setPublishCandidate(item)}
            onCancelSchedule={handleCancelSchedule}
          />
        )}
      </div>

      {/* Inline Edit Modal */}
      <Modal
        isOpen={isEditOpen && Boolean(announcement)}
        onClose={() => setIsEditOpen(false)}
        title="Edit Announcement"
        description="Modify announcement content, audience, priority, or publication schedule."
      >
        {announcement && (
          <AnnouncementForm
            initialAnnouncement={announcement}
            onSubmit={handleSaveEdit}
            onCancel={() => setIsEditOpen(false)}
          />
        )}
      </Modal>

      {/* Publish Draft Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={publishCandidate !== null}
        onClose={() => setPublishCandidate(null)}
        onConfirm={handleConfirmPublishDraft}
        title="Publish Draft Announcement?"
        description={
          publishCandidate
            ? `Publish "${publishCandidate.title}" immediately to ${publishCandidate.audiences.join(", ")}?`
            : ""
        }
        confirmLabel="Publish Now"
        cancelLabel="Keep as Draft"
        variant="primary"
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
