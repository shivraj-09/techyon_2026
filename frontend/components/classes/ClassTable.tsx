"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import type { ClassRecord } from "@/config/stage3-data";

export interface ClassTableProps {
  classes: ClassRecord[];
  onEdit: (classItem: ClassRecord) => void;
  onDelete: (classItem: ClassRecord) => void;
}

export function ClassTable({ classes, onEdit, onDelete }: ClassTableProps) {
  return (
    <Table style={{ border: "none", borderRadius: 0 }}>
      <TableHead>
        <tr>
          <TableHeaderCell>Class Name</TableHeaderCell>
          <TableHeaderCell>Section</TableHeaderCell>
          <TableHeaderCell>Academic Year</TableHeaderCell>
          <TableHeaderCell>Enrolled Students</TableHeaderCell>
          <TableHeaderCell>Class Teacher</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell style={{ textAlign: "right" }}>
            Actions
          </TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {classes.map((item) => {
          const isUnassigned =
            !item.classTeacher || item.classTeacher === "Unassigned";

          return (
            <TableRow key={item.id}>
              <TableCell className="es-table-cell-primary">
                <Link
                  href={`/dashboard/classes/${item.id}`}
                  style={{
                    color: "var(--es-text-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                </Link>
              </TableCell>
              <TableCell>Section {item.section}</TableCell>
              <TableCell>{item.academicYear}</TableCell>
              <TableCell>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--es-text-primary)",
                  }}
                >
                  {item.enrolledCount}
                </span>{" "}
                <span
                  style={{ fontSize: "12px", color: "var(--es-text-muted)" }}
                >
                  / {item.capacity} Students
                </span>
              </TableCell>
              <TableCell>
                {isUnassigned ? (
                  <Badge variant="warning">Unassigned</Badge>
                ) : (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Avatar name={item.classTeacher} size="sm" />
                    <span
                      style={{
                        color: "var(--es-text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {item.classTeacher}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={item.status === "Active" ? "success" : "neutral"}
                  dot
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    justifyContent: "flex-end",
                  }}
                >
                  <Link href={`/dashboard/classes/${item.id}`}>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: "var(--es-danger)" }}
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
