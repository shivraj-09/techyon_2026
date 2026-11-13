import React from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui";
import { formatINR } from "@/config/fee-data";

export interface PaymentSummaryCardProps {
  title?: string;
  originalAmount?: number;
  discount?: number;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
}

export function PaymentSummaryCard({
  title = "Financial Summary",
  originalAmount,
  discount = 0,
  totalAmount,
  paidAmount,
  outstandingBalance,
}: PaymentSummaryCardProps) {
  const paidPct =
    totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color:
              outstandingBalance === 0
                ? "var(--es-success)"
                : "var(--es-primary)",
          }}
        >
          {paidPct}% Paid
        </span>
      </CardHeader>

      <CardBody>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "14px",
            marginBottom: "14px",
          }}
        >
          {originalAmount !== undefined && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
                borderRadius: "var(--es-radius-md)",
              }}
            >
              <div className="es-metric-mini-label">Original Amount</div>
              <div className="es-metric-mini-value">
                {formatINR(originalAmount)}
              </div>
            </div>
          )}

          {discount > 0 && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
                borderRadius: "var(--es-radius-md)",
              }}
            >
              <div className="es-metric-mini-label">Discount Applied</div>
              <div
                className="es-metric-mini-value"
                style={{ color: "var(--es-primary)" }}
              >
                −{formatINR(discount)}
              </div>
            </div>
          )}

          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--es-bg-app)",
              border: "1px solid var(--es-border-subtle)",
              borderRadius: "var(--es-radius-md)",
            }}
          >
            <div className="es-metric-mini-label">Total Fees</div>
            <div className="es-metric-mini-value">{formatINR(totalAmount)}</div>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--es-success-bg)",
              border: "1px solid var(--es-success-border)",
              borderRadius: "var(--es-radius-md)",
            }}
          >
            <div className="es-metric-mini-label">Amount Paid</div>
            <div
              className="es-metric-mini-value"
              style={{ color: "var(--es-success)" }}
            >
              {formatINR(paidAmount)}
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor:
                outstandingBalance > 0
                  ? "var(--es-warning-bg)"
                  : "var(--es-bg-app)",
              border: `1px solid ${
                outstandingBalance > 0
                  ? "var(--es-warning-border)"
                  : "var(--es-border-subtle)"
              }`,
              borderRadius: "var(--es-radius-md)",
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
        </div>

        {/* Progress Track */}
        <div className="es-progress-track" style={{ height: 8 }}>
          <div
            className="es-progress-fill good"
            style={{ width: `${paidPct}%` }}
          />
        </div>
      </CardBody>
    </Card>
  );
}
