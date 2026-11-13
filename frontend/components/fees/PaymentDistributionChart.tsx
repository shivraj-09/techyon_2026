"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { PAYMENT_DISTRIBUTION_DATA, formatINR } from "@/config/fee-data";

export function PaymentDistributionChart() {
  const segments = [
    PAYMENT_DISTRIBUTION_DATA.paid,
    PAYMENT_DISTRIBUTION_DATA.partial,
    PAYMENT_DISTRIBUTION_DATA.pending,
    PAYMENT_DISTRIBUTION_DATA.overdue,
  ];

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div>
          <CardTitle>Payment Distribution</CardTitle>
          <CardDescription>
            Breakdown of invoices by payment completion status
          </CardDescription>
        </div>
      </CardHeader>

      <CardBody
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* SVG Donut Chart */}
        <div
          style={{
            position: "relative",
            width: "160px",
            height: "160px",
            margin: "0 auto",
            flexShrink: 0,
          }}
        >
          <svg
            viewBox="0 0 150 150"
            style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
            role="img"
            aria-label="Payment distribution donut chart"
          >
            {segments.map((seg) => {
              const strokeDasharray = `${
                (seg.percentage / 100) * circumference
              } ${circumference}`;
              const strokeDashoffset = -(
                (cumulativePercent / 100) *
                circumference
              );
              cumulativePercent += seg.percentage;

              return (
                <circle
                  key={seg.label}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                lineHeight: 1.1,
              }}
            >
              86.8%
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--es-text-muted)",
                marginTop: "2px",
              }}
            >
              Collected
            </span>
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div
          style={{
            flex: 1,
            minWidth: "210px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {segments.map((seg) => (
            <div
              key={seg.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
                borderRadius: "var(--es-radius-sm)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: seg.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "var(--es-text-primary)",
                    }}
                  >
                    {seg.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--es-text-muted)",
                    }}
                  >
                    {seg.count} invoices ({seg.percentage}%)
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                }}
              >
                {formatINR(seg.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
