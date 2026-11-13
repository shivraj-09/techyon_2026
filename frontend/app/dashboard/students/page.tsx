"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardBody,
  Icon,
  Modal,
  StatCard,
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  StudentFilters,
  StudentForm,
  StudentTable,
} from "@/components/students";
import {
  getStoredStudents,
  INITIAL_STUDENTS,
  saveStoredStudents,
  STUDENT_DIRECTORY_STATS,
  type StudentRecord,
} from "@/config/stage3-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACTS (Not called in Stage 3 Frontend Mode)
 * ============================================================================
 * - GET /schools/{school_id}/students
 * - POST /schools/{school_id}/students
 * - GET /schools/{school_id}/students/{student_id}
 * - PATCH /schools/{school_id}/students/{student_id}
 * ============================================================================
 */

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(
    null,
  );
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(
    null,
  );
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setStudents(getStoredStudents());
  }, []);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter((stu) => {
      if (query) {
        const matchesName = stu.fullName.toLowerCase().includes(query);
        const matchesId = stu.studentId.toLowerCase().includes(query);
        const matchesAdmission = stu.admissionNumber
          .toLowerCase()
          .includes(query);
        if (!matchesName && !matchesId && !matchesAdmission) {
          return false;
        }
      }

      if (classFilter !== "all" && stu.className !== classFilter) {
        return false;
      }

      if (statusFilter !== "all" && stu.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  function handleClearFilters() {
    setSearchQuery("");
    setClassFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  }

  function handleSaveStudent(updated: StudentRecord) {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === updated.id);
      const next = exists
        ? prev.map((s) => (s.id === updated.id ? updated : s))
        : [updated, ...prev];
      saveStoredStudents(next);
      return next;
    });
    setEditingStudent(null);
    setToast({
      title: "Student record saved",
      description: `${updated.fullName} (${updated.studentId}) has been updated.`,
    });
  }

  function handleToggleStatus(student: StudentRecord) {
    const nextStatus = student.status === "Active" ? "Inactive" : "Active";
    setStudents((prev) => {
      const next = prev.map((s) =>
        s.id === student.id ? { ...s, status: nextStatus as "Active" | "Inactive" } : s,
      );
      saveStoredStudents(next);
      return next;
    });
    setToast({
      title: `Status updated to ${nextStatus}`,
      description: `${student.fullName} is now marked as ${nextStatus}.`,
    });
  }

  function handleConfirmDelete() {
    if (!deletingStudent) return;
    const removed = deletingStudent;
    setStudents((prev) => {
      const next = prev.filter((s) => s.id !== removed.id);
      saveStoredStudents(next);
      return next;
    });
    setDeletingStudent(null);
    setToast({
      title: "Student record removed",
      description: `${removed.fullName} was removed from the local directory.`,
    });
  }

  return (
    <AppLayout>
      <div className="es-stack">
        {/* Page Header */}
        <PageHeader
          title="Students"
          subtitle="Manage student records, profiles and class enrollment."
          actions={
            <>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="filter" size={15} />}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                {showFilters ? "Hide Filters" : "Filter"}
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="download" size={15} />}
                onClick={() =>
                  setToast({
                    title: "Directory export prepared",
                    description: `Exporting ${filteredStudents.length} student records (CSV preview).`,
                  })
                }
              >
                Export
              </Button>
              <Link href="/dashboard/students/new">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Icon name="plus" size={15} />}
                >
                  Add Student
                </Button>
              </Link>
            </>
          }
        />

        {/* Four Compact Statistic Cards */}
        <section className="es-grid-4" aria-label="Student Directory Statistics">
          <StatCard
            label="Total Students"
            value={STUDENT_DIRECTORY_STATS.totalStudents.toLocaleString("en-IN")}
            meta="Enrolled across all grades"
            icon={
              <span className="es-stat-icon-box">
                <Icon name="users" size={16} />
              </span>
            }
          />
          <StatCard
            label="Active Students"
            value={STUDENT_DIRECTORY_STATS.activeStudents.toLocaleString("en-IN")}
            meta="97.0% active attendance status"
            icon={
              <span className="es-stat-icon-box">
                <Icon name="check-circle" size={16} />
              </span>
            }
          />
          <StatCard
            label="Newly Registered"
            value={STUDENT_DIRECTORY_STATS.newlyRegistered}
            meta="Admitted this academic term"
            icon={
              <span className="es-stat-icon-box">
                <Icon name="user-plus" size={16} />
              </span>
            }
          />
          <StatCard
            label="Unassigned Students"
            value={STUDENT_DIRECTORY_STATS.unassignedStudents}
            meta="Pending section allocation"
            icon={
              <span className="es-stat-icon-box">
                <Icon name="alert-triangle" size={16} />
              </span>
            }
          />
        </section>

        {/* Directory Card: Filters + Table */}
        <Card>
          {showFilters && (
            <StudentFilters
              searchQuery={searchQuery}
              onSearchChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              classFilter={classFilter}
              onClassFilterChange={(val) => {
                setClassFilter(val);
                setCurrentPage(1);
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              onClearFilters={handleClearFilters}
              totalCount={students.length}
              filteredCount={filteredStudents.length}
            />
          )}

          <CardBody flush>
            <StudentTable
              students={filteredStudents}
              currentPage={currentPage}
              pageSize={6}
              onPageChange={setCurrentPage}
              onEditStudent={(stu) => setEditingStudent(stu)}
              onToggleStatus={handleToggleStatus}
              onDeleteStudent={(stu) => setDeletingStudent(stu)}
              onClearFilters={handleClearFilters}
            />
          </CardBody>
        </Card>
      </div>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editingStudent !== null}
        onClose={() => setEditingStudent(null)}
        title={
          editingStudent
            ? `Edit Student — ${editingStudent.fullName}`
            : "Edit Student"
        }
        description="Update student demographics, academic class, or guardian contact information."
      >
        <div style={{ maxHeight: "72vh", overflowY: "auto", paddingRight: "4px" }}>
          {editingStudent && (
            <StudentForm
              initialStudent={editingStudent}
              onCancel={() => setEditingStudent(null)}
              onSave={handleSaveStudent}
            />
          )}
        </div>
      </Modal>

      {/* Delete Student Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingStudent !== null}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Student Record"
        description={
          deletingStudent
            ? `Are you sure you want to remove ${deletingStudent.fullName} (${deletingStudent.studentId}) from the student directory?`
            : ""
        }
        confirmLabel="Remove Student"
        variant="danger"
      />

      {/* Toast Notification */}
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
