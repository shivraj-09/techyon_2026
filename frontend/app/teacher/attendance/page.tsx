"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
} from "@/components/ui";
import { TeacherAttendanceWorkspace } from "@/components/teacher";
import {
  TEACHER_ASSIGNED_CLASSES,
  TEACHER_CLASS_ATTENDANCE_RECORDS,
  getStoredTeacherAttendance,
  type TeacherAttendanceSessionRecord,
} from "@/config/teacher-data";

type TeacherAttendanceTab = "mark" | "history";

export default function TeacherAttendancePage() {
  const [activeTab, setActiveTab] = useState<TeacherAttendanceTab>("mark");
  const [workspaceClassId, setWorkspaceClassId] = useState("class-9-a");
  const [workspaceDate, setWorkspaceDate] = useState("2026-11-13");

  const [sessions, setSessions] = useState<TeacherAttendanceSessionRecord[]>(
    TEACHER_CLASS_ATTENDANCE_RECORDS,
  );
  const [historyClassFilter, setHistoryClassFilter] = useState("all");
  const [historyDateFilter, setHistoryDateFilter] = useState("");

  useEffect(() => {
    setSessions(getStoredTeacherAttendance());
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const classParam = params.get("classId");
      const tabParam = params.get("tab");
      const dateParam = params.get("date");

      if (
        classParam &&
        TEACHER_ASSIGNED_CLASSES.some((cls) => cls.id === classParam)
      ) {
        setWorkspaceClassId(classParam);
      }
      if (dateParam) {
        setWorkspaceDate(dateParam);
      }
      if (tabParam === "history" || tabParam === "mark") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  function refreshSessions() {
    setSessions(getStoredTeacherAttendance());
  }

  const filteredHistory = useMemo(() => {
    return sessions
      .filter((sess) => {
        if (historyClassFilter !== "all" && sess.classId !== historyClassFilter) {
          return false;
        }
        if (historyDateFilter && sess.date !== historyDateFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, historyClassFilter, historyDateFilter]);

  const hasHistoryFilters =
    historyClassFilter !== "all" || Boolean(historyDateFilter);

  function handleOpenSessionInWorkspace(sess: TeacherAttendanceSessionRecord) {
    setWorkspaceClassId(sess.classId);
    setWorkspaceDate(sess.date);
    setActiveTab("mark");
  }

  return (
    <AppLayout
      defaultRole="teacher"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "Attendance" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Attendance"
          subtitle="Mark daily attendance and review records for your assigned classes."
          actions={
            <Badge variant="primary">
              {TEACHER_ASSIGNED_CLASSES.length} Assigned Classes
            </Badge>
          }
        />

        <Tabs
          tabs={[
            { id: "mark", label: "Mark Attendance" },
            {
              id: "history",
              label: "Class Attendance History",
              count: sessions.length,
            },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as TeacherAttendanceTab)}
        />

        {activeTab === "mark" && (
          <TeacherAttendanceWorkspace
            key={`${workspaceClassId}-${workspaceDate}`}
            initialClassId={workspaceClassId}
            initialDate={workspaceDate}
            onSessionSaved={() => refreshSessions()}
          />
        )}

        {activeTab === "history" && (
          <div className="es-stack">
            <Card>
              <CardBody
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <Select
                    id="teacher-history-class-filter"
                    label="Assigned Class"
                    value={historyClassFilter}
                    onChange={(e) => setHistoryClassFilter(e.target.value)}
                    style={{ width: "200px" }}
                    options={[
                      { value: "all", label: "All Assigned Classes" },
                      ...TEACHER_ASSIGNED_CLASSES.map((cls) => ({
                        value: cls.id,
                        label: cls.name,
                      })),
                    ]}
                  />

                  <div className="es-field">
                    <label
                      htmlFor="teacher-history-date-filter"
                      className="es-label"
                    >
                      Date
                    </label>
                    <input
                      id="teacher-history-date-filter"
                      type="date"
                      className="es-input"
                      style={{ width: "165px", height: "38px" }}
                      value={historyDateFilter}
                      onChange={(e) => setHistoryDateFilter(e.target.value)}
                    />
                  </div>
                </div>

                {hasHistoryFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setHistoryClassFilter("all");
                      setHistoryDateFilter("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Class Attendance History</CardTitle>
                  <CardDescription>
                    Recent daily attendance sessions across your 4 assigned
                    classes
                  </CardDescription>
                </div>
                <Badge variant="neutral">
                  {filteredHistory.length} record
                  {filteredHistory.length === 1 ? "" : "s"}
                </Badge>
              </CardHeader>

              <CardBody flush>
                {filteredHistory.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Class</TableHeaderCell>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Subject</TableHeaderCell>
                        <TableHeaderCell>Present</TableHeaderCell>
                        <TableHeaderCell>Absent</TableHeaderCell>
                        <TableHeaderCell>Late</TableHeaderCell>
                        <TableHeaderCell>Rate</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Submitted</TableHeaderCell>
                        <TableHeaderCell align="right">Action</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredHistory.map((sess) => {
                        const isSubmitted = sess.status === "Submitted";
                        return (
                          <TableRow key={sess.id}>
                            <TableCell style={{ fontWeight: 600 }}>
                              {sess.className}
                            </TableCell>
                            <TableCell>{sess.date}</TableCell>
                            <TableCell>{sess.subject}</TableCell>
                            <TableCell>{sess.presentCount}</TableCell>
                            <TableCell>{sess.absentCount}</TableCell>
                            <TableCell>{sess.lateCount}</TableCell>
                            <TableCell style={{ fontWeight: 600 }}>
                              {isSubmitted
                                ? `${sess.attendancePercentage.toFixed(1)}%`
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={isSubmitted ? "success" : "warning"}
                                dot
                              >
                                {sess.status}
                              </Badge>
                            </TableCell>
                            <TableCell
                              style={{ color: "var(--es-text-muted)" }}
                            >
                              {sess.submittedAt}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={
                                  <Icon name="clipboard-check" size={14} />
                                }
                                onClick={() =>
                                  handleOpenSessionInWorkspace(sess)
                                }
                              >
                                {isSubmitted ? "Review / Edit" : "Mark Now"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon="calendar-check"
                    title="No attendance records match your filters"
                    description="Clear the class or date filter to inspect all recent attendance sessions for your classes."
                    action={
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setHistoryClassFilter("all");
                          setHistoryDateFilter("");
                        }}
                      >
                        Reset Filters
                      </Button>
                    }
                  />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
