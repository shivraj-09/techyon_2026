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
import {
  ReferralPriorityBadge,
  ReferralStatusBadge,
} from "@/components/counsellor";
import {
  REFERRAL_PRIORITIES,
  type ReferralPriority,
  type ReferralStatus,
} from "@/config/counsellor-data";
import { useCounsellorStore } from "@/config/counsellor-store";

const PRIORITY_RANK: Record<ReferralPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export default function CounsellorReferralsPage() {
  const router = useRouter();
  const { referrals } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReferralStatus>(
    "ALL",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | ReferralPriority
  >("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">(
    "newest",
  );

  const classOptions = useMemo(
    () =>
      Array.from(new Set(referrals.map((r) => r.className))).sort(),
    [referrals],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = referrals.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && r.priority !== priorityFilter)
        return false;
      if (classFilter !== "ALL" && r.className !== classFilter) return false;
      if (!q) return true;
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.referralRef.toLowerCase().includes(q) ||
        r.submittedByTeacherName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "priority") {
        return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      }
      if (sortBy === "oldest") {
        return a.submittedDate.localeCompare(b.submittedDate);
      }
      return b.submittedDate.localeCompare(a.submittedDate);
    });
  }, [referrals, search, statusFilter, priorityFilter, classFilter, sortBy]);

  const counts = useMemo(
    () => ({
      submitted: referrals.filter((r) => r.status === "Submitted").length,
      underReview: referrals.filter((r) => r.status === "Under Review").length,
      accepted: referrals.filter((r) => r.status === "Accepted").length,
      declined: referrals.filter((r) => r.status === "Declined").length,
    }),
    [referrals],
  );

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title="Referrals Inbox"
          subtitle="Triage teacher-submitted referrals, record non-confidential feedback, and open cases from accepted referrals."
        />

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Submitted</div>
            <div className="es-stat-value">{counts.submitted}</div>
            <div className="es-stat-meta">Awaiting triage</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Under Review</div>
            <div className="es-stat-value">{counts.underReview}</div>
            <div className="es-stat-meta">Initial observation review</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Accepted</div>
            <div className="es-stat-value">{counts.accepted}</div>
            <div className="es-stat-meta">Eligible for Counselling Case</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Declined</div>
            <div className="es-stat-value">{counts.declined}</div>
            <div className="es-stat-meta">Closed with classroom guidance</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 175px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="cns-ref-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search student, teacher, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="cns-ref-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | ReferralStatus)
                }
                options={[
                  { value: "ALL", label: "All Statuses" },
                  { value: "Submitted", label: "Submitted" },
                  { value: "Under Review", label: "Under Review" },
                  { value: "Accepted", label: "Accepted" },
                  { value: "Declined", label: "Declined" },
                ]}
              />
              <Select
                id="cns-ref-priority"
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as "ALL" | ReferralPriority)
                }
                options={[
                  { value: "ALL", label: "All Priorities" },
                  ...REFERRAL_PRIORITIES.map((p) => ({ value: p, label: p })),
                ]}
              />
              <Select
                id="cns-ref-class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                options={[
                  { value: "ALL", label: "All Classes" },
                  ...classOptions.map((c) => ({ value: c, label: c })),
                ]}
              />
              <Select
                id="cns-ref-sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "priority")
                }
                options={[
                  { value: "newest", label: "Sort: Newest First" },
                  { value: "oldest", label: "Sort: Oldest First" },
                  { value: "priority", label: "Sort: Highest Priority" },
                ]}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="No matching referrals"
                description="Try clearing your search or status filters to see all submitted referrals."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Ref ID</TableHeaderCell>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Referring Teacher</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: "right" }}>
                      Action
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/counsellor/referrals/${r.id}`)}
                    >
                      <TableCell>
                        <Badge variant="neutral">{r.referralRef}</Badge>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{r.studentName}</div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          {r.className} · {r.studentCode}
                        </div>
                      </TableCell>
                      <TableCell>{r.submittedByTeacherName}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>
                        <ReferralPriorityBadge priority={r.priority} />
                      </TableCell>
                      <TableCell>
                        <ReferralStatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>{r.submittedDate}</TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        <Link
                          href={`/counsellor/referrals/${r.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            Review
                          </Button>
                        </Link>
                      </TableCell>
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
