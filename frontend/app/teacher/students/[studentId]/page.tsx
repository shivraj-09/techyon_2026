"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Card, CardBody, EmptyState, Icon } from "@/components/ui";
import { TeacherStudentProfile } from "@/components/teacher";
import { TEACHER_STUDENTS } from "@/config/teacher-data";

export default function TeacherStudentProfilePage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params?.studentId || "";

  const student = useMemo(
    () =>
      TEACHER_STUDENTS.find(
        (stu) => stu.id === studentId || stu.studentId === studentId,
      ) || null,
    [studentId],
  );

  if (!student) {
    return (
      <AppLayout
        defaultRole="teacher"
        breadcrumbs={[
          { label: "Teacher", href: "/teacher/dashboard" },
          { label: "Students", href: "/teacher/students" },
          { label: "Not Found" },
        ]}
      >
        <Card>
          <CardBody>
            <EmptyState
              icon="graduation-cap"
              title="Student not found in your assigned classes"
              description="Teachers can view academic and attendance profiles only for students enrolled in their assigned classes."
              action={
                <Link
                  href="/teacher/students"
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="primary">Back to Students</Button>
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
        { label: "Students", href: "/teacher/students" },
        { label: student.fullName },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title={student.fullName}
          subtitle={`${student.studentId} · ${student.className} · Roll No. ${student.rollNumber}`}
          actions={
            <>
              <Link
                href={`/teacher/classes/${student.classId}`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Icon name="book-open" size={15} />}
                >
                  View {student.className}
                </Button>
              </Link>
              <Link href="/teacher/students" style={{ textDecoration: "none" }}>
                <Button variant="ghost" size="md">
                  Back to Students
                </Button>
              </Link>
            </>
          }
        />

        <TeacherStudentProfile student={student} />
      </div>
    </AppLayout>
  );
}
