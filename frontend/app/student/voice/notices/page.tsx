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
} from "@/components/ui";
import {
  NOTICE_CATEGORIES,
  type CounsellingNoticeRecord,
  type NoticeCategory,
} from "@/config/counsellor-data";
import {
  markStudentNoticeRead,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function StudentVoiceNoticesPage() {
  const { notices, readNoticeIds } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | NoticeCategory
  >("ALL");
  const [selectedNotice, setSelectedNotice] =
    useState<CounsellingNoticeRecord | null>(null);

  const visibleNotices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices.filter((n) => {
      if (n.status !== "Published") return false;
      if (n.audience !== "Students" && n.audience !== "All permitted users") {
        return false;
      }
      if (categoryFilter !== "ALL" && n.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });
  }, [notices, search, categoryFilter]);

  function openNotice(notice: CounsellingNoticeRecord) {
    markStudentNoticeRead(notice.id);
    setSelectedNotice(notice);
  }

  return (
    <AppLayout defaultRole="student">
      <div className="es-stack">
        <PageHeader
          title="Wellbeing Notices & Resources"
          subtitle="Workshops, drop-in counselling hours, and helpful guidance published by your School Counsellor."
        />

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="sv-notice-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search notices or workshops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="sv-notice-category"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as "ALL" | NoticeCategory)
                }
                options={[
                  { value: "ALL", label: "All Categories" },
                  ...NOTICE_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
            </div>

            {visibleNotices.length === 0 ? (
              <EmptyState
                icon="megaphone"
                title="No wellbeing notices match"
                description="Check back soon for workshops, mindfulness hours, and support updates."
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
                {visibleNotices.map((notice) => {
                  const isRead = readNoticeIds.includes(notice.id);
                  return (
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
                          <Badge variant="neutral">{notice.category}</Badge>
                          <Badge variant={isRead ? "success" : "primary"}>
                            {isRead ? "Read" : "New"}
                          </Badge>
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--es-text-muted)",
                            }}
                          >
                            Published {notice.publishedDate}
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openNotice(notice)}
                          >
                            Read More
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title ?? "Notice"}
        description={
          selectedNotice
            ? `${selectedNotice.category} · Published ${selectedNotice.publishedDate}`
            : undefined
        }
        footer={
          <Button variant="secondary" onClick={() => setSelectedNotice(null)}>
            Close
          </Button>
        }
      >
        {selectedNotice && (
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
              color: "var(--es-text-primary)",
            }}
          >
            {selectedNotice.content}
          </p>
        )}
      </Modal>
    </AppLayout>
  );
}
