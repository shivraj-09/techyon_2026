"use client";

import React, { useState } from "react";
import {
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
  Select,
} from "@/components/ui";
import {
  ANNOUNCEMENT_STATUS_OPTIONS,
  AUDIENCE_OPTIONS,
  type AnnouncementRecord,
  type AnnouncementStatus,
  type AudienceTarget,
} from "@/config/announcements-data";
import { AnnouncementCard } from "./AnnouncementCard";

export interface AnnouncementListProps {
  announcements: AnnouncementRecord[];
  onView?: (announcement: AnnouncementRecord) => void;
  onEdit?: (announcement: AnnouncementRecord) => void;
  onDelete?: (announcement: AnnouncementRecord) => void;
  getViewHref?: (announcement: AnnouncementRecord) => string;
  externalSearch?: string;
  externalAudience?: string;
  externalStatus?: string;
  showFilters?: boolean;
  pageSize?: number;
}

export function AnnouncementList({
  announcements,
  onView,
  onEdit,
  onDelete,
  getViewHref,
  externalSearch = "",
  externalAudience = "all",
  externalStatus = "all",
  showFilters = true,
  pageSize = 6,
}: AnnouncementListProps) {
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const effectiveSearch = (search || externalSearch).trim().toLowerCase();
  const effectiveAudience =
    audienceFilter !== "all" ? audienceFilter : externalAudience;
  const effectiveStatus =
    statusFilter !== "all" ? statusFilter : externalStatus;

  const filtered = announcements.filter((item) => {
    if (effectiveSearch) {
      const haystacks = [
        item.title,
        item.shortDescription,
        item.content,
        item.createdBy,
        item.specificClass || "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystacks.includes(effectiveSearch)) return false;
    }

    if (
      effectiveAudience !== "all" &&
      !item.audiences.includes(effectiveAudience as AudienceTarget)
    ) {
      return false;
    }

    if (
      effectiveStatus !== "all" &&
      item.status !== (effectiveStatus as AnnouncementStatus)
    ) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const hasLocalFilters =
    Boolean(search.trim()) ||
    audienceFilter !== "all" ||
    statusFilter !== "all";

  function handleClearFilters() {
    setSearch("");
    setAudienceFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>
            Showing {filtered.length} of {announcements.length} announcements
          </CardDescription>
        </div>

        {hasLocalFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </CardHeader>

      {showFilters && (
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "var(--es-bg-app)",
            borderBottom: "1px solid var(--es-border-subtle)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
            alignItems: "end",
          }}
        >
          <Input
            aria-label="Search announcements"
            placeholder="Search title, description, or author..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Icon name="search" size={14} />}
          />

          <Select
            aria-label="Filter by audience"
            value={audienceFilter}
            onChange={(e) => {
              setAudienceFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All Audiences" },
              ...AUDIENCE_OPTIONS.map((aud) => ({ value: aud, label: aud })),
            ]}
          />

          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All Statuses" },
              ...ANNOUNCEMENT_STATUS_OPTIONS.map((st) => ({
                value: st,
                label: st,
              })),
            ]}
          />
        </div>
      )}

      <CardBody>
        {paginated.length === 0 ? (
          <EmptyState
            icon="megaphone"
            title={
              announcements.length === 0
                ? "No announcements yet"
                : "No matching announcements"
            }
            description={
              announcements.length === 0
                ? "Create your first school-wide notice or circular to share updates with students, parents, and teachers."
                : "Try adjusting your search keywords, audience filter, or status filter."
            }
            action={
              hasLocalFilters ? (
                <Button variant="secondary" onClick={handleClearFilters}>
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
            {paginated.map((item) => (
              <AnnouncementCard
                key={item.id}
                announcement={item}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                viewHref={getViewHref ? getViewHref(item) : undefined}
              />
            ))}
          </div>
        )}
      </CardBody>

      {filtered.length > pageSize && (
        <CardFooter
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

