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
  FEE_COLLECTION_TREND_6M,
  FEE_OVERVIEW_STATS,
  formatINR,
} from "@/config/fee-data";

export function FeeCollectionChart() {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const maxAmount = 300000;
  const activePoint =
    FEE_COLLECTION_TREND_6M.find((p) => p.month === hoveredMonth) ||
    FEE_COLLECTION_TREND_6M[FEE_COLLECTION_TREND_6M.length - 1];

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div>
          <CardTitle>Collection Trend</CardTitle>
          <CardDescription>
            Fee collection and outstanding balance over the last 6 months
          </CardDescription>
        </div>
        <div className="es-chart-legend">
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
            Outstanding
          </span>
        </div>
      </CardHeader>

      <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Summary Strip */}
        <div className="es-analytics-summary-3">
          <div>
            <div className="es-metric-mini-label">Amount Collected</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-primary)" }}
            >
              {formatINR(FEE_OVERVIEW_STATS.collectedFees)}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Amount Outstanding</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-warning)" }}
            >
              {formatINR(FEE_OVERVIEW_STATS.outstandingFees)}
            </div>
          </div>
          <div>
            <div className="es-metric-mini-label">Monthly Trend</div>
            <div
              className="es-metric-mini-value"
              style={{
                fontSize: "14px",
                color: "var(--es-success)",
                marginTop: "5px",
              }}
            >
              +8.4% vs last month
            </div>
          </div>
        </div>

        {/* Active Month Readout */}
        <div
          style={{
            fontSize: "12px",
            color: "var(--es-text-muted)",
            marginBottom: "10px",
          }}
        >
          <strong style={{ color: "var(--es-text-primary)" }}>
            {activePoint.month} 2026:
          </strong>{" "}
          Collected{" "}
          <strong style={{ color: "var(--es-primary)" }}>
            {formatINR(activePoint.collected)}
          </strong>{" "}
          · Outstanding{" "}
          <strong style={{ color: "var(--es-text-secondary)" }}>
            {formatINR(activePoint.outstanding)}
          </strong>
        </div>

        {/* 6-Month Bar Chart */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: "12px",
              alignItems: "end",
              height: "160px",
              padding: "0 8px 10px",
              borderBottom: "1px solid var(--es-border)",
            }}
          >
            {FEE_COLLECTION_TREND_6M.map((pt) => {
              const collectedPct = Math.min(
                100,
                Math.round((pt.collected / maxAmount) * 100),
              );
              const outstandingPct = Math.min(
                100,
                Math.round((pt.outstanding / maxAmount) * 100),
              );
              const isSelected = activePoint.month === pt.month;

              return (
                <div
                  key={pt.month}
                  onMouseEnter={() => setHoveredMonth(pt.month)}
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
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: isSelected
                        ? "var(--es-primary)"
                        : "var(--es-text-subtle)",
                      marginBottom: "4px",
                    }}
                  >
                    ₹{(pt.collected / 100000).toFixed(2)}L
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      gap: "4px",
                      height: "126px",
                      width: "100%",
                    }}
                  >
                    <div
                      title={`${pt.month} Collected: ${formatINR(pt.collected)}`}
                      style={{
                        width: "15px",
                        height: `${collectedPct}%`,
                        backgroundColor: isSelected ? "#0369a1" : "#0284c7",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 180ms ease",
                      }}
                    />
                    <div
                      title={`${pt.month} Outstanding: ${formatINR(pt.outstanding)}`}
                      style={{
                        width: "10px",
                        height: `${outstandingPct}%`,
                        backgroundColor: isSelected ? "#94a3b8" : "#cbd5e1",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 180ms ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: "12px",
              padding: "8px 8px 0",
              textAlign: "center",
            }}
          >
            {FEE_COLLECTION_TREND_6M.map((pt) => {
              const isSelected = activePoint.month === pt.month;
              return (
                <span
                  key={pt.month}
                  style={{
                    fontSize: "11.5px",
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected
                      ? "var(--es-text-primary)"
                      : "var(--es-text-muted)",
                  }}
                >
                  {pt.month}
                </span>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
