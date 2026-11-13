"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components/ui";
import { formatINR } from "@/config/fee-data";

export interface ParentFeeSummaryProps {
  totalFees: number;
  amountPaid: number;
  outstandingBalance: number;
  nextDueDate: string;
  childName?: string;
  viewDetailsHref?: string;
  title?: string;
}

export function ParentFeeSummary({
  totalFees,
  amountPaid,
  outstandingBalance,
  nextDueDate,
  childName,
  viewDetailsHref,
  title = "Fee Summary",
}: ParentFeeSummaryProps) {
  const paidPct =
    totalFees > 0 ? Math.min(100, Math.round((amountPaid / totalFees) * 100)) : 0;

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {childName
              ? `Fee status and balance for ${childName}`
              : "Combined fee ledger for linked children"}
          </CardDescription>
        </div>
        <Badge
          variant={outstandingBalance > 0 ? "warning" : "success"}
          dot
        >
          {outstandingBalance > 0 ? `${paidPct}% Paid` : "Settled"}
        </Badge>
      </CardHeader>

      <CardBody
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
            gap: "10px",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-bg-app)",
              border: "1px solid var(--es-border-subtle)",
            }}
          >
            <div className="es-metric-mini-label">Total Fees</div>
            <div className="es-metric-mini-value">{formatINR(totalFees)}</div>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-success-bg)",
              border: "1px solid var(--es-success-border)",
            }}
          >
            <div className="es-metric-mini-label">Amount Paid</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-success)" }}
            >
              {formatINR(amountPaid)}
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "var(--es-radius-md)",
              backgroundColor:
                outstandingBalance > 0
                  ? "var(--es-warning-bg)"
                  : "var(--es-bg-app)",
              border: `1px solid ${
                outstandingBalance > 0
                  ? "var(--es-warning-border)"
                  : "var(--es-border-subtle)"
              }`,
            }}
          >
            <div className="es-metric-mini-label">Outstanding Balance</div>
            <div
              className="es-metric-mini-value"
              style={{
                color:
                  outstandingBalance > 0
                    ? "var(--es-warning)"
                    : "var(--es-text-primary)",
              }}
            >
              {formatINR(outstandingBalance)}
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "var(--es-radius-md)",
              backgroundColor: "var(--es-bg-app)",
              border: "1px solid var(--es-border-subtle)",
            }}
          >
            <div className="es-metric-mini-label">Next Due Date</div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color:
                  outstandingBalance > 0
                    ? "var(--es-text-primary)"
                    : "var(--es-success)",
                marginTop: "4px",
              }}
            >
              {nextDueDate}
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--es-text-muted)",
              marginBottom: "6px",
            }}
          >
            <span>Fee settlement progress</span>
            <strong style={{ color: "var(--es-text-primary)" }}>
              {paidPct}%
            </strong>
          </div>
          <div className="es-progress-track" style={{ height: 8 }}>
            <div
              className="es-progress-fill good"
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
      </CardBody>

      {viewDetailsHref && (
        <CardFooter>
          <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
            Read-only fee ledger
          </span>
          <Link href={viewDetailsHref} style={{ textDecoration: "none" }}>
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<Icon name="chevron-right" size={14} />}
            >
              View Fee Details
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
