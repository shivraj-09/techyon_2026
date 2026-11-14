"use client";

import React from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import { Badge, Button, Card, CardBody, Icon } from "@/components/ui";
import { TeacherStudentTable } from "@/components/teacher";
import { TEACHER_ASSIGNED_CLASSES, TEACHER_STUDENTS } from "@/config/teacher-data";

export default function TeacherStudentsPage() {
  return (
    <AppLayout
      defaultRole="teacher"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "Students" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Students"
          subtitle="Students enrolled in your assigned classes."
          actions={
            <>
              <Badge variant="primary">
                {TEACHER_STUDENTS.length} Roster Profiles ·{" "}
                {TEACHER_ASSIGNED_CLASSES.length} Assigned Classes
              </Badge>
              <Link href="/teacher/classes" style={{ textDecoration: "none" }}>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Icon name="book-open" size={15} />}
                >
                  My Classes
                </Button>
              </Link>
            </>
          }
        />

        <Card>
          <CardBody flush>
            <TeacherStudentTable
              students={TEACHER_STUDENTS}
              showFilters={true}
              showClassFilter={true}
            />
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
