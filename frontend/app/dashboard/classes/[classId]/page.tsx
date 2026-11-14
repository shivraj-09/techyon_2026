"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import {
  Avatar,
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
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  ClassDetailsHeader,
  ClassForm,
  type ClassFormValues,
  EnrollmentModal,
  TeacherAssignmentModal,
} from "@/components/classes";
import {
  AVAILABLE_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  type ClassRecord,
  type ClassTeacherAssignment,
  type StudentRecord,
  type TeacherDirectoryItem,
  getStoredClasses,
  getStoredStudents,
  saveStoredClasses,
  saveStoredStudents,
} from "@/config/stage3-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACTS (Not called in Stage 3 Frontend)
 * ============================================================================
 * - PATCH  /schools/{school_id}/classes/{class_id}
 * - DELETE /schools/{school_id}/classes/{class_id}
 * - POST   /schools/{school_id}/students/{student_id}/enrollments
 * - POST   /schools/{school_id}/classes/{class_id}/teachers
 * - DELETE /schools/{school_id}/classes/{class_id}/teachers/{teacher_user_id}
 * ============================================================================
 */

export default function ClassDetailsPage() {
  const params = useParams<{ classId: string }>();
  const router = useRouter();
  const classId = params?.classId || "class-6-a";

  const [classes, setClasses] = useState<ClassRecord[]>(INITIAL_CLASSES);
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "teachers"
  >("overview");

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteClassOpen, setIsDeleteClassOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
  const [removingTeacher, setRemovingTeacher] =
    useState<ClassTeacherAssignment | null>(null);
  const [removingStudent, setRemovingStudent] = useState<StudentRecord | null>(
    null,
  );
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setClasses(getStoredClasses());
    setStudents(getStoredStudents());
  }, []);

  const currentClass = useMemo(() => {
    return (
      classes.find((c) => c.id === classId) ||
      classes.find(
        (c) => c.name.toLowerCase().replace(/\s+/g, "-") === classId,
      ) ||
      classes[0]
    );
  }, [classes, classId]);

  const enrolledStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(
      (s) =>
        s.classId === currentClass.id || s.className === currentClass.name,
    );
  }, [students, currentClass]);

  const eligibleStudentsForEnrollment = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(
      (s) =>
        s.classId !== currentClass.id && s.className !== currentClass.name,
    );
  }, [students, currentClass]);

  const availableTeachersForAssignment = useMemo(() => {
    if (!currentClass) return AVAILABLE_TEACHERS;
    const assignedIds = new Set(
      currentClass.assignedTeachers.map((t) => t.teacherId),
    );
    const assignedEmails = new Set(
      currentClass.assignedTeachers.map((t) => t.email.toLowerCase()),
    );
    return AVAILABLE_TEACHERS.filter(
      (t) =>
        !assignedIds.has(t.id) && !assignedEmails.has(t.email.toLowerCase()),
    );
  }, [currentClass]);

  if (!currentClass) {
    return (
      <AppLayout>
        <Card>
          <CardBody>
            <EmptyState
              icon="book-open"
              title="Class not found"
              description="The requested class section could not be found in the directory."
              action={
                <Link href="/dashboard/classes">
                  <Button variant="primary">Back to Classes</Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      </AppLayout>
    );
  }

  function handleUpdateClass(values: ClassFormValues) {
    // Reference contract: PATCH /schools/{school_id}/classes/{class_id}
    const updatedName = `${values.grade}-${values.section}`;
    const updatedClasses = classes.map((c) =>
      c.id === currentClass.id
        ? {
            ...c,
            name: updatedName,
            grade: values.grade,
            section: values.section,
            academicYear: values.academicYear,
            capacity: Number(values.capacity) || c.capacity,
            description: values.description,
          }
        : c,
    );
    setClasses(updatedClasses);
    saveStoredClasses(updatedClasses);
    setIsEditOpen(false);
    setToast({
      title: "Class details saved",
      description: `${updatedName} configuration has been updated.`,
    });
  }

  function handleDeleteClass() {
    // Reference contract: DELETE /schools/{school_id}/classes/{class_id}
    const nextClasses = classes.filter((c) => c.id !== currentClass.id);
    saveStoredClasses(nextClasses);
    setIsDeleteClassOpen(false);
    router.push("/dashboard/classes");
  }

  function handleEnrollStudent(studentId: string) {
    // Reference contract: POST /schools/{school_id}/students/{student_id}/enrollments
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    // Prevent duplicate enrollment
    if (
      targetStudent.classId === currentClass.id ||
      targetStudent.className === currentClass.name
    ) {
      return;
    }

    const todayStr = "14 Nov 2026";
    const updatedStudents = students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            classId: currentClass.id,
            className: currentClass.name,
            enrollmentDate: todayStr,
            status: "Active" as const,
          }
        : s,
    );

    const updatedClasses = classes.map((c) =>
      c.id === currentClass.id
        ? { ...c, enrolledCount: c.enrolledCount + 1 }
        : c,
    );

    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);
    setClasses(updatedClasses);
    saveStoredClasses(updatedClasses);
    setIsEnrollOpen(false);
    setToast({
      title: "Student enrolled",
      description: `${targetStudent.fullName} has been enrolled in ${currentClass.name}.`,
    });
  }

  function handleConfirmRemoveStudent() {
    if (!removingStudent) return;
    const studentName = removingStudent.fullName;

    const updatedStudents = students.map((s) =>
      s.id === removingStudent.id
        ? { ...s, classId: "", className: "Unassigned" }
        : s,
    );

    const updatedClasses = classes.map((c) =>
      c.id === currentClass.id
        ? { ...c, enrolledCount: Math.max(0, c.enrolledCount - 1) }
        : c,
    );

    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);
    setClasses(updatedClasses);
    saveStoredClasses(updatedClasses);
    setRemovingStudent(null);
    setToast({
      title: "Enrollment removed",
      description: `${studentName} was unassigned from ${currentClass.name}.`,
    });
  }

  function handleAssignTeacher(
    teacher: TeacherDirectoryItem,
    role: "Class Teacher" | "Subject Teacher",
  ) {
    // Reference contract: POST /schools/{school_id}/classes/{class_id}/teachers
    const newAssignment: ClassTeacherAssignment = {
      id: `assign-${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      role,
      status: "Active",
      assignedDate: "14 Nov 2026",
    };

    const updatedClasses = classes.map((c) => {
      if (c.id !== currentClass.id) return c;
      const nextAssignments = [...c.assignedTeachers, newAssignment];
      const nextClassTeacher =
        role === "Class Teacher" || c.classTeacher === "Unassigned"
          ? teacher.name
          : c.classTeacher;
      return {
        ...c,
        classTeacher: nextClassTeacher,
        assignedTeachers: nextAssignments,
      };
    });

    setClasses(updatedClasses);
    saveStoredClasses(updatedClasses);
    setIsAssignTeacherOpen(false);
    setToast({
      title: "Teacher assigned",
      description: `${teacher.name} assigned to ${currentClass.name} as ${role}.`,
    });
  }

  function handleConfirmRemoveTeacher() {
    if (!removingTeacher) return;
    // Reference contract: DELETE /schools/{school_id}/classes/{class_id}/teachers/{teacher_user_id}
    const removedName = removingTeacher.teacherName;

    const updatedClasses = classes.map((c) => {
      if (c.id !== currentClass.id) return c;
      const nextAssignments = c.assignedTeachers.filter(
        (t) => t.id !== removingTeacher.id,
      );
      const nextClassTeacher =
        c.classTeacher === removingTeacher.teacherName
          ? nextAssignments[0]?.teacherName || "Unassigned"
          : c.classTeacher;
      return {
        ...c,
        classTeacher: nextClassTeacher,
        assignedTeachers: nextAssignments,
      };
    });

    setClasses(updatedClasses);
    saveStoredClasses(updatedClasses);
    setRemovingTeacher(null);
    setToast({
      title: "Teacher assignment removed",
      description: `${removedName} has been unassigned from ${currentClass.name}.`,
    });
  }

  const capacityPct =
    currentClass.capacity > 0
      ? Math.min(
          100,
          Math.round(
            (currentClass.enrolledCount / currentClass.capacity) * 100,
          ),
        )
      : 0;

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Admin", href: "/dashboard" },
        { label: "Classes", href: "/dashboard/classes" },
        { label: currentClass.name },
      ]}
    >
      <div className="es-stack">
        {/* Class Details Header */}
        <ClassDetailsHeader
          classItem={currentClass}
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteClassOpen(true)}
        />

        {/* Section Tabs */}
        <div>
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              {
                id: "students",
                label: "Students",
                count: enrolledStudents.length,
              },
              {
                id: "teachers",
                label: "Teachers",
                count: currentClass.assignedTeachers.length,
              },
            ]}
            activeTab={activeTab}
            onChange={(id) =>
              setActiveTab(id as "overview" | "students" | "teachers")
            }
          />
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="es-stack">
            <section className="es-grid-4" aria-label="Class Statistics">
              <article className="es-stat-card">
                <div className="es-stat-top">
                  <span>Enrollment Count</span>
                  <Icon name="graduation-cap" size={16} />
                </div>
                <div className="es-stat-value">
                  {currentClass.enrolledCount}
                </div>
                <div className="es-stat-meta">
                  Of {currentClass.capacity} maximum student capacity
                </div>
              </article>

              <article className="es-stat-card">
                <div className="es-stat-top">
                  <span>Class Capacity</span>
                  <Icon name="users" size={16} />
                </div>
                <div className="es-stat-value">{capacityPct}%</div>
                <div className="es-stat-meta">
                  {Math.max(
                    0,
                    currentClass.capacity - currentClass.enrolledCount,
                  )}{" "}
                  seats available
                </div>
              </article>

              <article className="es-stat-card">
                <div className="es-stat-top">
                  <span>Assigned Faculty</span>
                  <Icon name="book-open" size={16} />
                </div>
                <div className="es-stat-value">
                  {currentClass.assignedTeachers.length}
                </div>
                <div className="es-stat-meta">
                  Advisor: {currentClass.classTeacher}
                </div>
              </article>

              <article className="es-stat-card">
                <div className="es-stat-top">
                  <span>Attendance Today</span>
                  <Icon name="clipboard-check" size={16} />
                </div>
                <div className="es-stat-value">
                  {currentClass.attendanceRate}%
                </div>
                <div className="es-stat-meta">
                  {currentClass.presentToday} present ·{" "}
                  {currentClass.absentToday} absent
                </div>
              </article>
            </section>

            <div className="es-dashboard-grid-main">
              {/* Class Information & Capacity Card */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Class Configuration & Capacity</CardTitle>
                    <CardDescription>
                      Academic section details and seat utilization
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardBody
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div className="es-metric-mini-label">Class Name</div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          marginTop: "3px",
                        }}
                      >
                        {currentClass.name}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Section</div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          marginTop: "3px",
                        }}
                      >
                        Section {currentClass.section}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Academic Year</div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          marginTop: "3px",
                        }}
                      >
                        {currentClass.academicYear}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Class Teacher</div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          marginTop: "3px",
                        }}
                      >
                        {currentClass.classTeacher}
                      </div>
                    </div>
                  </div>

                  {currentClass.description && (
                    <div>
                      <div className="es-metric-mini-label">Description</div>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "13.5px",
                          color: "var(--es-text-secondary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {currentClass.description}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      padding: "14px",
                      backgroundColor: "var(--es-bg-app)",
                      borderRadius: "var(--es-radius-md)",
                      border: "1px solid var(--es-border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        marginBottom: "8px",
                      }}
                    >
                      <span>Enrollment Utilization</span>
                      <span>
                        {currentClass.enrolledCount} / {currentClass.capacity}{" "}
                        Students ({capacityPct}%)
                      </span>
                    </div>
                    <div className="es-progress-track">
                      <div
                        className="es-progress-fill good"
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Small Attendance Summary Card */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Attendance Summary</CardTitle>
                    <CardDescription>
                      Today&apos;s roll call snapshot for {currentClass.name}
                    </CardDescription>
                  </div>
                  <Badge variant="success" dot>
                    {currentClass.attendanceRate}% Present
                  </Badge>
                </CardHeader>
                <CardBody
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div className="es-analytics-summary-3" style={{ marginBottom: 0 }}>
                    <div>
                      <div className="es-metric-mini-label">Total Roster</div>
                      <div className="es-metric-mini-value">
                        {currentClass.enrolledCount}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Present Today</div>
                      <div
                        className="es-metric-mini-value"
                        style={{ color: "var(--es-success)" }}
                      >
                        {currentClass.presentToday}
                      </div>
                    </div>
                    <div>
                      <div className="es-metric-mini-label">Absent Today</div>
                      <div
                        className="es-metric-mini-value"
                        style={{ color: "var(--es-danger)" }}
                      >
                        {currentClass.absentToday}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12.5px",
                      color: "var(--es-text-muted)",
                    }}
                  >
                    <span>Morning attendance submitted at 08:40 AM</span>
                    <Link
                      href="/dashboard/attendance"
                      style={{
                        color: "var(--es-primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Open Attendance →
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS */}
        {activeTab === "students" && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  Students currently enrolled in {currentClass.name} (
                  {currentClass.academicYear})
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Icon name="user-plus" size={15} />}
                onClick={() => setIsEnrollOpen(true)}
              >
                Enroll Student
              </Button>
            </CardHeader>

            <CardBody flush>
              {enrolledStudents.length === 0 ? (
                <EmptyState
                  icon="graduation-cap"
                  title="No students enrolled in this class yet"
                  description="Click Enroll Student to add students from the directory to this class section."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsEnrollOpen(true)}
                    >
                      Enroll Student
                    </Button>
                  }
                />
              ) : (
                <Table style={{ border: "none", borderRadius: 0 }}>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Student Name</TableHeaderCell>
                      <TableHeaderCell>Student ID</TableHeaderCell>
                      <TableHeaderCell>Guardian</TableHeaderCell>
                      <TableHeaderCell>Enrollment Date</TableHeaderCell>
                      <TableHeaderCell>Enrollment Status</TableHeaderCell>
                      <TableHeaderCell style={{ textAlign: "right" }}>
                        Actions
                      </TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {enrolledStudents.map((student) => {
                      const primaryGuardian = student.guardians[0];
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="es-table-cell-primary">
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <Avatar name={student.fullName} size="sm" />
                              <Link
                                href={`/dashboard/students/${student.id}`}
                                style={{
                                  color: "var(--es-text-primary)",
                                  textDecoration: "none",
                                  fontWeight: 600,
                                }}
                              >
                                {student.fullName}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>
                            {primaryGuardian ? (
                              <div>
                                <div
                                  style={{
                                    color: "var(--es-text-primary)",
                                    fontWeight: 500,
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
                                  {primaryGuardian.phone}
                                </div>
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>{student.enrollmentDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === "Active"
                                  ? "success"
                                  : "neutral"
                              }
                              dot
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell style={{ textAlign: "right" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Link href={`/dashboard/students/${student.id}`}>
                                <Button variant="secondary" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                style={{ color: "var(--es-danger)" }}
                                onClick={() => setRemovingStudent(student)}
                              >
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        )}

        {/* TAB 3: TEACHERS */}
        {activeTab === "teachers" && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Assigned Teachers</CardTitle>
                <CardDescription>
                  Class advisor and subject faculty assigned to{" "}
                  {currentClass.name}
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Icon name="plus" size={15} />}
                onClick={() => setIsAssignTeacherOpen(true)}
              >
                Assign Teacher
              </Button>
            </CardHeader>

            <CardBody flush>
              {currentClass.assignedTeachers.length === 0 ? (
                <EmptyState
                  icon="users"
                  title="No teachers assigned to this class"
                  description="Assign a Class Teacher or Subject Teacher to manage attendance and academics for this section."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAssignTeacherOpen(true)}
                    >
                      Assign Teacher
                    </Button>
                  }
                />
              ) : (
                <Table style={{ border: "none", borderRadius: 0 }}>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Teacher Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Subject / Role</TableHeaderCell>
                      <TableHeaderCell>Assignment Status</TableHeaderCell>
                      <TableHeaderCell>Assigned Date</TableHeaderCell>
                      <TableHeaderCell style={{ textAlign: "right" }}>
                        Actions
                      </TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {currentClass.assignedTeachers.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="es-table-cell-primary">
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Avatar name={assignment.teacherName} size="sm" />
                            <span>{assignment.teacherName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.email}</TableCell>
                        <TableCell>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>{assignment.subject}</span>
                            <Badge
                              variant={
                                assignment.role === "Class Teacher"
                                  ? "primary"
                                  : "neutral"
                              }
                            >
                              {assignment.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" dot>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignment.assignedDate}</TableCell>
                        <TableCell style={{ textAlign: "right" }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ color: "var(--es-danger)" }}
                            onClick={() => setRemovingTeacher(assignment)}
                          >
                            Remove Assignment
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* Edit Class Modal */}
      <ClassForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateClass}
        initialData={currentClass}
      />

      {/* Delete Class Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteClassOpen}
        onClose={() => setIsDeleteClassOpen(false)}
        onConfirm={handleDeleteClass}
        title={`Delete ${currentClass.name}?`}
        description={`Are you sure you want to delete ${currentClass.name}? This will remove the class section and return you to the Class Directory.`}
        confirmLabel="Delete Class"
        variant="danger"
      />

      {/* Enroll Student Modal */}
      <EnrollmentModal
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
        classNameLabel={currentClass.name}
        availableStudents={eligibleStudentsForEnrollment}
        onEnroll={handleEnrollStudent}
      />

      {/* Assign Teacher Modal */}
      <TeacherAssignmentModal
        isOpen={isAssignTeacherOpen}
        onClose={() => setIsAssignTeacherOpen(false)}
        classNameLabel={currentClass.name}
        availableTeachers={availableTeachersForAssignment}
        onAssign={handleAssignTeacher}
      />

      {/* Remove Student Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={removingStudent !== null}
        onClose={() => setRemovingStudent(null)}
        onConfirm={handleConfirmRemoveStudent}
        title="Remove Student from Class?"
        description={
          removingStudent
            ? `Are you sure you want to remove ${removingStudent.fullName} from ${currentClass.name}? Their profile will remain in the student directory as Unassigned.`
            : ""
        }
        confirmLabel="Remove Student"
        variant="danger"
      />

      {/* Remove Teacher Assignment Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={removingTeacher !== null}
        onClose={() => setRemovingTeacher(null)}
        onConfirm={handleConfirmRemoveTeacher}
        title="Remove Teacher Assignment?"
        description={
          removingTeacher
            ? `Are you sure you want to remove ${removingTeacher.teacherName} (${removingTeacher.role}) from ${currentClass.name}?`
            : ""
        }
        confirmLabel="Remove Assignment"
        variant="danger"
      />

      {/* Toast Feedback */}
      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </AppLayout>
  );
}
