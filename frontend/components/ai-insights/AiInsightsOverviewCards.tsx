"use client";

import React from "react";
import { Badge, Icon } from "@/components/ui";
import { formatINR } from "@/config/fee-data";
import type { AnalyticsOverviewMetrics } from "@/config/ai-insights-data";

export interface AiInsightsOverviewCardsProps {
  metrics: AnalyticsOverviewMetrics;
  isLoading?: boolean;
}

export function AiInsightsOverviewCards({
  metrics,
  isLoading = false,
}: AiInsightsOverviewCardsProps) {
  const attendanceTrendUp = metrics.attendanceTrend === "up";
  const feeTrendUp = metrics.feeCollectionTrend === "up";

  return (
    <div
      className="es-stats-grid"
      style={{
        opacity: isLoading ? 0.65 : 1,
        transition: "opacity 150ms ease",
      }}
    >
      {/* 1. Attendance Rate */}
      <div className="es-stat-card">
        <div className="es-stat-top">
          <span>Attendance Rate</span>
          <Badge variant={attendanceTrendUp ? "success" : "warning"}>
            <Icon
              name={attendanceTrendUp ? "trending-up" : "trending-down"}
              size={12}
            />
            {attendanceTrendUp ? "Improving" : "Declining"}
          </Badge>
        </div>
        <div className="es-stat-value">{metrics.attendanceRate.toFixed(1)}%</div>
        <div className="es-stat-meta">
          <Icon
            name={attendanceTrendUp ? "trending-up" : "trending-down"}
            size={13}
            style={{
              color: attendanceTrendUp
                ? "var(--es-success)"
                : "var(--es-warning)",
            }}
          />
          <span>{metrics.attendanceDeltaLabel}</span>
        </div>
      </div>

      {/* 2. Fee Collection */}
      <div className="es-stat-card">
        <div className="es-stat-top">
          <span>Fee Collection</span>
          <Badge variant={feeTrendUp ? "success" : "primary"}>
            {metrics.feeCollectionPct.toFixed(1)}% collected
          </Badge>
        </div>
        <div className="es-stat-value">{formatINR(metrics.feeCollected)}</div>
        <div className="es-stat-meta">
          <Icon
            name={feeTrendUp ? "trending-up" : "trending-down"}
            size={13}
            style={{
              color: feeTrendUp ? "var(--es-success)" : "var(--es-warning)",
            }}
          />
          <span>{metrics.feeCollectionDeltaLabel}</span>
        </div>
      </div>

      {/* 3. Low Attendance */}
      <div className="es-stat-card">
        <div className="es-stat-top">
          <span>Low Attendance</span>
          <Badge variant="warning">
            Below {metrics.attendanceThresholdPct}%
          </Badge>
        </div>
        <div className="es-stat-value">
          {metrics.lowAttendanceStudentsCount} students
        </div>
        <div className="es-stat-meta">
          <Icon
            name="alert-triangle"
            size={13}
            style={{ color: "var(--es-warning)" }}
          />
          <span>
            Below {metrics.attendanceThresholdPct}% attendance threshold (of{" "}
            {metrics.enrolledStudentsTotal.toLocaleString("en-IN")})
          </span>
        </div>
      </div>

      {/* 4. Outstanding Fees */}
      <div className="es-stat-card">
        <div className="es-stat-top">
          <span>Outstanding Fees</span>
          <Badge variant="danger">
            {metrics.overdueInvoicesCount} overdue
          </Badge>
        </div>
        <div className="es-stat-value">{formatINR(metrics.feeOutstanding)}</div>
        <div className="es-stat-meta">
          <Icon
            name="indian-rupee"
            size={13}
            style={{ color: "var(--es-danger)" }}
          />
          <span>
            {formatINR(metrics.overdueAmount)} overdue across{" "}
            {metrics.overdueInvoicesCount} invoices
          </span>
        </div>
      </div>
    </div>
  );
}

