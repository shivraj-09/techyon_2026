"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
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
  formatINR,
  type StudentOutstandingBalanceRecord,
} from "@/config/fee-data";
import { FeeStatusBadge } from "./FeeStatusBadge";

export interface OutstandingBalanceTableProps {
  balances: StudentOutstandingBalanceRecord[];
  onRecordPaymentForInvoiceId: (invoiceId: string) => void;
}

const PAGE_SIZE = 7;

export function OutstandingBalanceTable({
  balances,
  onRecordPaymentForInvoiceId,
}: OutstandingBalanceTableProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [overdueFilter, setOverdueFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);

  const uniqueClasses = Array.from(
    new Set(balances.map((b) => b.className)),
  ).sort();

  const filtered = balances
    .filter((item) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchStudent = item.studentName.toLowerCase().includes(q);
        const matchCode = item.studentCode.toLowerCase().includes(q);
        const matchGuardian = item.guardianName.toLowerCase().includes(q);
        if (!matchStudent && !matchCode && !matchGuardian) return false;
      }
      if (classFilter !== "all" && item.className !== classFilter) return false;
      if (overdueFilter === "overdue" && item.status !== "Overdue")
        return false;
      if (overdueFilter === "partial" && item.status !== "Partial")
        return false;
      return true;
    })
    .sort((a, b) =>
      sortOrder === "desc"
        ? b.outstandingBalance - a.outstandingBalance
        : a.outstandingBalance - b.outstandingBalance,
    );

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
          <CardTitle>Students with Pending Fee Balances</CardTitle>
          <CardDescription>
            Monitor outstanding dues, guardian contacts, and overdue deadlines
          </CardDescription>
        </div>
      </CardHeader>

      <div
        style={{
          padding: "12px 20px",
          backgroundColor: "var(--es-bg-app)",
          borderBottom: "1px solid var(--es-border-subtle)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "10px",
        }}
      >
        <Input
          placeholder="Search student, ID, guardian..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Icon name="search" size={14} />}
        />

        <Select
          aria-label="Filter by class"
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All Classes" },
            ...uniqueClasses.map((c) => ({ value: c, label: c })),
          ]}
        />

        <Select
          aria-label="Filter by overdue status"
          value={overdueFilter}
          onChange={(e) => {
            setOverdueFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All Pending Balances" },
            { value: "overdue", label: "Overdue Only" },
            { value: "partial", label: "Partially Paid Only" },
          ]}
        />

        <Select
          aria-label="Sort by balance"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
          options={[
            { value: "desc", label: "Sort: Highest Balance First" },
            { value: "asc", label: "Sort: Lowest Balance First" },
          ]}
        />
      </div>

      <CardBody flush>
        {paginated.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title="No outstanding balances match your filters"
            description="All matching student fee accounts are settled or outside the selected criteria."
          />
        ) : (
          <Table style={{ border: "none", borderRadius: 0 }}>
            <TableHead>
              <tr>
                <TableHeaderCell>Student Name</TableHeaderCell>
                <TableHeaderCell>Student ID</TableHeaderCell>
                <TableHeaderCell>Class</TableHeaderCell>
                <TableHeaderCell>Guardian</TableHeaderCell>
                <TableHeaderCell>Total Fees</TableHeaderCell>
                <TableHeaderCell>Amount Paid</TableHeaderCell>
                <TableHeaderCell>Outstanding Balance</TableHeaderCell>
                <TableHeaderCell>Due Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {paginated.map((row) => {
                const isOverdue = row.status === "Overdue";
                return (
                  <TableRow
                    key={row.studentId}
                    style={
                      isOverdue
                        ? { backgroundColor: "var(--es-row-danger-tint)" }
                        : undefined
                    }
                  >
                    <TableCell className="es-table-cell-primary">
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Avatar name={row.studentName} size="sm" />
                        <Link
                          href={`/dashboard/students/${row.studentId}`}
                          style={{
                            color: "var(--es-text-primary)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          {row.studentName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{row.studentCode}</TableCell>
                    <TableCell>{row.className}</TableCell>
                    <TableCell>
                      <div>{row.guardianName}</div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {row.guardianPhone}
                      </div>
                    </TableCell>
                    <TableCell>{formatINR(row.totalFees)}</TableCell>
                    <TableCell style={{ color: "var(--es-success)" }}>
                      {formatINR(row.amountPaid)}
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: 700,
                        color: isOverdue
                          ? "var(--es-danger)"
                          : "var(--es-warning)",
                      }}
                    >
                      {formatINR(row.outstandingBalance)}
                    </TableCell>
                    <TableCell
                      style={{
                        color: isOverdue ? "var(--es-danger)" : undefined,
                        fontWeight: isOverdue ? 600 : 400,
                      }}
                    >
                      {row.dueDate}
                    </TableCell>
                    <TableCell>
                      <FeeStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            onRecordPaymentForInvoiceId(row.primaryInvoiceId)
                          }
                        >
                          Record Payment
                        </Button>
                        <Link
                          href={`/dashboard/fees/invoices/${row.primaryInvoiceId}`}
                        >
                          <Button variant="secondary" size="sm">
                            Invoice
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardBody>

      {filtered.length > 0 && (
        <CardFooter>
          <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>{" "}
            ({filtered.length} student accounts)
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
