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
import { formatINR, type FeeInvoiceRecord } from "@/config/fee-data";
import { FeeStatusBadge } from "./FeeStatusBadge";

export interface InvoiceTableProps {
  invoices: FeeInvoiceRecord[];
  onEditInvoice: (invoice: FeeInvoiceRecord) => void;
  onRecordPayment: (invoice: FeeInvoiceRecord) => void;
  externalSearch?: string;
  externalAcademicYear?: string;
}

const PAGE_SIZE = 7;

export function InvoiceTable({
  invoices,
  onEditInvoice,
  onRecordPayment,
  externalSearch = "",
  externalAcademicYear = "",
}: InvoiceTableProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const effectiveSearch = (search || externalSearch).trim().toLowerCase();
  const effectiveYear =
    yearFilter !== "all"
      ? yearFilter
      : externalAcademicYear && externalAcademicYear !== "all"
        ? externalAcademicYear
        : "all";

  const uniqueClasses = Array.from(
    new Set(invoices.map((inv) => inv.className)),
  ).sort();

  const filtered = invoices.filter((inv) => {
    if (effectiveSearch) {
      const matchesName = inv.studentName
        .toLowerCase()
        .includes(effectiveSearch);
      const matchesId = inv.invoiceId.toLowerCase().includes(effectiveSearch);
      const matchesCode = inv.studentCode
        .toLowerCase()
        .includes(effectiveSearch);
      if (!matchesName && !matchesId && !matchesCode) return false;
    }
    if (classFilter !== "all" && inv.className !== classFilter) return false;
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (effectiveYear !== "all" && inv.academicYear !== effectiveYear)
      return false;
    if (dateFrom && inv.invoiceDate < dateFrom) return false;
    if (dateTo && inv.invoiceDate > dateTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleClearFilters() {
    setSearch("");
    setClassFilter("all");
    setStatusFilter("all");
    setYearFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const hasFilters =
    Boolean(search) ||
    classFilter !== "all" ||
    statusFilter !== "all" ||
    yearFilter !== "all" ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Fee Invoices</CardTitle>
          <CardDescription>
            Showing {filtered.length} of {invoices.length} generated school
            invoices
          </CardDescription>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </CardHeader>

      {/* Filter Bar */}
      <div
        style={{
          padding: "12px 20px",
          backgroundColor: "var(--es-bg-app)",
          borderBottom: "1px solid var(--es-border-subtle)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
          gap: "10px",
          alignItems: "end",
        }}
      >
        <Input
          placeholder="Search student or Invoice ID..."
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
          aria-label="Filter by payment status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "Paid", label: "Paid" },
            { value: "Partial", label: "Partial" },
            { value: "Pending", label: "Pending" },
            { value: "Overdue", label: "Overdue" },
          ]}
        />

        <Select
          aria-label="Filter by academic year"
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All Academic Years" },
            { value: "2026-2027", label: "2026-2027" },
            { value: "2025-2026", label: "2025-2026" },
          ]}
        />

        <Input
          type="date"
          aria-label="Invoice date from"
          title="Invoice date from"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
        />

        <Input
          type="date"
          aria-label="Invoice date to"
          title="Invoice date to"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <CardBody flush>
        {paginated.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="No matching invoices found"
            description="Try adjusting your search query, class filter, or status filter."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </Button>
            }
          />
        ) : (
          <Table style={{ border: "none", borderRadius: 0 }}>
            <TableHead>
              <tr>
                <TableHeaderCell>Invoice ID</TableHeaderCell>
                <TableHeaderCell>Student</TableHeaderCell>
                <TableHeaderCell>Class</TableHeaderCell>
                <TableHeaderCell>Invoice Date</TableHeaderCell>
                <TableHeaderCell>Due Date</TableHeaderCell>
                <TableHeaderCell>Total Amount</TableHeaderCell>
                <TableHeaderCell>Paid</TableHeaderCell>
                <TableHeaderCell>Balance</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {paginated.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="es-table-cell-primary">
                    <Link
                      href={`/dashboard/fees/invoices/${inv.id}`}
                      style={{
                        color: "var(--es-primary)",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      {inv.invoiceId}
                    </Link>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--es-text-muted)",
                        fontWeight: 400,
                      }}
                    >
                      {inv.category}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Avatar name={inv.studentName} size="sm" />
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "var(--es-text-primary)",
                          }}
                        >
                          {inv.studentName}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          {inv.studentCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{inv.className}</TableCell>
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
                    style={{ color: "var(--es-success)", fontWeight: 500 }}
                  >
                    {formatINR(inv.paidAmount)}
                  </TableCell>
                  <TableCell
                    style={{
                      color:
                        inv.balanceAmount > 0
                          ? "var(--es-warning)"
                          : "var(--es-text-muted)",
                      fontWeight: inv.balanceAmount > 0 ? 600 : 400,
                    }}
                  >
                    {formatINR(inv.balanceAmount)}
                  </TableCell>
                  <TableCell>
                    <FeeStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Link href={`/dashboard/fees/invoices/${inv.id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditInvoice(inv)}
                      >
                        Edit
                      </Button>
                      {inv.balanceAmount > 0 && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onRecordPayment(inv)}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
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
            ({filtered.length} invoices)
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
