"use client";

import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import {
  PAYMENT_METHODS,
  formatINR,
  type FeePaymentRecord,
} from "@/config/fee-data";

export interface PaymentHistoryTableProps {
  payments: FeePaymentRecord[];
  onSelectPayment: (payment: FeePaymentRecord) => void;
}

const PAGE_SIZE = 7;

export function PaymentHistoryTable({
  payments,
  onSelectPayment,
}: PaymentHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = payments.filter((p) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchStudent = p.studentName.toLowerCase().includes(q);
      const matchPayId = p.paymentId.toLowerCase().includes(q);
      const matchInvId = p.invoiceId.toLowerCase().includes(q);
      const matchRef = (p.transactionRef || "").toLowerCase().includes(q);
      if (!matchStudent && !matchPayId && !matchInvId && !matchRef) return false;
    }
    if (methodFilter !== "all" && p.paymentMethod !== methodFilter)
      return false;
    if (dateFilter && p.paymentDate !== dateFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Complete log of fee receipts, payment methods, and transaction
            references
          </CardDescription>
        </div>
      </CardHeader>

      <div
        style={{
          padding: "12px 20px",
          backgroundColor: "var(--es-bg-app)",
          borderBottom: "1px solid var(--es-border-subtle)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        <Input
          placeholder="Search Payment ID, Invoice ID, student..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Icon name="search" size={14} />}
        />

        <Select
          aria-label="Filter by payment method"
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All Payment Methods" },
            ...PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
          ]}
        />

        <Input
          type="date"
          aria-label="Filter by payment date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <CardBody flush>
        {paginated.length === 0 ? (
          <EmptyState
            icon="credit-card"
            title="No payment transactions found"
            description="No recorded payments match your current search or filter criteria."
          />
        ) : (
          <Table style={{ border: "none", borderRadius: 0 }}>
            <TableHead>
              <tr>
                <TableHeaderCell>Payment ID</TableHeaderCell>
                <TableHeaderCell>Invoice ID</TableHeaderCell>
                <TableHeaderCell>Student</TableHeaderCell>
                <TableHeaderCell>Amount Paid</TableHeaderCell>
                <TableHeaderCell>Payment Date</TableHeaderCell>
                <TableHeaderCell>Payment Method</TableHeaderCell>
                <TableHeaderCell>Transaction Reference</TableHeaderCell>
                <TableHeaderCell>Recorded By</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {paginated.map((pay) => (
                <TableRow
                  key={pay.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectPayment(pay)}
                >
                  <TableCell className="es-table-cell-primary">
                    {pay.paymentId}
                  </TableCell>
                  <TableCell>{pay.invoiceId}</TableCell>
                  <TableCell>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Avatar name={pay.studentName} size="sm" />
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "var(--es-text-primary)",
                          }}
                        >
                          {pay.studentName}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          {pay.className}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    style={{ color: "var(--es-success)", fontWeight: 700 }}
                  >
                    {formatINR(pay.amountPaid)}
                  </TableCell>
                  <TableCell>{pay.paymentDate}</TableCell>
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
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPayment(pay);
                      }}
                    >
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBody>

      {filtered.length > 0 && (
        <CardFooter>
          <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>{" "}
            ({filtered.length} payments)
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
