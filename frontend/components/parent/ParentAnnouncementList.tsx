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
  Tabs,
} from "@/components/ui";
import { PriorityBadge } from "@/components/announcements";
import {
  PARENT_ANNOUNCEMENTS,
  getSyncedParentAnnouncements,
  type ParentAnnouncementItem,
} from "@/config/parent-data";

export type ParentAnnouncementFilterTab =
  | "all"
  | "School Updates"
  | "Class Updates"
  | "Important";

export interface ParentAnnouncementListProps {
  announcements?: ParentAnnouncementItem[];
}

export function ParentAnnouncementList({
  announcements: propAnnouncements,
}: ParentAnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<ParentAnnouncementItem[]>(
    propAnnouncements ?? PARENT_ANNOUNCEMENTS,
  );
  const [activeTab, setActiveTab] =
    useState<ParentAnnouncementFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<ParentAnnouncementItem | null>(null);

  useEffect(() => {
    if (propAnnouncements) {
      setAnnouncements(propAnnouncements);
    } else {
      setAnnouncements(getSyncedParentAnnouncements());
    }
  }, [propAnnouncements]);

  const counts = useMemo(() => {
    const schoolCount = announcements.filter(
      (a) => a.category === "School Updates",
    ).length;
    const classCount = announcements.filter(
      (a) => a.category === "Class Updates",
    ).length;
    const importantCount = announcements.filter(
      (a) => a.priority === "Important" || a.priority === "Urgent",
    ).length;
    return {
      all: announcements.length,
      school: schoolCount,
      classUpdates: classCount,
      important: importantCount,
    };
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return announcements.filter((item) => {
      if (activeTab === "School Updates" && item.category !== "School Updates") {
        return false;
      }
      if (activeTab === "Class Updates" && item.category !== "Class Updates") {
        return false;
      }
      if (
        activeTab === "Important" &&
        item.priority !== "Important" &&
        item.priority !== "Urgent"
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.fullContent.toLowerCase().includes(q) ||
        item.publishedBy.toLowerCase().includes(q) ||
        (item.childName && item.childName.toLowerCase().includes(q))
      );
    });
  }, [announcements, activeTab, searchQuery]);

  const hasFilters = Boolean(searchQuery.trim()) || activeTab !== "all";

  function handleClearFilters() {
    setActiveTab("all");
    setSearchQuery("");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>School &amp; Class Announcements</CardTitle>
            <CardDescription>
              Showing {filteredAnnouncements.length} of {announcements.length}{" "}
              notices for your family (Read-only)
            </CardDescription>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </CardHeader>

        {/* Filter Tabs & Search */}
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "var(--es-bg-app)",
            borderBottom: "1px solid var(--es-border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Tabs
            tabs={[
              { id: "all", label: "All", count: counts.all },
              {
                id: "School Updates",
                label: "School Updates",
                count: counts.school,
              },
              {
                id: "Class Updates",
                label: "Class Updates",
                count: counts.classUpdates,
              },
              {
                id: "Important",
                label: "Important",
                count: counts.important,
              },
            ]}
            activeTab={activeTab}
            onChange={(tabId) =>
              setActiveTab(tabId as ParentAnnouncementFilterTab)
            }
          />

          <Input
            aria-label="Search parent announcements"
            placeholder="Search by title, teacher, child name, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Icon name="search" size={14} />}
          />
        </div>

        <CardBody>
          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              icon="megaphone"
              title="No matching announcements"
              description="Try clearing your search query or selecting a different announcement filter."
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
                  onClick={() => setSelectedAnnouncement(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedAnnouncement(item);
                    }
                  }}
                  style={{
                    cursor: "pointer",
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
                      gap: "10px",
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
                        <PriorityBadge priority={item.priority} />
                        <Badge
                          variant={
                            item.category === "Class Updates"
                              ? "primary"
                              : "neutral"
                          }
                        >
                          {item.category}
                        </Badge>
                      </div>
                      {item.childName && (
                        <Badge variant="success" dot>
                          {item.childName}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "var(--es-text-primary)",
                          lineHeight: 1.35,
                        }}
                      >
                        {item.title}
                      </h3>
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
                        marginTop: "auto",
                        paddingTop: "8px",
                        borderTop: "1px solid var(--es-border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        fontSize: "12px",
                        color: "var(--es-text-muted)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>{item.publishedBy}</span>
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
                      {item.audience}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<Icon name="arrow-up-right" size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnouncement(item);
                      }}
                    >
                      Read Notice
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Read-Only Announcement Detail Modal */}
      <Modal
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.title || "Announcement Details"}
        description={
          selectedAnnouncement
            ? `${selectedAnnouncement.publishedBy} · ${selectedAnnouncement.publishedDate}`
            : undefined
        }
        footer={
          <Button
            variant="primary"
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
              <PriorityBadge priority={selectedAnnouncement.priority} />
              <Badge
                variant={
                  selectedAnnouncement.category === "Class Updates"
                    ? "primary"
                    : "neutral"
                }
              >
                {selectedAnnouncement.category}
              </Badge>
              <Badge variant="neutral">
                Audience: {selectedAnnouncement.audience}
              </Badge>
              {selectedAnnouncement.childName && (
                <Badge variant="success" dot>
                  Child: {selectedAnnouncement.childName}
                </Badge>
              )}
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
              {selectedAnnouncement.fullContent}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
