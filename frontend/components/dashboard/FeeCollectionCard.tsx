"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  FEE_COLLECTION_SIX_MONTHS,
  FEE_COLLECTION_SUMMARY,
  formatINR,
  formatINRLakhs,
} from "@/config/admin-dashboard-data";

export function FeeCollectionCard() {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const maxAmount = 900000;
  const activeItem =
    FEE_COLLECTION_SIX_MONTHS.find((m) => m.month === hoveredMonth) ||
    FEE_COLLECTION_SIX_MONTHS[FEE_COLLECTION_SIX_MONTHS.length - 1];

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div>
          <CardTitle>Fee Collection</CardTitle>
          <CardDescription>
            Last 6 months fee receipts and pending dues
          </CardDescription>
        </div>
        <div className="es-chart-legend" aria-label="Chart legend">
          <span className="es-legend-item">
            <span
              className="es-legend-swatch"
              style={{ backgroundColor: "#0284c7" }}
            />
            Collected
          </span>
          <span className="es-legend-item">
            <span
              className="es-legend-swatch"
              style={{ backgroundColor: "#cbd5e1" }}
            />
            Pending
          </span>
        </div>
      </CardHeader>

      <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Summary Metrics Strip */}
        <div className="es-analytics-summary-3">
          <div>
            <div className="es-metric-mini-label">Collected (Nov)</div>
            <div className="es-metric-mini-value">
              {FEE_COLLECTION_SUMMARY.totalCollectedThisMonth}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Outstanding</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-warning)" }}
            >
              {FEE_COLLECTION_SUMMARY.outstandingAmount}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Monthly Trend</div>
            <div
              className="es-metric-mini-value"
              style={{ fontSize: "14px", color: "var(--es-success)", marginTop: "5px" }}
            >
              {FEE_COLLECTION_SUMMARY.monthlyTrend}
            </div>
          </div>
        </div>

        {/* Active Month Readout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--es-text-muted)",
            marginBottom: "12px",
          }}
        >
          <span>
            <strong style={{ color: "var(--es-text-primary)" }}>
              {activeItem.month} 2026:
            </strong>{" "}
            Collected{" "}
            <strong style={{ color: "var(--es-primary)" }}>
              {formatINR(activeItem.collected)}
            </strong>{" "}
            · Pending{" "}
            <strong style={{ color: "var(--es-text-secondary)" }}>
              {formatINR(activeItem.pending)}
            </strong>
          </span>
        </div>

        {/* 6-Month Bar Chart */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            paddingTop: "8px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: "12px",
              alignItems: "end",
              height: "168px",
              padding: "0 6px 10px",
              borderBottom: "1px solid var(--es-border)",
            }}
            role="img"
            aria-label="Six month fee collection bar chart"
          >
            {FEE_COLLECTION_SIX_MONTHS.map((item) => {
              const collectedHeightPct = Math.round(
                (item.collected / maxAmount) * 100,
              );
              const pendingHeightPct = Math.round(
                (item.pending / maxAmount) * 100,
              );
              const isSelected = activeItem.month === item.month;

              return (
                <div
                  key={item.month}
                  onMouseEnter={() => setHoveredMonth(item.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: isSelected
                        ? "var(--es-primary)"
                        : "var(--es-text-subtle)",
                      marginBottom: "4px",
                    }}
                  >
                    {formatINRLakhs(item.collected)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "4px",
                      height: "130px",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    {/* Collected Bar */}
                    <div
                      title={`${item.month} Collected: ${formatINR(item.collected)}`}
                      style={{
                        width: "14px",
                        height: `${collectedHeightPct}%`,
                        backgroundColor: isSelected ? "#0369a1" : "#0284c7",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 200ms ease, background-color 150ms ease",
                      }}
                    />
                    {/* Pending Bar */}
                    <div
                      title={`${item.month} Pending: ${formatINR(item.pending)}`}
                      style={{
                        width: "10px",
                        height: `${pendingHeightPct}%`,
                        backgroundColor: isSelected ? "#94a3b8" : "#cbd5e1",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 200ms ease, background-color 150ms ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Month X-Axis Labels */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: "12px",
              padding: "8px 6px 0",
              textAlign: "center",
            }}
          >
            {FEE_COLLECTION_SIX_MONTHS.map((item) => {
              const isSelected = activeItem.month === item.month;
              return (
                <span
                  key={item.month}
                  style={{
                    fontSize: "11.5px",
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected
                      ? "var(--es-text-primary)"
                      : "var(--es-text-muted)",
                  }}
                >
                  {item.month}
                </span>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

