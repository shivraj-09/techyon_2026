"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import {
  formatINR,
  type FeeInvoiceRecord,
  type FeePaymentRecord,
} from "@/config/fee-data";
import { FeeStatusBadge } from "./FeeStatusBadge";
import { PaymentSummaryCard } from "./PaymentSummaryCard";

export interface InvoiceDetailsProps {
  invoice: FeeInvoiceRecord;
  payments: FeePaymentRecord[];
  onRecordPayment: () => void;
  onEditInvoice: () => void;
  onPrintInvoice: () => void;
  onDownloadInvoice: () => void;
}

export function InvoiceDetails({
  invoice,
  payments,
  onRecordPayment,
  onEditInvoice,
  onPrintInvoice,
  onDownloadInvoice,
}: InvoiceDetailsProps) {
  const associatedPayments = payments.filter(
    (p) => p.invoiceId === invoice.invoiceId,
  );

  return (
    <div className="es-stack">
      {/* Invoice Header Card */}
      <Card>
        <CardBody>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Avatar name={invoice.studentName} size="lg" />
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "19px",
                      fontWeight: 700,
                      margin: 0,
                      color: "var(--es-text-primary)",
                    }}
                  >
                    {invoice.invoiceId} — {invoice.title}
                  </h2>
                  <FeeStatusBadge status={invoice.status} />
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--es-text-muted)",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    Student:{" "}
                    <Link
                      href={`/dashboard/students/${invoice.studentId}`}
                      style={{
                        color: "var(--es-primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {invoice.studentName}
                    </Link>{" "}
                    ({invoice.studentCode})
                  </span>
                  <span>·</span>
                  <span>Class: {invoice.className}</span>
                  <span>·</span>
                  <span>Guardian: {invoice.guardianName}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="secondary"
                size="md"
                onClick={onPrintInvoice}
              >
                Print Invoice
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="download" size={14} />}
                onClick={onDownloadInvoice}
              >
                Download Invoice
              </Button>
              <Button variant="secondary" size="md" onClick={onEditInvoice}>
                Edit Invoice
              </Button>
              {invoice.balanceAmount > 0 && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Icon name="plus" size={15} />}
                  onClick={onRecordPayment}
                >
                  Record Payment
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Financial Summary */}
      <PaymentSummaryCard
        title="Financial Summary"
        originalAmount={invoice.originalAmount}
        discount={invoice.discount}
        totalAmount={invoice.totalAmount}
        paidAmount={invoice.paidAmount}
        outstandingBalance={invoice.balanceAmount}
      />

      {/* Invoice Summary Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
          <Badge variant="neutral">{invoice.academicYear}</Badge>
        </CardHeader>
        <CardBody>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              fontSize: "13.5px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                Invoice Date
              </div>
              <div style={{ fontWeight: 600, marginTop: "3px" }}>
                {invoice.invoiceDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                Payment Due Date
              </div>
              <div
                style={{
                  fontWeight: 600,
                  marginTop: "3px",
                  color:
                    invoice.status === "Overdue"
                      ? "var(--es-danger)"
                      : undefined,
                }}
              >
                {invoice.dueDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                Academic Year
              </div>
              <div style={{ fontWeight: 600, marginTop: "3px" }}>
                {invoice.academicYear}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                Fee Category
              </div>
              <div style={{ fontWeight: 600, marginTop: "3px" }}>
                {invoice.category}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                Description
              </div>
              <div
                style={{
                  marginTop: "3px",
                  color: "var(--es-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {invoice.description ||
                  `Standard ${invoice.category.toLowerCase()} assessment for ${invoice.className} (${invoice.academicYear}).`}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Associated Payment History */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Associated Payment History</CardTitle>
            <CardDescription>
              All payments recorded against invoice {invoice.invoiceId}
            </CardDescription>
          </div>
          {invoice.balanceAmount > 0 && (
            <Button variant="primary" size="sm" onClick={onRecordPayment}>
              Record Payment
            </Button>
          )}
        </CardHeader>
        <CardBody flush>
          {associatedPayments.length === 0 ? (
            <EmptyState
              icon="credit-card"
              title="No payments recorded for this invoice yet"
              description="Click Record Payment to log a full or partial fee receipt."
              action={
                <Button variant="primary" size="sm" onClick={onRecordPayment}>
                  Record First Payment
                </Button>
              }
            />
          ) : (
            <Table style={{ border: "none", borderRadius: 0 }}>
              <TableHead>
                <tr>
                  <TableHeaderCell>Payment ID</TableHeaderCell>
                  <TableHeaderCell>Payment Date</TableHeaderCell>
                  <TableHeaderCell>Amount Paid</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Transaction Ref</TableHeaderCell>
                  <TableHeaderCell>Recorded By</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {associatedPayments.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell className="es-table-cell-primary">
                      {pay.paymentId}
                    </TableCell>
                    <TableCell>{pay.paymentDate}</TableCell>
                    <TableCell
                      style={{ color: "var(--es-success)", fontWeight: 700 }}
                    >
                      {formatINR(pay.amountPaid)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{pay.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: "var(--es-font-mono)",
                        fontSize: "12px",
                      }}
                    >
                      {pay.transactionRef || "—"}
                    </TableCell>
                    <TableCell>{pay.recordedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
