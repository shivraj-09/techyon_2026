"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import type { InsightReportRecord } from "@/config/ai-insights-data";

export interface InsightHistorySectionProps {
  reports: InsightReportRecord[];
}

export function InsightHistorySection({ reports }: InsightHistorySectionProps) {
  const [selectedReport, setSelectedReport] =
    useState<InsightReportRecord | null>(null);

  return (
    <section aria-labelledby="ai-history-heading">
      <Card>
        <CardHeader>
          <div>
            <CardTitle id="ai-history-heading">Recent Reports</CardTitle>
            <CardDescription>
              Historical rule-based insight snapshots archived for comparison
            </CardDescription>
          </div>
          <Badge variant="neutral">{reports.length} reports</Badge>
        </CardHeader>

        <CardBody flush>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Report Title</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Generated Date</TableHeaderCell>
                <TableHeaderCell>Summary</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: "right" }}>
                  Action
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "var(--es-text-primary)",
                      }}
                    >
                      {report.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "var(--es-text-subtle)",
                      }}
                    >
                      Period: {report.periodCovered}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary">{report.category}</Badge>
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    {report.generatedDate}
                  </TableCell>
                  <TableCell style={{ maxWidth: "360px" }}>
                    <span
                      style={{
                        fontSize: "12.5px",
                        color: "var(--es-text-secondary)",
                      }}
                    >
                      {report.summary}
                    </span>
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.title || "Insight Report"}
        description={
          selectedReport
            ? `${selectedReport.category} · Generated ${selectedReport.generatedDate}`
            : undefined
        }
        footer={
          <Button
            variant="secondary"
            size="md"
            onClick={() => setSelectedReport(null)}
          >
            Close
          </Button>
        }
      >
        {selectedReport && (
          <div className="es-stack" style={{ gap: "14px" }}>
            <div style={{ fontSize: "13px", color: "var(--es-text-muted)" }}>
              Period covered:{" "}
              <strong style={{ color: "var(--es-text-primary)" }}>
                {selectedReport.periodCovered}
              </strong>
            </div>

            <p
              style={{
                fontSize: "13.5px",
                color: "var(--es-text-secondary)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {selectedReport.summary}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              {selectedReport.keyMetrics.map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--es-radius-sm)",
                    border: "1px solid var(--es-border)",
                    backgroundColor: "var(--es-bg-subtle)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "var(--es-text-muted)",
                    }}
                  >
                    {metric.label}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--es-text-primary)",
                      marginTop: "2px",
                    }}
                  >
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Key Findings
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  fontSize: "13px",
                  color: "var(--es-text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {selectedReport.highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

