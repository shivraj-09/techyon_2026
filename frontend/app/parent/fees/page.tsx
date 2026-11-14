"use client";

import React, { useMemo, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
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
import { ChildSelector, ParentInvoiceTable } from "@/components/parent";
import { formatINR } from "@/config/fee-data";
import {
  PARENT_CHILDREN,
  PARENT_INVOICES,
  PARENT_PAYMENTS,
} from "@/config/parent-data";

export default function ParentFeesPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("all");

  const selectedChild = useMemo(
    () =>
      selectedChildId === "all"
        ? null
        : (PARENT_CHILDREN.find((c) => c.id === selectedChildId) ?? null),
    [selectedChildId],
  );

  const filteredInvoices = useMemo(
    () =>
      selectedChild
        ? PARENT_INVOICES.filter((inv) => inv.studentId === selectedChild.id)
        : PARENT_INVOICES,
    [selectedChild],
  );

  const filteredPayments = useMemo(
    () =>
      selectedChild
        ? PARENT_PAYMENTS.filter((pay) => pay.studentId === selectedChild.id)
        : PARENT_PAYMENTS,
    [selectedChild],
  );

  const summary = useMemo(() => {
    if (selectedChild) {
      return {
        totalFees: selectedChild.totalFees,
        amountPaid: selectedChild.amountPaid,
        outstandingBalance: selectedChild.outstandingBalance,
        nextDueDate: selectedChild.nextDueDate,
      };
    }

    const totalFees = PARENT_CHILDREN.reduce((sum, c) => sum + c.totalFees, 0);
    const amountPaid = PARENT_CHILDREN.reduce(
      (sum, c) => sum + c.amountPaid,
      0,
    );
    const outstandingBalance = PARENT_CHILDREN.reduce(
      (sum, c) => sum + c.outstandingBalance,
      0,
    );
    const hasPending = outstandingBalance > 0;
    return {
      totalFees,
      amountPaid,
      outstandingBalance,
      nextDueDate: hasPending ? "25 Nov 2026" : "No dues pending",
    };
  }, [selectedChild]);

  const feeSummaryCards = [
    {
      label: "Total Fees",
      value: formatINR(summary.totalFees),
      icon: "indian-rupee" as const,
      color: "var(--es-primary)",
      bg: "var(--es-primary-subtle)",
      border: "var(--es-primary-border)",
    },
    {
      label: "Amount Paid",
      value: formatINR(summary.amountPaid),
      icon: "check-circle" as const,
      color: "var(--es-success)",
      bg: "var(--es-success-bg)",
      border: "var(--es-success-border)",
    },
    {
      label: "Outstanding Balance",
      value: formatINR(summary.outstandingBalance),
      icon: "wallet" as const,
      color:
        summary.outstandingBalance > 0
          ? "var(--es-warning)"
          : "var(--es-success)",
      bg:
        summary.outstandingBalance > 0
          ? "var(--es-warning-bg)"
          : "var(--es-success-bg)",
      border:
        summary.outstandingBalance > 0
          ? "var(--es-warning-border)"
          : "var(--es-success-border)",
    },
    {
      label: "Next Due Date",
      value: summary.nextDueDate,
      icon: "calendar" as const,
      color: "var(--es-text-primary)",
      bg: "var(--es-bg-subtle)",
      border: "var(--es-border)",
    },
  ];

  return (
    <AppLayout
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "Fee Details" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Fee Details"
          subtitle="View invoices, payments and outstanding balances for your children."
          actions={<Badge variant="neutral">Read-Only Ledger</Badge>}
        />

        <ChildSelector
          childrenList={PARENT_CHILDREN}
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
          includeAllOption
          allLabel="All Children"
          label="Filter By Child:"
        />

        {/* 4 Fee Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {feeSummaryCards.map((card) => (
            <Card key={card.label}>
              <CardBody
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--es-text-muted)",
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: card.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {card.value}
                  </div>
                </div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "var(--es-radius-md)",
                    backgroundColor: card.bg,
                    border: `1px solid ${card.border}`,
                    color: card.color,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={card.icon} size={18} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Read-Only Invoices Table + View Invoice Modal */}
        <ParentInvoiceTable
          invoices={filteredInvoices}
          payments={filteredPayments}
          emptyTitle="No invoices for this selection"
          emptyDescription="There are no fee invoices associated with the selected child."
        />

        {/* Read-Only Payment History Table */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                {selectedChild
                  ? `Recorded payments for ${selectedChild.fullName} (${filteredPayments.length})`
                  : `Recorded fee payments across all linked children (${filteredPayments.length})`}
              </CardDescription>
            </div>
            <Badge variant="neutral">Read-Only</Badge>
          </CardHeader>
          <CardBody flush>
            {filteredPayments.length === 0 ? (
              <EmptyState
                icon="credit-card"
                title="No payments found"
                description="Fee payment receipts will appear here once recorded by school accounts."
              />
            ) : (
              <Table style={{ border: "none", borderRadius: 0 }}>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Payment ID</TableHeaderCell>
                    <TableHeaderCell>Invoice ID</TableHeaderCell>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Payment Date</TableHeaderCell>
                    <TableHeaderCell>Method</TableHeaderCell>
                    <TableHeaderCell>Reference</TableHeaderCell>
                    <TableHeaderCell>Amount Paid</TableHeaderCell>
                    <TableHeaderCell>Remarks</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredPayments.map((pay) => (
                    <TableRow key={pay.id}>
                      <TableCell className="es-table-cell-primary">
                        <span style={{ fontFamily: "var(--es-font-mono)" }}>
                          {pay.paymentId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontFamily: "var(--es-font-mono)" }}>
                          {pay.invoiceId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{pay.studentName}</div>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          {pay.className}
                        </div>
                      </TableCell>
                      <TableCell>{pay.paymentDate}</TableCell>
                      <TableCell>{pay.paymentMethod}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            fontFamily: "var(--es-font-mono)",
                            fontSize: "12px",
                          }}
                        >
                          {pay.transactionRef}
                        </span>
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: "var(--es-success)" }}
                      >
                        {formatINR(pay.amountPaid)}
                      </TableCell>
                      <TableCell>{pay.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}

