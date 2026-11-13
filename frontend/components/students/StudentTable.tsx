"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  EmptyState,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import type { StudentRecord } from "@/config/stage3-data";

export interface StudentTableProps {
  students: StudentRecord[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEditStudent: (student: StudentRecord) => void;
  onToggleStatus: (student: StudentRecord) => void;
  onDeleteStudent: (student: StudentRecord) => void;
  onClearFilters?: () => void;
}

export function StudentTable({
  students,
  currentPage,
  pageSize,
  onPageChange,
  onEditStudent,
  onToggleStatus,
  onDeleteStudent,
  onClearFilters,
}: StudentTableProps) {
  const totalItems = students.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedStudents = students.slice(startIndex, startIndex + pageSize);

  if (students.length === 0) {
    return (
      <EmptyState
        icon="graduation-cap"
        title="No matching student records"
        description="No students matched your current search or filter criteria. Try adjusting or clearing your filters."
        action={
          onClearFilters ? (
            <Button variant="secondary" size="sm" onClick={onClearFilters}>
              Clear all filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div>
      <Table style={{ border: "none", borderRadius: 0 }}>
        <TableHead>
          <tr>
            <TableHeaderCell>Student</TableHeaderCell>
            <TableHeaderCell>Student ID</TableHeaderCell>
            <TableHeaderCell>Class</TableHeaderCell>
            <TableHeaderCell>Gender</TableHeaderCell>
            <TableHeaderCell>Guardian</TableHeaderCell>
            <TableHeaderCell>Contact</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell style={{ textAlign: "right" }}>
              Actions
            </TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {paginatedStudents.map((stu) => {
            const primaryGuardian = stu.guardians[0];
            const isUnassigned =
              !stu.className || stu.className === "Unassigned";

            return (
              <TableRow key={stu.id}>
                {/* Student Name & Avatar */}
                <TableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Avatar name={stu.fullName} size="md" />
                    <div>
                      <Link
                        href={`/dashboard/students/${stu.id}`}
                        style={{
                          fontWeight: 600,
                          color: "var(--es-text-primary)",
                          textDecoration: "none",
                          fontSize: "13.5px",
                        }}
                      >
                        {stu.fullName}
                      </Link>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        Adm: {stu.admissionNumber}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Student ID */}
                <TableCell>
                  <code
                    style={{
                      fontFamily: "var(--es-font-mono)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--es-text-secondary)",
                      backgroundColor: "var(--es-bg-subtle)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {stu.studentId}
                  </code>
                </TableCell>

                {/* Class */}
                <TableCell>
                  {isUnassigned ? (
                    <Badge variant="warning">Unassigned</Badge>
                  ) : (
                    <Badge variant="primary">{stu.className}</Badge>
                  )}
                </TableCell>

                {/* Gender */}
                <TableCell>{stu.gender}</TableCell>

                {/* Guardian */}
                <TableCell>
                  {primaryGuardian ? (
                    <div>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--es-text-primary)",
                          fontSize: "13px",
                        }}
                      >
                        {primaryGuardian.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {primaryGuardian.relationship}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "var(--es-text-subtle)" }}>—</span>
                  )}
                </TableCell>

                {/* Contact */}
                <TableCell>
                  {primaryGuardian ? (
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--es-text-secondary)",
                        }}
                      >
                        {primaryGuardian.phone}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {primaryGuardian.email}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "var(--es-text-subtle)" }}>—</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={stu.status === "Active" ? "success" : "neutral"}
                    dot
                  >
                    {stu.status}
                  </Badge>
                </TableCell>

                {/* Actions: View / Edit / More */}
                <TableCell style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Link href={`/dashboard/students/${stu.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditStudent(stu)}
                    >
                      Edit
                    </Button>
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          type="button"
                          className="es-icon-btn"
                          aria-label={`More actions for ${stu.fullName}`}
                          title="More actions"
                        >
                          <Icon name="more-horizontal" size={16} />
                        </button>
                      }
                      items={[
                        {
                          id: "toggle-status",
                          label:
                            stu.status === "Active"
                              ? "Mark as Inactive"
                              : "Mark as Active",
                          icon: <Icon name="check-circle" size={14} />,
                          onClick: () => onToggleStatus(stu),
                        },
                        {
                          id: "delete",
                          label: "Remove Record",
                          icon: <Icon name="x" size={14} />,
                          danger: true,
                          dividerBefore: true,
                          onClick: () => onDeleteStudent(stu),
                        },
                      ]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderTop: "1px solid var(--es-border-subtle)",
          backgroundColor: "var(--es-bg-app)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
          Showing{" "}
          <strong style={{ color: "var(--es-text-primary)" }}>
            {startIndex + 1}
          </strong>{" "}
          to{" "}
          <strong style={{ color: "var(--es-text-primary)" }}>
            {Math.min(startIndex + pageSize, totalItems)}
          </strong>{" "}
          of{" "}
          <strong style={{ color: "var(--es-text-primary)" }}>
            {totalItems}
          </strong>{" "}
          entries
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === safePage ? "primary" : "secondary"}
              size="sm"
              onClick={() => onPageChange(page)}
              style={{ minWidth: "32px", padding: "0 8px" }}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
