"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon, Modal, Toast } from "@/components/ui";
import { StudentForm } from "@/components/students";
import {
  getStoredStudents,
  saveStoredStudents,
  type StudentRecord,
} from "@/config/stage3-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACT (Not called in Stage 3 Frontend Mode)
 * ============================================================================
 * - POST /schools/{school_id}/students
 * - POST /schools/{school_id}/students/{student_id}/enrollments
 * ============================================================================
 */

export default function AddStudentPage() {
  const router = useRouter();
  const [savedStudent, setSavedStudent] = useState<StudentRecord | null>(null);
  const [showToast, setShowToast] = useState(false);

  function handleSave(newStudent: StudentRecord) {
    const existing = getStoredStudents();
    const updated = [newStudent, ...existing];
    saveStoredStudents(updated);
    setSavedStudent(newStudent);
    setShowToast(true);
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Students", href: "/dashboard/students" },
        { label: "Add Student" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Register New Student"
          subtitle="Complete student personal information, academic section enrollment, and primary guardian details."
          actions={
            <Link href="/dashboard/students">
              <Button variant="secondary" size="md">
                Back to Students
              </Button>
            </Link>
          }
        />

        <StudentForm
          onCancel={() => router.push("/dashboard/students")}
          onSave={handleSave}
        />
      </div>

      {/* Confirmation Modal after Registration */}
      <Modal
        isOpen={savedStudent !== null}
        onClose={() => setSavedStudent(null)}
        title="Student Registered Successfully"
        description="The new student record has been saved to the school directory."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard/students")}
            >
              Return to Directory
            </Button>
            {savedStudent && (
              <Button
                variant="primary"
                rightIcon={<Icon name="arrow-up-right" size={14} />}
                onClick={() =>
                  router.push(`/dashboard/students/${savedStudent.id}`)
                }
              >
                View Student Profile
              </Button>
            )}
          </>
        }
      >
        {savedStudent && (
          <div
            style={{
              fontSize: "13.5px",
              color: "var(--es-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>{savedStudent.fullName}</strong> has been assigned Student
              ID{" "}
              <code
                style={{
                  fontFamily: "var(--es-font-mono)",
                  fontWeight: 600,
                }}
              >
                {savedStudent.studentId}
              </code>{" "}
              in <strong>{savedStudent.className}</strong>.
            </p>
            <p style={{ margin: 0, color: "var(--es-text-muted)" }}>
              Primary guardian:{" "}
              <strong>{savedStudent.guardians[0]?.name}</strong> (
              {savedStudent.guardians[0]?.phone}).
            </p>
          </div>
        )}
      </Modal>

      {showToast && savedStudent && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title="Student registered"
            description={`${savedStudent.fullName} (${savedStudent.studentId}) added to ${savedStudent.className}.`}
            onDismiss={() => setShowToast(false)}
          />
        </div>
      )}
    </AppLayout>
  );
}
