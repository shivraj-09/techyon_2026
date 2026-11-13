"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  EmptyState,
  Icon,
  Input,
  Modal,
  Tabs,
  Toast,
} from "@/components/ui";
import {
  SessionFormModal,
  SessionStatusBadge,
} from "@/components/counsellor";
import type { CounsellingSessionRecord } from "@/config/counsellor-data";
import {
  createCounsellingSession,
  updateCounsellingSessionStatus,
  useCounsellorStore,
} from "@/config/counsellor-store";

export default function CounsellorSessionsPage() {
  const { sessions, cases } = useCounsellorStore();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<CounsellingSessionRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    session: CounsellingSessionRecord;
    nextStatus: "Completed" | "Cancelled";
  } | null>(null);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(
    null,
  );

  const counts = useMemo(
    () => ({
      upcoming: sessions.filter((s) => s.status === "Scheduled").length,
      completed: sessions.filter((s) => s.status === "Completed").length,
      cancelled: sessions.filter((s) => s.status === "Cancelled").length,
    }),
    [sessions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions
      .filter((s) => {
        if (activeTab === "upcoming" && s.status !== "Scheduled") return false;
        if (activeTab === "past" && s.status !== "Completed") return false;
        if (activeTab === "cancelled" && s.status !== "Cancelled") return false;
        if (!q) return true;
        return (
          s.studentName.toLowerCase().includes(q) ||
          s.sessionRef.toLowerCase().includes(q) ||
          (s.caseRef?.toLowerCase().includes(q) ?? false) ||
          s.sessionType.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [sessions, activeTab, search]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, CounsellingSessionRecord[]>();
    for (const item of filtered) {
      const group = map.get(item.date) ?? [];
      group.push(item);
      map.set(item.date, group);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader
          title="Sessions & Schedule"
          subtitle="Coordinate individual counselling sessions, follow-ups, and parent meetings linked to active cases."
          actions={
            <Button
              onClick={() => setCreateOpen(true)}
              leftIcon={<Icon name="plus" size={16} />}
            >
              Schedule Session
            </Button>
          }
        />

        {toast && (
          <Toast
            variant="success"
            title={toast.title}
            description={toast.desc}
            onDismiss={() => setToast(null)}
          />
        )}

        <div className="es-stats-grid">
          <div className="es-stat-card">
            <div className="es-stat-label">Scheduled</div>
            <div className="es-stat-value">{counts.upcoming}</div>
            <div className="es-stat-meta">Upcoming calendar slots</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Completed</div>
            <div className="es-stat-value">{counts.completed}</div>
            <div className="es-stat-meta">Concluded sessions</div>
          </div>
          <div className="es-stat-card">
            <div className="es-stat-label">Cancelled</div>
            <div className="es-stat-value">{counts.cancelled}</div>
            <div className="es-stat-meta">Rescheduled or cancelled</div>
          </div>
        </div>

        <Card>
          <CardBody className="es-stack" style={{ gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: "upcoming", label: "Upcoming", count: counts.upcoming },
                  { id: "past", label: "Completed", count: counts.completed },
                  { id: "cancelled", label: "Cancelled", count: counts.cancelled },
                  { id: "all", label: "All Sessions", count: sessions.length },
                ]}
              />
              <div style={{ minWidth: "240px", flex: "1 1 240px", maxWidth: "340px" }}>
                <Input
                  id="cns-session-search"
                  leftIcon={<Icon name="search" size={15} />}
                  placeholder="Search student, ref, or case..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {groupedByDate.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No sessions in this view"
                description="Schedule a counselling session or switch tabs to review completed appointments."
                action={
                  <Button
                    onClick={() => setCreateOpen(true)}
                    leftIcon={<Icon name="plus" size={15} />}
                  >
                    Schedule Session
                  </Button>
                }
              />
            ) : (
              <div className="es-stack" style={{ gap: "1rem" }}>
                {groupedByDate.map(([dateKey, items]) => (
                  <Card key={dateKey} style={{ backgroundColor: "var(--es-surface-subtle)" }}>
                    <CardHeader>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <CardTitle>{dateKey}</CardTitle>
                        <Badge variant="neutral">{items.length} session(s)</Badge>
                      </div>
                    </CardHeader>
                    <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                      {items.map((ses) => (
                        <div
                          key={ses.id}
                          style={{
                            padding: "0.875rem 1rem",
                            borderRadius: "var(--es-radius-md)",
                            border: "1px solid var(--es-border-subtle)",
                            backgroundColor: "var(--es-surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ minWidth: "220px", flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                                marginBottom: "0.25rem",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                {ses.startTime}–{ses.endTime} · {ses.studentName} ({ses.className})
                              </span>
                              <SessionStatusBadge status={ses.status} />
                              <Badge variant="neutral">{ses.sessionRef}</Badge>
                            </div>
                            <div
                              style={{
                                fontSize: "0.8125rem",
                                color: "var(--es-text-secondary)",
                              }}
                            >
                              {ses.sessionType} · {ses.mode}: {ses.locationOrLink}
                              {ses.caseRef ? ` · Linked Case: ${ses.caseRef}` : ""}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedSession(ses)}
                            >
                              Details
                            </Button>
                            {ses.status === "Scheduled" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    setConfirmAction({
                                      session: ses,
                                      nextStatus: "Completed",
                                    })
                                  }
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    setConfirmAction({
                                      session: ses,
                                      nextStatus: "Cancelled",
                                    })
                                  }
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <SessionFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        cases={cases}
        onSubmit={(input) => {
          const created = createCounsellingSession(input);
          setToast({
            title: "Session Scheduled",
            desc: `${created.sessionRef} created for ${created.studentName} on ${created.date}.`,
          });
        }}
      />

      <Modal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        title={
          selectedSession
            ? `${selectedSession.sessionRef} — ${selectedSession.studentName}`
            : "Session Details"
        }
        description={
          selectedSession
            ? `${selectedSession.date} · ${selectedSession.startTime}–${selectedSession.endTime}`
            : undefined
        }
        footer={
          <Button variant="secondary" onClick={() => setSelectedSession(null)}>
            Close
          </Button>
        }
      >
        {selectedSession && (
          <div className="es-stack" style={{ gap: "0.875rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <SessionStatusBadge status={selectedSession.status} />
              <Badge variant="neutral">{selectedSession.sessionType}</Badge>
              <Badge variant="neutral">{selectedSession.mode}</Badge>
            </div>
            <div>
              <strong>Student:</strong> {selectedSession.studentName} (
              {selectedSession.className})
            </div>
            <div>
              <strong>Location / Link:</strong> {selectedSession.locationOrLink}
            </div>
            <div>
              <strong>Assigned Counsellor:</strong>{" "}
              {selectedSession.assignedCounsellor}
            </div>
            {selectedSession.caseId && (
              <div>
                <strong>Linked Case:</strong>{" "}
                <Link
                  href={`/counsellor/cases/${selectedSession.caseId}`}
                  style={{ color: "var(--es-primary)", fontWeight: 600 }}
                >
                  Open {selectedSession.caseRef}
                </Link>
              </div>
            )}
            {selectedSession.schedulingNotes && (
              <div>
                <strong>Scheduling Notes:</strong>{" "}
                {selectedSession.schedulingNotes}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          updateCounsellingSessionStatus(
            confirmAction.session.id,
            confirmAction.nextStatus,
          );
          setToast({
            title: `Session ${confirmAction.nextStatus}`,
            desc: `${confirmAction.session.sessionRef} updated to ${confirmAction.nextStatus}.`,
          });
          setConfirmAction(null);
        }}
        variant={confirmAction?.nextStatus === "Cancelled" ? "danger" : "primary"}
        title={
          confirmAction?.nextStatus === "Cancelled"
            ? "Cancel Counselling Session"
            : "Mark Session Completed"
        }
        description={
          confirmAction
            ? `Are you sure you want to mark ${confirmAction.session.sessionRef} (${confirmAction.session.studentName}) as ${confirmAction.nextStatus}?`
            : ""
        }
        confirmLabel={
          confirmAction?.nextStatus === "Cancelled"
            ? "Cancel Session"
            : "Mark Completed"
        }
      />
    </AppLayout>
  );
}
