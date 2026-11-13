"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
} from "@/components/ui";
import {
  TeacherClassOverview,
  TeacherStudentTable,
} from "@/components/teacher";
import {
  TEACHER_ASSIGNED_CLASSES,
  TEACHER_CLASS_ATTENDANCE_RECORDS,
  TEACHER_STUDENTS,
  getStoredTeacherAttendance,
  type TeacherAttendanceSessionRecord,
} from "@/config/teacher-data";

type ClassDetailTab = "overview" | "students" | "attendance";

export default function TeacherClassDetailPage() {
  const params = useParams<{ classId: string }>();
  const classId = params?.classId || "";

  const classItem = useMemo(
    () => TEACHER_ASSIGNED_CLASSES.find((cls) => cls.id === classId) || null,
    [classId],
  );

  const [activeTab, setActiveTab] = useState<ClassDetailTab>("overview");
  const [dateFilter, setDateFilter] = useState("");
  const [sessions, setSessions] = useState<TeacherAttendanceSessionRecord[]>(
    TEACHER_CLASS_ATTENDANCE_RECORDS,
  );

  useEffect(() => {
    setSessions(getStoredTeacherAttendance());
  }, []);

  const classStudents = useMemo(
    () => TEACHER_STUDENTS.filter((stu) => stu.classId === classId),
    [classId],
  );

  const classSessions = useMemo(
    () =>
      sessions
        .filter((sess) => sess.classId === classId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sessions, classId],
  );

  const filteredSessions = useMemo(() => {
    if (!dateFilter) return classSessions;
    return classSessions.filter((sess) => sess.date === dateFilter);
  }, [classSessions, dateFilter]);

  const latestSubmittedSession = useMemo(
    () =>
      filteredSessions.find((sess) => sess.status === "Submitted") ||
      classSessions.find((sess) => sess.status === "Submitted") ||
      null,
    [filteredSessions, classSessions],
  );

  if (!classItem) {
    return (
      <AppLayout
        defaultRole="teacher"
        breadcrumbs={[
          { label: "Teacher", href: "/teacher/dashboard" },
          { label: "My Classes", href: "/teacher/classes" },
          { label: "Not Found" },
        ]}
      >
        <Card>
          <CardBody>
            <EmptyState
              icon="book-open"
              title="Class not found in your assigned roster"
              description="You can only view classes assigned to your teaching schedule. Return to My Classes to select an assigned section."
              action={
                <Link href="/teacher/classes" style={{ textDecoration: "none" }}>
                  <Button variant="primary">Back to My Classes</Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      defaultRole="teacher"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "My Classes", href: "/teacher/classes" },
        { label: classItem.name },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title={classItem.name}
          subtitle={`Section ${classItem.section} · ${classItem.subject} · ${classItem.studentCount} Students · Academic Year ${classItem.academicYear}`}
          actions={
            <>
              {classItem.isClassTeacher && (
                <Badge variant="primary" dot>
                  Class Teacher
                </Badge>
              )}
              <Badge
                variant={
                  classItem.attendanceStatusToday === "Submitted"
                    ? "success"
                    : "warning"
                }
                dot
              >
                Today: {classItem.attendanceStatusToday}
              </Badge>
              <Link href="/teacher/classes" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="md">
                  All Classes
                </Button>
              </Link>
              <Link
                href={`/teacher/attendance?classId=${classItem.id}`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Icon name="clipboard-check" size={15} />}
                >
                  Mark Attendance
                </Button>
              </Link>
            </>
          }
        />

        <Tabs
          tabs={[
            { id: "overview", label: "Overview" },
            {
              id: "students",
              label: "Students",
              count: classStudents.length,
            },
            {
              id: "attendance",
              label: "Attendance",
              count: classSessions.length,
            },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as ClassDetailTab)}
        />

        {activeTab === "overview" && (
          <TeacherClassOverview
            classItem={classItem}
            recentSessions={classSessions}
          />
        )}

        {activeTab === "students" && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{classItem.name} Student Roster</CardTitle>
                <CardDescription>
                  Academic and attendance records for students enrolled in{" "}
                  {classItem.name} ({classItem.subject})
                </CardDescription>
              </div>
              <Badge variant="neutral">
                {classStudents.length} Roster Profiles
              </Badge>
            </CardHeader>
            <CardBody flush>
              <TeacherStudentTable
                students={classStudents}
                showFilters={true}
                showClassFilter={false}
              />
            </CardBody>
          </Card>
        )}

        {activeTab === "attendance" && (
          <div className="es-stack">
            <Card>
              <CardBody
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    htmlFor="class-attendance-date-filter"
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--es-text-secondary)",
                    }}
                  >
                    Filter by Date:
                  </label>
                  <input
                    id="class-attendance-date-filter"
                    type="date"
                    className="es-input"
                    style={{ width: "165px", height: "36px" }}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  {dateFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateFilter("")}
                    >
                      Clear Date
                    </Button>
                  )}
                </div>

                <Link
                  href={`/teacher/attendance?classId=${classItem.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Icon name="clipboard-check" size={14} />}
                  >
                    Mark / Update in Workspace
                  </Button>
                </Link>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Class Attendance Summary</CardTitle>
                  <CardDescription>
                    {latestSubmittedSession
                      ? `Latest submitted session (${latestSubmittedSession.date} · ${latestSubmittedSession.submittedAt})`
                      : `Current term summary for ${classItem.name}`}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    classItem.attendanceRate >= 90 ? "success" : "warning"
                  }
                  dot
                >
                  {(
                    latestSubmittedSession?.attendancePercentage ??
                    classItem.attendanceRate
                  ).toFixed(1)}
                  % Attendance
                </Badge>
              </CardHeader>
              <CardBody>
                <div className="es-grid-4">
                  <div className="es-stat-card">
                    <div className="es-stat-top">
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--es-text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        Total Students
                      </span>
                    </div>
                    <div className="es-stat-value">
                      {latestSubmittedSession?.totalStudents ??
                        classItem.studentCount}
                    </div>
                    <div className="es-stat-meta">{classItem.name} roster</div>
                  </div>
                  <div className="es-stat-card">
                    <div className="es-stat-top">
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--es-text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        Present
                      </span>
                    </div>
                    <div
                      className="es-stat-value"
                      style={{ color: "var(--es-success)" }}
                    >
                      {latestSubmittedSession?.presentCount ??
                        classItem.presentCount}
                    </div>
                    <div className="es-stat-meta">Marked present</div>
                  </div>
                  <div className="es-stat-card">
                    <div className="es-stat-top">
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--es-text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        Absent
                      </span>
                    </div>
                    <div
                      className="es-stat-value"
                      style={{ color: "var(--es-danger)" }}
                    >
                      {latestSubmittedSession?.absentCount ??
                        classItem.absentCount}
                    </div>
                    <div className="es-stat-meta">Marked absent</div>
                  </div>
                  <div className="es-stat-card">
                    <div className="es-stat-top">
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--es-text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        Late
                      </span>
                    </div>
                    <div
                      className="es-stat-value"
                      style={{ color: "var(--es-warning)" }}
                    >
                      {latestSubmittedSession?.lateCount ?? classItem.lateCount}
                    </div>
                    <div className="es-stat-meta">Late arrivals</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recent Attendance Records</CardTitle>
                  <CardDescription>
                    Submitted and pending sessions for {classItem.name} (
                    {classItem.subject})
                  </CardDescription>
                </div>
                <Badge variant="neutral">
                  {filteredSessions.length} session
                  {filteredSessions.length === 1 ? "" : "s"}
                </Badge>
              </CardHeader>

              <CardBody flush>
                {filteredSessions.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Subject</TableHeaderCell>
                        <TableHeaderCell>Present</TableHeaderCell>
                        <TableHeaderCell>Absent</TableHeaderCell>
                        <TableHeaderCell>Late</TableHeaderCell>
                        <TableHeaderCell>Rate</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Submitted</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSessions.map((sess) => {
                        const isSubmitted = sess.status === "Submitted";
                        return (
                          <TableRow key={sess.id}>
                            <TableCell style={{ fontWeight: 600 }}>
                              {sess.date}
                            </TableCell>
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
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon="calendar"
                    title="No attendance records for selected date"
                    description="Clear the date filter or open the attendance workspace to mark attendance for this class."
                    action={
                      <Button
                        variant="secondary"
                        onClick={() => setDateFilter("")}
                      >
                        Show All Dates
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
