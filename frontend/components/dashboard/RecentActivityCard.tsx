"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components/ui";
import {
  RECENT_ACTIVITIES,
  type RecentActivityItem,
} from "@/config/admin-dashboard-data";

export function RecentActivityCard() {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll
    ? RECENT_ACTIVITIES
    : RECENT_ACTIVITIES.slice(0, 5);

  function getIconStyles(tone: RecentActivityItem["tone"]) {
    if (tone === "success") {
      return {
        backgroundColor: "var(--es-success-bg)",
        color: "var(--es-success)",
        border: "1px solid var(--es-success-border)",
      };
    }
    if (tone === "warning") {
      return {
        backgroundColor: "var(--es-warning-bg)",
        color: "var(--es-warning)",
        border: "1px solid var(--es-warning-border)",
      };
    }
    if (tone === "primary") {
      return {
        backgroundColor: "var(--es-primary-subtle)",
        color: "var(--es-primary)",
        border: "1px solid var(--es-primary-border)",
      };
    }
    return {
      backgroundColor: "var(--es-bg-subtle)",
      color: "var(--es-text-secondary)",
      border: "1px solid var(--es-border)",
    };
  }

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Live operational events across your school
          </CardDescription>
        </div>
      </CardHeader>

      <CardBody flush style={{ flex: 1 }}>
        <div className="es-activity-list">
          {visibleItems.map((item) => (
            <div key={item.id} className="es-activity-item">
              <span
                className="es-activity-icon"
                style={getIconStyles(item.tone)}
              >
                <Icon name={item.icon} size={15} />
              </span>
              <div className="es-activity-content">
                <div className="es-activity-text">{item.description}</div>
                <div className="es-activity-time">{item.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>

      <CardFooter>
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--es-primary)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>
            {showAll ? "Show fewer activities" : "View all activity"}
          </span>
          <Icon name="chevron-right" size={14} />
        </button>
        <span style={{ fontSize: "11.5px", color: "var(--es-text-subtle)" }}>
          Updated just now
        </span>
      </CardFooter>
    </Card>
  );
}

