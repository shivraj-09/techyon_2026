"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import { formatINR } from "@/config/fee-data";
import type {
  AnalyticsOverviewMetrics,
  ClassOutstandingBreakdown,
  FeeTimelinePoint,
  OverdueInvoiceRow,
} from "@/config/ai-insights-data";

export interface FeeInsightsSectionProps {
  metrics: AnalyticsOverviewMetrics;
  timeline: FeeTimelinePoint[];
  classBreakdown: ClassOutstandingBreakdown[];
  overdueInvoices: OverdueInvoiceRow[];
}

export function FeeInsightsSection({
  metrics,
  timeline,
  classBreakdown,
  overdueInvoices,
}: FeeInsightsSectionProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxTimelineVal = Math.max(
    1,
    ...timeline.map((item) => item.collected + item.outstanding),
  );
  const maxClassOutstanding = Math.max(
    1,
    ...classBreakdown.map((item) => item.outstandingAmount),
  );

  const activeBar =
    hoveredIdx !== null ? timeline[hoveredIdx] : timeline[timeline.length - 1];

  return (
    <section aria-labelledby="ai-fee-heading" className="es-stack">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h2
            id="ai-fee-heading"
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--es-text-primary)",
              margin: 0,
            }}
          >
            Fee Analysis
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--es-text-muted)",
              marginTop: "2px",
            }}
          >
            Reconciled breakdown across collected revenue, pending balances, and
            past-due invoices ({metrics.periodLabel}).
          </p>
        </div>
        <Link href="/admin/fees">
          <Button variant="secondary" size="sm">
            Open Fee Management
          </Button>
        </Link>
      </div>

      {/* Explicit Metric Reconciliation Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "12px",
        }}
      >
        <div className="es-stat-card" style={{ padding: "14px 16px" }}>
          <div className="es-stat-top">Total Fees Collected</div>
          <div
            className="es-stat-value"
            style={{ fontSize: "20px", color: "var(--es-primary)" }}
          >
            {formatINR(metrics.feeCollected)}
          </div>
          <div className="es-stat-meta">
            of {formatINR(metrics.feeExpected)} billed
          </div>
        </div>

        <div className="es-stat-card" style={{ padding: "14px 16px" }}>
          <div className="es-stat-top">Total Outstanding Fees</div>
          <div
            className="es-stat-value"
            style={{ fontSize: "20px", color: "var(--es-warning)" }}
          >
            {formatINR(metrics.feeOutstanding)}
          </div>
          <div className="es-stat-meta">
            Includes upcoming + overdue invoices
          </div>
        </div>

        <div className="es-stat-card" style={{ padding: "14px 16px" }}>
          <div className="es-stat-top">Overdue Amount</div>
          <div
            className="es-stat-value"
            style={{ fontSize: "20px", color: "var(--es-danger)" }}
          >
            {formatINR(metrics.overdueAmount)}
          </div>
          <div className="es-stat-meta">
            Subset of outstanding ({metrics.overdueInvoicesCount} invoices)
          </div>
        </div>

        <div className="es-stat-card" style={{ padding: "14px 16px" }}>
          <div className="es-stat-top">Collection Rate</div>
          <div
            className="es-stat-value"
            style={{ fontSize: "20px", color: "var(--es-success)" }}
          >
            {metrics.feeCollectionPct.toFixed(1)}%
          </div>
          <div className="es-stat-meta">{metrics.feeCollectionDeltaLabel}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "16px",
        }}
      >
        {/* Collection Over Time */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader>
            <div>
              <CardTitle>Fee Collection Over Time</CardTitle>
              <CardDescription>
                Collected vs remaining outstanding across intervals
              </CardDescription>
            </div>
            <div className="es-chart-legend">
              <span className="es-legend-item">
                <span
                  className="es-legend-swatch"
                  style={{ backgroundColor: "var(--es-primary)" }}
                />
                Collected
              </span>
              <span className="es-legend-item">
                <span
                  className="es-legend-swatch"
                  style={{ backgroundColor: "#f59e0b" }}
                />
                Outstanding
              </span>
            </div>
          </CardHeader>

          <CardBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {activeBar && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-text-muted)",
                  marginBottom: "14px",
                }}
              >
                <strong style={{ color: "var(--es-text-primary)" }}>
                  {activeBar.label}:
                </strong>{" "}
                Collected{" "}
                <strong style={{ color: "var(--es-primary)" }}>
                  {formatINR(activeBar.collected)}
                </strong>{" "}
                · Outstanding{" "}
                <strong style={{ color: "var(--es-warning)" }}>
                  {formatINR(activeBar.outstanding)}
                </strong>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${timeline.length}, minmax(0, 1fr))`,
                gap: "12px",
                alignItems: "end",
                height: "175px",
                paddingTop: "10px",
                marginTop: "auto",
              }}
            >
              {timeline.map((item, idx) => {
                const collectedH = Math.max(
                  14,
                  Math.round((item.collected / maxTimelineVal) * 140),
                );
                const outstandingH = Math.max(
                  6,
                  Math.round((item.outstanding / maxTimelineVal) * 140),
                );
                const isActive = hoveredIdx === idx;
                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      opacity: hoveredIdx !== null && !isActive ? 0.72 : 1,
                      transition: "opacity 140ms ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "4px",
                        height: "144px",
                      }}
                    >
                      <div
                        title={`${item.label} Collected: ${formatINR(item.collected)}`}
                        style={{
                          width: "18px",
                          height: `${collectedH}px`,
                          backgroundColor: "var(--es-primary)",
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                      <div
                        title={`${item.label} Outstanding: ${formatINR(item.outstanding)}`}
                        style={{
                          width: "12px",
                          height: `${outstandingH}px`,
                          backgroundColor: "#f59e0b",
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--es-text-subtle)",
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Outstanding Fees Breakdown by Class */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader>
            <div>
              <CardTitle>Outstanding Fees by Class</CardTitle>
              <CardDescription>
                Class-wise balance sums to {formatINR(metrics.feeOutstanding)}
              </CardDescription>
            </div>
            <Badge variant="warning">
              {formatINR(metrics.overdueAmount)} overdue
            </Badge>
          </CardHeader>

          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {classBreakdown.map((item) => {
                const totalWidthPct = Math.round(
                  (item.outstandingAmount / maxClassOutstanding) * 100,
                );
                const overdueRatioPct =
                  item.outstandingAmount > 0
                    ? Math.round(
                        (item.overdueAmount / item.outstandingAmount) * 100,
                      )
                    : 0;

                return (
                  <div key={item.classId}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12.5px",
                        marginBottom: "4px",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {item.className}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            fontSize: "11.5px",
                            color: "var(--es-text-subtle)",
                          }}
                        >
                          ({item.pendingInvoices} invoices)
                        </span>
                      </span>
                      <span style={{ fontSize: "12px" }}>
                        <strong style={{ color: "var(--es-text-primary)" }}>
                          {formatINR(item.outstandingAmount)}
                        </strong>{" "}
                        {item.overdueAmount > 0 && (
                          <span style={{ color: "var(--es-danger)" }}>
                            ({formatINR(item.overdueAmount)} overdue)
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "9px",
                        borderRadius: "999px",
                        backgroundColor: "var(--es-bg-muted)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${totalWidthPct}%`,
                          height: "100%",
                          borderRadius: "999px",
                          backgroundColor: "#f59e0b",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${overdueRatioPct}%`,
                            height: "100%",
                            backgroundColor: "var(--es-danger)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Overdue Invoices Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Overdue Invoices Queue</CardTitle>
            <CardDescription>
              Priority accounts past their scheduled billing due date
            </CardDescription>
          </div>
          <Link href="/admin/fees/balances">
            <Button variant="secondary" size="sm">
              View All Balances
            </Button>
          </Link>
        </CardHeader>

        <CardBody flush>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Student</TableHeaderCell>
                <TableHeaderCell>Class</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Due Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: "right" }}>
                  Invoice
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overdueInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "var(--es-text-primary)",
                      }}
                    >
                      {inv.studentName}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "var(--es-text-subtle)",
                      }}
                    >
                      {inv.invoiceNo}
                    </div>
                  </TableCell>
                  <TableCell>{inv.className}</TableCell>
                  <TableCell>
                    <strong style={{ color: "var(--es-text-primary)" }}>
                      {formatINR(inv.amount)}
                    </strong>
                  </TableCell>
                  <TableCell>
                    <div>{inv.dueDate}</div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "var(--es-danger)",
                      }}
                    >
                      {inv.daysOverdue} days overdue
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === "Severely Overdue" ? "danger" : "warning"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <Link href={`/admin/fees/invoices/${inv.id}`}>
                      <Button variant="secondary" size="sm">
                        View Invoice
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </section>
  );
}

