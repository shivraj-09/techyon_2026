"use client";

import React, { useMemo, useState } from "react";
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
  Toast,
} from "@/components/ui";
import { StudentLinkModal } from "@/components/counsellor";
import {
  AVAILABLE_AUTH_ACCOUNTS,
  type StudentVoiceLinkRecord,
} from "@/config/counsellor-data";
import {
  linkStudentVoiceAccount,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function AdminStudentVoiceLinkingPage() {
  const { studentLinks } = useCounsellorStore();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "Linked" | "Unlinked"
  >("ALL");
  const [linkingTarget, setLinkingTarget] =
    useState<StudentVoiceLinkRecord | null>(null);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(
    null,
  );

  const classOptions = useMemo(
    () => Array.from(new Set(studentLinks.map((l) => l.className))).sort(),
    [studentLinks],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentLinks.filter((item) => {
      if (classFilter !== "ALL" && item.className !== classFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.studentName.toLowerCase().includes(q) ||
        item.studentCode.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q) ||
        (item.linkedAccountRef?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [studentLinks, search, classFilter, statusFilter]);

  const counts = useMemo(() => {
    const linked = studentLinks.filter((l) => l.status === "Linked").length;
    const unlinked = studentLinks.filter((l) => l.status === "Unlinked").length;
    const usedIds = new Set(
      studentLinks
        .filter((l) => l.status === "Linked" && l.linkedAccountId)
        .map((l) => l.linkedAccountId as string),
    );
    const availableAccounts = AVAILABLE_AUTH_ACCOUNTS.filter(
      (a) => !usedIds.has(a.id),
    ).length;

    return {
      total: studentLinks.length,
      linked,
      unlinked,
      availableAccounts,
    };
  }, [studentLinks]);

  return (
    <AppLayout defaultRole="admin">
      <div className="es-stack">
        <PageHeader
          title="Student Voice Account Linking"
          subtitle="Connect verified school authentication accounts to roster students so they can access pseudonymous Student Voice support."
        />

        {toast && (
          <Toast
            variant="success"
            title={toast.title}
            description={toast.desc}
            onDismiss={() => setToast(null)}
          />
        )}

        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--es-radius-md)",
            backgroundColor: "var(--es-surface-subtle)",
            border: "1px solid var(--es-border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            fontSize: "0.8125rem",
            color: "var(--es-text-secondary)",
          }}
        >
          <Icon name="shield" size={16} />
          <span>
            <strong>Privacy Separation Enforced:</strong> School Admins manage
            account provisioning only. Private counselling case notes, teacher
            referrals, and Student Voice message contents remain inaccessible from
            the Admin portal.
          </span>
        </div>

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Roster Students</div>
            <div className="es-stat-value">{counts.total}</div>
            <div className="es-stat-meta">Eligible Student Voice cohort</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Linked Accounts</div>
            <div className="es-stat-value">{counts.linked}</div>
            <div className="es-stat-meta">Verified access enabled</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Unlinked Students</div>
            <div className="es-stat-value">{counts.unlinked}</div>
            <div className="es-stat-meta">Pending account assignment</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Available Auth Accounts</div>
            <div className="es-stat-value">{counts.availableAccounts}</div>
            <div className="es-stat-meta">Ready for confirmation</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "0.75rem",
              }}
            >
              <Input
                id="admin-svl-search"
                leftIcon={<Icon name="search" size={15} />}
                placeholder="Search student, ID, class, account ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="admin-svl-class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                options={[
                  { value: "ALL", label: "All Classes" },
                  ...classOptions.map((c) => ({ value: c, label: c })),
                ]}
              />
              <Select
                id="admin-svl-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "ALL" | "Linked" | "Unlinked",
                  )
                }
                options={[
                  { value: "ALL", label: "All Linking Statuses" },
                  { value: "Linked", label: "Linked" },
                  { value: "Unlinked", label: "Unlinked" },
                ]}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="link"
                title="No matching student records"
                description="Try clearing your search or class filters."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Student Code</TableHeaderCell>
                    <TableHeaderCell>Student Name</TableHeaderCell>
                    <TableHeaderCell>Class</TableHeaderCell>
                    <TableHeaderCell>Link Status</TableHeaderCell>
                    <TableHeaderCell>Auth Account Ref</TableHeaderCell>
                    <TableHeaderCell>Last Updated</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: "right" }}>
                      Action
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="neutral">{item.studentCode}</Badge>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        {item.studentName}
                      </TableCell>
                      <TableCell>{item.className}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Linked" ? "success" : "warning"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.linkedAccountRef ? (
                          <span style={{ fontWeight: 500 }}>
                            {item.linkedAccountRef}
                          </span>
                        ) : (
                          <span style={{ color: "var(--es-text-muted)" }}>
                            Not linked
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        {item.status === "Unlinked" ? (
                          <Button
                            size="sm"
                            onClick={() => setLinkingTarget(item)}
                            leftIcon={<Icon name="link" size={14} />}
                          >
                            Link Account
                          </Button>
                        ) : (
                          <Badge variant="neutral">Provisioned</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      <StudentLinkModal
        isOpen={Boolean(linkingTarget)}
        onClose={() => setLinkingTarget(null)}
        record={linkingTarget}
        existingLinks={studentLinks}
        onConfirmLink={(linkRecordId, accountId, accountLabel) => {
          const res = linkStudentVoiceAccount(
            linkRecordId,
            accountId,
            accountLabel,
          );
          if (res.ok && linkingTarget) {
            setToast({
              title: "Student Account Linked",
              desc: `${linkingTarget.studentName} linked to ${accountLabel}.`,
            });
          }
          return res;
        }}
      />
    </AppLayout>
  );
}
