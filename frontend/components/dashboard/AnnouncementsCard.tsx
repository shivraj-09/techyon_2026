"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components/ui";
import {
  ANNOUNCEMENTS_PREVIEW,
  type AnnouncementPreviewItem,
} from "@/config/admin-dashboard-data";

export interface AnnouncementsCardProps {
  onSelectAnnouncement: (item: AnnouncementPreviewItem) => void;
}

export function AnnouncementsCard({
  onSelectAnnouncement,
}: AnnouncementsCardProps) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Recent school-wide circulars and notices
          </CardDescription>
        </div>
        <Badge variant="neutral">3 Active</Badge>
      </CardHeader>

      <CardBody flush style={{ flex: 1 }}>
        <div>
          {ANNOUNCEMENTS_PREVIEW.map((item) => (
            <div
              key={item.id}
              className="es-announcement-item"
              role="button"
              tabIndex={0}
              onClick={() => onSelectAnnouncement(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectAnnouncement(item);
                }
              }}
            >
              <div className="es-announcement-top">
                <span className="es-announcement-title">{item.title}</span>
                <Badge variant={item.audienceVariant}>{item.audience}</Badge>
              </div>
              <div className="es-announcement-desc">{item.description}</div>
              <div className="es-announcement-meta">{item.publishedDate}</div>
            </div>
          ))}
        </div>
      </CardBody>

      <CardFooter>
        <Link
          href="/dashboard/announcements"
          style={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--es-primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>View all announcements</span>
          <Icon name="chevron-right" size={14} />
        </Link>
      </CardFooter>
    </Card>
  );
}

