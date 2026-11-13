"use client";

import React, { useMemo, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  Input,
  Modal,
  Select,
  Toast,
} from "@/components/ui";
import { NoticeFormModal, NoticeStatusBadge } from "@/components/counsellor";
import {
  NOTICE_AUDIENCES,
  NOTICE_CATEGORIES,
  type CounsellingNoticeRecord,
  type NoticeAudience,
  type NoticeStatus,
} from "@/config/counsellor-data";
import {
  saveCounsellingNotice,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function CounsellorNoticesPage() {
  const { notices } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | NoticeStatus>("ALL");
  const [audienceFilter, setAudienceFilter] = useState<"ALL" | NoticeAudience>(
    "ALL",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] =
    useState<CounsellingNoticeRecord | null>(null);
  const [viewingNotice, setViewingNotice] =
    useState<CounsellingNoticeRecord | null>(null);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices.filter((n) => {
      if (statusFilter !== "ALL" && n.status !== statusFilter) return false;
      if (audienceFilter !== "ALL" && n.audience !== audienceFilter)
        return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    });
  }, [notices, search, statusFilter, audienceFilter]);

  const counts = useMemo(
    () => ({
      total: notices.length,
      published: notices.filter((n) => n.status === "Published").length,
      drafts: notices.filter((n) => n.status === "Draft").length,
      studentTargeted: notices.filter(
        (n) =>
          n.status === "Published" &&
          (n.audience === "Students" || n.audience === "All permitted users"),
      ).length,
    }),
    [notices],
  );

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title="Wellbeing & Counselling Notices"
          subtitle="Create, preview, and publish school wellbeing notices, workshop invitations, and drop-in availability."
          actions={
            <Button
              onClick={() => {
                setEditingNotice(null);
                setModalOpen(true);
              }}
              leftIcon={<Icon name="plus" size={16} />}
            >
              Create Notice
            </Button>
          }
        />

        {toast && (
          <Toast
            variant="success"
            title={toast.title}
            description={toast.desc}
            onDismiss={() => setToast(null)}
          />
        )}

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Total Notices</div>
            <div className="es-stat-value">{counts.total}</div>
            <div className="es-stat-meta">Published & Draft items</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Published</div>
            <div className="es-stat-value">{counts.published}</div>
            <div className="es-stat-meta">Visible to target audiences</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Drafts</div>
            <div className="es-stat-value">{counts.drafts}</div>
            <div className="es-stat-meta">Pending final review</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Live in Student Voice</div>
            <div className="es-stat-value">{counts.studentTargeted}</div>
            <div className="es-stat-meta">Visible on student portal</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="cns-notice-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search title, summary, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="cns-notice-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | NoticeStatus)
                }
                options={[
                  { value: "ALL", label: "All Statuses" },
                  { value: "Published", label: "Published" },
                  { value: "Draft", label: "Draft" },
                ]}
              />
              <Select
                id="cns-notice-audience"
                value={audienceFilter}
                onChange={(e) =>
                  setAudienceFilter(e.target.value as "ALL" | NoticeAudience)
                }
                options={[
                  { value: "ALL", label: "All Audiences" },
                  ...NOTICE_AUDIENCES.map((a) => ({ value: a, label: a })),
                ]}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="megaphone"
                title="No matching notices"
                description="Adjust your filters or publish a new wellbeing announcement."
                action={
                  <Button
                    onClick={() => {
                      setEditingNotice(null);
                      setModalOpen(true);
                    }}
                  >
                    Create Notice
                  </Button>
                }
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "1rem",
                }}
              >
                {filtered.map((notice) => (
                  <Card
                    key={notice.id}
                    style={{ backgroundColor: "var(--es-surface-subtle)" }}
                  >
                    <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <Badge variant="primary">{notice.category}</Badge>
                          <Badge variant="neutral">{notice.audience}</Badge>
                        </div>
                        <NoticeStatusBadge status={notice.status} />
                      </div>

                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "var(--es-text-primary)",
                          }}
                        >
                          {notice.title}
                        </h3>
                        <p
                          style={{
                            margin: "0.35rem 0 0",
                            fontSize: "0.8125rem",
                            color: "var(--es-text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          {notice.summary}
                        </p>
                      </div>

                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        Date: {notice.publishedDate}
                        {notice.expiryDate ? ` · Expires: ${notice.expiryDate}` : ""}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setViewingNotice(notice)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNotice(notice);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <NoticeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingNotice={editingNotice}
        onSave={(input) => {
          const saved = saveCounsellingNotice(input);
          setToast({
            title:
              saved.status === "Published" ? "Notice Published" : "Draft Saved",
            desc: `"${saved.title}" is saved (${saved.status}).`,
          });
        }}
      />

      <Modal
        isOpen={Boolean(viewingNotice)}
        onClose={() => setViewingNotice(null)}
        title={viewingNotice?.title ?? "Notice"}
        description={
          viewingNotice
            ? `${viewingNotice.category} · Audience: ${viewingNotice.audience} · ${viewingNotice.publishedDate}`
            : undefined
        }
        footer={
          <Button variant="secondary" onClick={() => setViewingNotice(null)}>
            Close
          </Button>
        }
      >
        {viewingNotice && (
          <div className="es-stack" style={{ gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <NoticeStatusBadge status={viewingNotice.status} />
              <Badge variant="neutral">{viewingNotice.createdBy}</Badge>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                color: "var(--es-text-primary)",
              }}
            >
              {viewingNotice.content}
            </p>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
