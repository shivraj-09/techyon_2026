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
  CURRENT_TEACHER_ACTOR,
  REFERRAL_PRIORITIES,
  type ReferralPriority,
  type ReferralStatus,
} from "@/config/counsellor-data";
import { useCounsellorStore } from "@/config/counsellor-store";

export default function TeacherReferralsPage() {
  const router = useRouter();
  const { referrals } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReferralStatus>(
    "ALL",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | ReferralPriority
  >("ALL");

  const myReferrals = useMemo(
    () =>
      referrals.filter(
        (r) => r.submittedByTeacherId === CURRENT_TEACHER_ACTOR.id,
      ),
    [referrals],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myReferrals.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && r.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.studentCode.toLowerCase().includes(q) ||
        r.referralRef.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    });
  }, [myReferrals, search, statusFilter, priorityFilter]);

  const counts = useMemo(
    () => ({
      total: myReferrals.length,
      pending: myReferrals.filter(
        (r) => r.status === "Submitted" || r.status === "Under Review",
      ).length,
      accepted: myReferrals.filter((r) => r.status === "Accepted").length,
      declined: myReferrals.filter((r) => r.status === "Declined").length,
    }),
    [myReferrals],
  );

  return (
    <AppLayout defaultRole="teacher">
      <div className="es-stack">
        <PageHeader
          title="My Referrals"
          subtitle="Track student wellbeing referrals you submitted and read permitted status updates from the school counsellor."
          actions={
            <Link href="/teacher/referrals/new">
              <Button leftIcon={<Icon name="file-plus" size={16} />}>
                Refer a Student
              </Button>
            </Link>
          }
        />

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Submitted by Me</div>
            <div className="es-stat-value">{counts.total}</div>
            <div className="es-stat-meta">Academic year 2026</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">In Review</div>
            <div className="es-stat-value">{counts.pending}</div>
            <div className="es-stat-meta">Submitted or Under Review</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Accepted</div>
            <div className="es-stat-value">{counts.accepted}</div>
            <div className="es-stat-meta">Counsellor follow-up active</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Declined / Redirected</div>
            <div className="es-stat-value">{counts.declined}</div>
            <div className="es-stat-meta">View non-confidential guidance</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--es-radius-md)",
                backgroundColor: "var(--es-surface-subtle)",
                border: "1px solid var(--es-border-subtle)",
                fontSize: "0.8125rem",
                color: "var(--es-text-secondary)",
              }}
            >
              <Icon name="shield" size={16} />
              <span>
                Confidential clinical case notes and private student chats remain
                restricted to the School Counsellor. Only referral status updates
                and classroom-safe guidance are shown here.
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="teacher-referral-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search student, class, ID, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="teacher-referral-status"
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
                id="teacher-referral-priority"
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as "ALL" | ReferralPriority)
                }
                options={[
                  { value: "ALL", label: "All Priorities" },
                  ...REFERRAL_PRIORITIES.map((p) => ({ value: p, label: p })),
                ]}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="clipboard-check"
                title="No matching referrals found"
                description="Try adjusting your search or filters, or submit a new student wellbeing referral."
                action={
                  <Link href="/teacher/referrals/new">
                    <Button leftIcon={<Icon name="file-plus" size={15} />}>
                      Refer a Student
                    </Button>
                  </Link>
                }
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Referral Ref</TableHeaderCell>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Submitted</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: "right" }}>
                      Action
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        router.push(`/teacher/referrals/${item.id}`)
                      }
                    >
                      <TableCell>
                        <Badge variant="neutral">{item.referralRef}</Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--es-text-primary)",
                          }}
                        >
                          {item.studentName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--es-text-muted)",
                          }}
                        >
                          {item.className} · {item.studentCode}
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <ReferralPriorityBadge priority={item.priority} />
                      </TableCell>
                      <TableCell>
                        <ReferralStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{item.submittedDate}</TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        <Link
                          href={`/teacher/referrals/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            View Details
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
