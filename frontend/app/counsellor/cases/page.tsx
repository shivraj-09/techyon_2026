"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
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
import { CaseStatusBadge } from "@/components/counsellor";
import { CASE_STATUSES, type CaseStatus } from "@/config/counsellor-data";
import { useCounsellorStore } from "@/config/counsellor-store";

export default function CounsellorCasesPage() {
  const router = useRouter();
  const { cases, privateNotes, sessions } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CaseStatus>("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.studentName.toLowerCase().includes(q) ||
        c.caseRef.toLowerCase().includes(q) ||
        c.sourceReferralRef.toLowerCase().includes(q) ||
        c.focusArea.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q)
      );
    });
  }, [cases, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: cases.length,
      open: cases.filter((c) => c.status === "Open" || c.status === "In Progress").length,
      onHold: cases.filter((c) => c.status === "On Hold").length,
      resolved: cases.filter((c) => c.status === "Resolved" || c.status === "Closed").length,
    }),
    [cases],
  );

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title="Confidential Counselling Cases"
          subtitle="Manage active student support cases created from accepted referrals. Case notes remain strictly restricted to the School Counsellor."
          actions={
            <Link href="/counsellor/referrals">
              <Button variant="secondary" leftIcon={<Icon name="inbox" size={15} />}>
                View Accepted Referrals
              </Button>
            </Link>
          }
        />

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Total Cases</div>
            <div className="es-stat-value">{counts.total}</div>
            <div className="es-stat-meta">From accepted referrals</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Open / In Progress</div>
            <div className="es-stat-value">{counts.open}</div>
            <div className="es-stat-meta">Active intervention plans</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">On Hold</div>
            <div className="es-stat-value">{counts.onHold}</div>
            <div className="es-stat-meta">Awaiting parent/term follow-up</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Resolved / Closed</div>
            <div className="es-stat-value">{counts.resolved}</div>
            <div className="es-stat-meta">Completed support cycle</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="cns-case-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search case ref, student, focus area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="cns-case-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | CaseStatus)
                }
                options={[
                  { value: "ALL", label: "All Case Statuses" },
                  ...CASE_STATUSES.map((s) => ({ value: s, label: s })),
                ]}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="shield"
                title="No counselling cases match"
                description="Cases are created exclusively from accepted teacher referrals."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Case Ref</TableHeaderCell>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Focus Area</TableHeaderCell>
                    <TableHeaderCell>Source Referral</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Notes / Sessions</TableHeaderCell>
                    <TableHeaderCell>Updated</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: "right" }}>
                      Action
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item) => {
                    const noteCount = privateNotes.filter(
                      (n) => n.caseId === item.id,
                    ).length;
                    const sesCount = sessions.filter(
                      (s) => s.caseId === item.id,
                    ).length;
                    return (
                      <TableRow
                        key={item.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push(`/counsellor/cases/${item.id}`)}
                      >
                        <TableCell>
                          <Badge variant="primary">{item.caseRef}</Badge>
                        </TableCell>
                        <TableCell>
                          <div style={{ fontWeight: 600 }}>{item.studentName}</div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--es-text-muted)",
                            }}
                          >
                            {item.className} · {item.studentCode}
                          </div>
                        </TableCell>
                        <TableCell>{item.focusArea}</TableCell>
                        <TableCell>
                          <Badge variant="neutral">{item.sourceReferralRef}</Badge>
                        </TableCell>
                        <TableCell>
                          <CaseStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: "0.8125rem", color: "var(--es-text-secondary)" }}>
                            {noteCount} private notes · {sesCount} sessions
                          </span>
                        </TableCell>
                        <TableCell>{item.updatedDate}</TableCell>
                        <TableCell style={{ textAlign: "right" }}>
                          <Link
                            href={`/counsellor/cases/${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              Open Case
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
