"use client";

import React from "react";
import { Badge, Button, Icon, Modal } from "@/components/ui";
import { formatINR, type FeePaymentRecord } from "@/config/fee-data";

export interface PaymentDetailsProps {
  payment: FeePaymentRecord | null;
  onClose: () => void;
  onPrintReceipt?: (payment: FeePaymentRecord) => void;
}

export function PaymentDetails({
  payment,
  onClose,
  onPrintReceipt,
}: PaymentDetailsProps) {
  if (!payment) return null;

  return (
    <Modal
      isOpen={Boolean(payment)}
      onClose={onClose}
      title={`Payment Receipt — ${payment.paymentId}`}
      description={`Recorded on ${payment.paymentDate} by ${payment.recordedBy}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            leftIcon={<Icon name="download" size={14} />}
            onClick={() => onPrintReceipt?.(payment)}
          >
            Download Receipt
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div
          style={{
            padding: "14px 16px",
            backgroundColor: "var(--es-success-bg)",
            border: "1px solid var(--es-success-border)",
            borderRadius: "var(--es-radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "var(--es-success)",
                textTransform: "uppercase",
              }}
            >
              Amount Received
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--es-success)",
                marginTop: "2px",
              }}
            >
              {formatINR(payment.amountPaid)}
            </div>
          </div>
          <Badge variant="success" dot>
            Verified Receipt
          </Badge>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            fontSize: "13px",
          }}
        >
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Payment ID
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.paymentId}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Invoice Reference
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.invoiceId}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Student Name
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.studentName} ({payment.studentCode})
            </div>
          </div>
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Class & Section
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.className}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Payment Method
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.paymentMethod}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Transaction Reference
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.transactionRef || "N/A (Cash Counter)"}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Payment Date
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.paymentDate}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--es-text-muted)", fontSize: "11.5px" }}>
              Recorded By
            </div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>
              {payment.recordedBy}
            </div>
          </div>
        </div>

        {payment.remarks && (
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--es-bg-app)",
              border: "1px solid var(--es-border-subtle)",
              borderRadius: "var(--es-radius-sm)",
              fontSize: "12.5px",
              color: "var(--es-text-secondary)",
            }}
          >
            <strong>Remarks:</strong> {payment.remarks}
          </div>
        )}
      </div>
    </Modal>
  );
}
