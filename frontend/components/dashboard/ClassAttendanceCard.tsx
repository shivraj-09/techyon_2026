
"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import { CLASS_WISE_ATTENDANCE } from "@/config/admin-dashboard-data";

export function ClassAttendanceCard() {
  function getStatusMeta(pct: number): {
    barClass: "good" | "moderate" | "low";
    badgeVariant: "success" | "warning" | "danger";
  } {
    if (pct >= 95) {
      return { barClass: "good", badgeVariant: "success" };
    }
    if (pct >= 91) {
      return { barClass: "moderate", badgeVariant: "warning" };
    }
    return { barClass: "low", badgeVariant: "danger" };
  }

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div>
          <CardTitle>Class-wise Attendance</CardTitle>
          <CardDescription>
            Today&apos;s section attendance breakdown across grades
          </CardDescription>
        </div>
        <Link href="/dashboard/attendance">
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<Icon name="chevron-right" size={14} />}
          >
            All Sections
          </Button>
        </Link>
      </CardHeader>

      <CardBody flush style={{ flex: 1 }}>
        <Table style={{ border: "none", borderRadius: 0 }}>
          <TableHead>
            <tr>
              <TableHeaderCell>Class</TableHeaderCell>
              <TableHeaderCell>Total Students</TableHeaderCell>
              <TableHeaderCell>Present</TableHeaderCell>
              <TableHeaderCell>Absent</TableHeaderCell>
              <TableHeaderCell>Attendance</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {CLASS_WISE_ATTENDANCE.map((row) => {
              const { barClass, badgeVariant } = getStatusMeta(
                row.attendancePct,
              );
              return (
                <TableRow key={row.className}>
                  <TableCell className="es-table-cell-primary">
                    {row.className}
                  </TableCell>
                  <TableCell>{row.totalStudents}</TableCell>
                  <TableCell
                    style={{ color: "var(--es-success)", fontWeight: 500 }}
                  >
                    {row.present}
                  </TableCell>
                  <TableCell
                    style={{
                      color:
                        row.absent >= 4
                          ? "var(--es-danger)"
                          : "var(--es-text-secondary)",
                      fontWeight: row.absent >= 4 ? 600 : 400,
                    }}
                  >
                    {row.absent}
                  </TableCell>
                  <TableCell>
                    <div className="es-progress-cell">
                      <div
                        className="es-progress-track"
                        aria-label={`${row.attendancePct}% attendance`}
                      >
                        <div
                          className={`es-progress-fill ${barClass}`}
                          style={{ width: `${row.attendancePct}%` }}
                        />
                      </div>
                      <Badge variant={badgeVariant} dot>
                        {row.attendancePct.toFixed(1)}%
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
