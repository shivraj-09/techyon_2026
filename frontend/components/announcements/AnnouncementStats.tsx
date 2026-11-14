import React from "react";
import { Icon, type IconName } from "@/components/ui";
import {
  computeAnnouncementStats,
  INITIAL_ANNOUNCEMENTS,
  type AnnouncementStatsSummary,
} from "@/config/announcements-data";

export interface AnnouncementStatsProps {
  stats?: AnnouncementStatsSummary;
  total?: number;
  published?: number;
  scheduled?: number;
  drafts?: number;
}

export function AnnouncementStats({
  stats,
  total,
  published,
  scheduled,
  drafts,
}: AnnouncementStatsProps) {
  const defaultStats = computeAnnouncementStats(INITIAL_ANNOUNCEMENTS);
  const resolvedStats: AnnouncementStatsSummary = {
    total: total ?? stats?.total ?? defaultStats.total,
    published: published ?? stats?.published ?? defaultStats.published,
    scheduled: scheduled ?? stats?.scheduled ?? defaultStats.scheduled,
    drafts: drafts ?? stats?.drafts ?? defaultStats.drafts,
  };

  const cards: {
    id: string;
    title: string;
    value: number;
    subtitle: string;
    icon: IconName;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    subColor: string;
  }[] = [
    {
      id: "total-announcements",
      title: "Total Announcements",
      value: resolvedStats.total,
      subtitle: "School-wide notices & circulars",
      icon: "megaphone",
      iconBg: "var(--es-primary-subtle)",
      iconColor: "var(--es-primary)",
      iconBorder: "var(--es-primary-border)",
      subColor: "var(--es-text-muted)",
    },
    {
      id: "published-announcements",
      title: "Published",
      value: resolvedStats.published,
      subtitle: "Live to target audiences",
      icon: "check-circle",
      iconBg: "var(--es-success-bg)",
      iconColor: "var(--es-success)",
      iconBorder: "var(--es-success-border)",
      subColor: "var(--es-success)",
    },
    {
      id: "scheduled-announcements",
      title: "Scheduled",
      value: resolvedStats.scheduled,
      subtitle: "Queued for upcoming release",
      icon: "clock",
      iconBg: "var(--es-primary-subtle)",
      iconColor: "var(--es-primary)",
      iconBorder: "var(--es-primary-border)",
      subColor: "var(--es-primary)",
    },
    {
      id: "draft-announcements",
      title: "Drafts",
      value: resolvedStats.drafts,
      subtitle: "Saved for final review",
      icon: "file-text",
      iconBg: "var(--es-warning-bg)",
      iconColor: "var(--es-warning)",
      iconBorder: "var(--es-warning-border)",
      subColor: "var(--es-warning)",
    },
  ];

  return (
    <section className="es-grid-4" aria-label="Announcement Statistics">
      {cards.map((card) => (
        <article key={card.id} className="es-stat-card">
          <div className="es-stat-top">
            <span
              style={{
                fontWeight: 600,
                color: "var(--es-text-secondary)",
                fontSize: "13px",
              }}
            >
              {card.title}
            </span>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--es-radius-md)",
                backgroundColor: card.iconBg,
                color: card.iconColor,
                border: `1px solid ${card.iconBorder}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={card.icon} size={17} />
            </span>
          </div>

          <div className="es-stat-value">{card.value}</div>

          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 500,
              color: card.subColor,
              marginTop: "2px",
            }}
          >
            {card.subtitle}
          </div>
        </article>
      ))}
    </section>
  );
}

