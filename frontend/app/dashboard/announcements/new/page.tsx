"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardBody,
  Icon,
  Modal,
  Toast,
} from "@/components/ui";
import { AnnouncementForm } from "@/components/announcements";
import {
  getStoredAnnouncements,
  saveStoredAnnouncements,
  type AnnouncementRecord,
} from "@/config/announcements-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACT (Not called in Stage 6 Frontend Mode)
 * ============================================================================
 * - POST /schools/{school_id}/announcements
 * ============================================================================
 */

export default function CreateAnnouncementPage() {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = pathname?.startsWith("/admin") ? "/admin" : "/dashboard";

  const [savedAnnouncement, setSavedAnnouncement] =
    useState<AnnouncementRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    variant?: "info" | "success" | "warning";
  } | null>(null);

  function handleSave(newAnnouncement: AnnouncementRecord) {
    const existing = getStoredAnnouncements();
    const updated = [newAnnouncement, ...existing];
    saveStoredAnnouncements(updated);
    setSavedAnnouncement(newAnnouncement);
    setToast({
      title:
        newAnnouncement.status === "Published"
          ? "Announcement published"
          : newAnnouncement.status === "Scheduled"
            ? "Announcement scheduled"
            : "Announcement saved as draft",
      description: `"${newAnnouncement.title}" has been saved to school announcements.`,
      variant: "success",
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Admin", href: basePath },
        { label: "Announcements", href: `${basePath}/announcements` },
        { label: "Create" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Create Announcement"
          subtitle="Compose a school-wide notice, choose target audiences, and publish immediately, schedule, or save as a draft."
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

        <Card>
          <CardBody>
            <AnnouncementForm
              onSubmit={handleSave}
              onCancel={() => router.push(`${basePath}/announcements`)}
            />
          </CardBody>
        </Card>
      </div>

      {/* Post-save Navigation Modal */}
      <Modal
        isOpen={savedAnnouncement !== null}
        onClose={() => setSavedAnnouncement(null)}
        title={
          savedAnnouncement?.status === "Published"
            ? "Announcement Published"
            : savedAnnouncement?.status === "Scheduled"
              ? "Announcement Scheduled"
              : "Draft Saved"
        }
        description="Your announcement has been saved and added to the communications directory."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => router.push(`${basePath}/announcements`)}
            >
              Return to Announcements
            </Button>
            {savedAnnouncement && (
              <Button
                variant="primary"
                rightIcon={<Icon name="arrow-up-right" size={14} />}
                onClick={() =>
                  router.push(
                    `${basePath}/announcements/${savedAnnouncement.id}`,
                  )
                }
              >
                View Announcement
              </Button>
            )}
          </>
        }
      >
        {savedAnnouncement && (
          <div
            style={{
              fontSize: "13.5px",
              color: "var(--es-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>{savedAnnouncement.title}</strong> is now marked as{" "}
              <strong>{savedAnnouncement.status}</strong> with{" "}
              <strong>{savedAnnouncement.priority}</strong> priority.
            </p>
            <p style={{ margin: 0, color: "var(--es-text-muted)" }}>
              Target audience:{" "}
              <strong>{savedAnnouncement.audiences.join(", ")}</strong>
              {savedAnnouncement.specificClass
                ? ` (${savedAnnouncement.specificClass})`
                : ""}
              .
            </p>
          </div>
        )}
      </Modal>

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
