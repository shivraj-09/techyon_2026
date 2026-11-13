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
  EmptyState,
  Icon,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Toast,
} from "@/components/ui";
import { FeeStatusBadge, PaymentSummaryCard } from "@/components/fees";
import {
  formatINR,
  type FeeInvoiceRecord,
  type FeePaymentRecord,
} from "@/config/fee-data";
import { PARENT_PAYMENTS } from "@/config/parent-data";

export interface ParentInvoiceTableProps {
  invoices: FeeInvoiceRecord[];
  payments?: FeePaymentRecord[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ParentInvoiceTable({
  invoices,
  payments = PARENT_PAYMENTS,
  emptyTitle = "No fee invoices found",
  emptyDescription = "There are no fee invoices recorded for this selection.",
}: ParentInvoiceTableProps) {
  const [selectedInvoice, setSelectedInvoice] =
    useState<FeeInvoiceRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const invoicePayments = selectedInvoice
    ? payments.filter((p) => p.invoiceId === selectedInvoice.invoiceId)
    : [];

  function handlePrintPlaceholder(invoice: FeeInvoiceRecord) {
    setToast({
      title: `Print preview ready — ${invoice.invoiceId}`,
      description:
        "Formatted parent fee receipt is ready for printing (UI preview).",
    });
  }

  function handleDownloadPlaceholder(invoice: FeeInvoiceRecord) {
    setToast({
      title: `Invoice PDF prepared — ${invoice.invoiceId}`,
      description: `${invoice.invoiceId}_${invoice.studentName.replace(/\s+/g, "_")}.pdf download queued (UI preview).`,
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Fee Invoices</CardTitle>
            <CardDescription>
              Read-only view of issued fee invoices ({invoices.length})
            </CardDescription>
          </div>
          <Badge variant="neutral">Read-Only View</Badge>
        </CardHeader>

        <CardBody flush>
          {invoices.length === 0 ? (
            <EmptyState
              icon="file-text"
              title={emptyTitle}
              description={emptyDescription}
            />
          ) : (
            <Table style={{ border: "none", borderRadius: 0 }}>
              <TableHead>
                <tr>
                  <TableHeaderCell>Invoice ID</TableHeaderCell>
                  <TableHeaderCell>Student</TableHeaderCell>
                  <TableHeaderCell>Fee Category</TableHeaderCell>
                  <TableHeaderCell>Invoice Date</TableHeaderCell>
                  <TableHeaderCell>Due Date</TableHeaderCell>
                  <TableHeaderCell>Total Amount</TableHeaderCell>
                  <TableHeaderCell>Amount Paid</TableHeaderCell>
                  <TableHeaderCell>Balance</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: "right" }}>
                    Actions
                  </TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="es-table-cell-primary">
                      <span style={{ fontFamily: "var(--es-font-mono)" }}>
                        {inv.invoiceId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontWeight: 600 }}>{inv.studentName}</div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {inv.className}
                      </div>
                    </TableCell>
                    <TableCell>{inv.category}</TableCell>
                    <TableCell>{inv.invoiceDate}</TableCell>
                    <TableCell
                      style={{
                        color:
                          inv.status === "Overdue"
                            ? "var(--es-danger)"
                            : undefined,
                        fontWeight: inv.status === "Overdue" ? 600 : 400,
                      }}
                    >
                      {inv.dueDate}
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>
                      {formatINR(inv.totalAmount)}
                    </TableCell>
                    <TableCell
                      style={{ color: "var(--es-success)", fontWeight: 600 }}
                    >
                      {formatINR(inv.paidAmount)}
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: 700,
                        color:
                          inv.balanceAmount > 0
                            ? "var(--es-warning)"
                            : "var(--es-text-muted)",
                      }}
                    >
                      {formatINR(inv.balanceAmount)}
                    </TableCell>
                    <TableCell>
                      <FeeStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell style={{ textAlign: "right" }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Read-Only Invoice Details Modal */}
      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={
          selectedInvoice
            ? `${selectedInvoice.invoiceId} — ${selectedInvoice.title}`
            : "Invoice Details"
        }
        description={
          selectedInvoice
            ? `${selectedInvoice.studentName} (${selectedInvoice.studentCode}) · ${selectedInvoice.className} · ${selectedInvoice.academicYear}`
            : undefined
        }
        footer={
          selectedInvoice ? (
            <>
              <Button
                variant="secondary"
                onClick={() => handlePrintPlaceholder(selectedInvoice)}
              >
                Print Invoice
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Icon name="download" size={14} />}
                onClick={() => handleDownloadPlaceholder(selectedInvoice)}
              >
                Download Invoice
              </Button>
              <Button
                variant="primary"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedInvoice && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <FeeStatusBadge status={selectedInvoice.status} />
              <span
                style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
              >
                Category: <strong>{selectedInvoice.category}</strong>
              </span>
            </div>

            <PaymentSummaryCard
              title="Invoice Breakdown"
              originalAmount={selectedInvoice.originalAmount}
              discount={selectedInvoice.discount}
              totalAmount={selectedInvoice.totalAmount}
              paidAmount={selectedInvoice.paidAmount}
              outstandingBalance={selectedInvoice.balanceAmount}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "var(--es-radius-md)",
                backgroundColor: "var(--es-bg-app)",
                border: "1px solid var(--es-border-subtle)",
                fontSize: "12.5px",
              }}
            >
              <div>
                <div style={{ color: "var(--es-text-muted)" }}>
                  Invoice Date
                </div>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>
                  {selectedInvoice.invoiceDate}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--es-text-muted)" }}>Due Date</div>
                <div
                  style={{
                    fontWeight: 600,
                    marginTop: "2px",
                    color:
                      selectedInvoice.status === "Overdue"
                        ? "var(--es-danger)"
                        : undefined,
                  }}
                >
                  {selectedInvoice.dueDate}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--es-text-muted)" }}>Guardian</div>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>
                  {selectedInvoice.guardianName}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ color: "var(--es-text-muted)" }}>Description</div>
                <div
                  style={{
                    marginTop: "2px",
                    color: "var(--es-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {selectedInvoice.description ||
                    `${selectedInvoice.category} for ${selectedInvoice.className} (${selectedInvoice.academicYear}).`}
                </div>
              </div>
            </div>

            {/* Associated Payment History */}
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--es-text-primary)",
                  marginBottom: "8px",
                }}
              >
                Payment History ({invoicePayments.length})
              </div>
              {invoicePayments.length === 0 ? (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--es-radius-md)",
                    border: "1px solid var(--es-border-subtle)",
                    backgroundColor: "var(--es-bg-app)",
                    fontSize: "12.5px",
                    color: "var(--es-text-muted)",
                  }}
                >
                  No payments have been recorded against this invoice yet.
                </div>
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Payment ID</TableHeaderCell>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell>Amount</TableHeaderCell>
                      <TableHeaderCell>Method</TableHeaderCell>
                      <TableHeaderCell>Reference</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {invoicePayments.map((pay) => (
                      <TableRow key={pay.id}>
                        <TableCell className="es-table-cell-primary">
                          {pay.paymentId}
                        </TableCell>
                        <TableCell>{pay.paymentDate}</TableCell>
                        <TableCell
                          style={{
                            color: "var(--es-success)",
                            fontWeight: 700,
                          }}
                        >
                          {formatINR(pay.amountPaid)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral">{pay.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell
                          style={{
                            fontFamily: "var(--es-font-mono)",
                            fontSize: "11.5px",
                          }}
                        >
                          {pay.transactionRef || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="info"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}
