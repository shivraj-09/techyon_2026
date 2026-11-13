"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  Select,
  Tabs,
  Toast,
} from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  ClassCard,
  ClassForm,
  type ClassFormValues,
  ClassTable,
} from "@/components/classes";
import {
  ACADEMIC_YEARS,
  CLASS_DIRECTORY_STATS,
  INITIAL_CLASSES,
  type ClassRecord,
  getStoredClasses,
  saveStoredClasses,
} from "@/config/stage3-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACTS (Not called in Stage 3 Frontend)
 * ============================================================================
 * - GET    /schools/{school_id}/classes
 * - POST   /schools/{school_id}/classes
 * - PATCH  /schools/{school_id}/classes/{class_id}
 * - DELETE /schools/{school_id}/classes/{class_id}
 * ============================================================================
 */

export default function ClassesDirectoryPage() {
  const [classes, setClasses] = useState<ClassRecord[]>(INITIAL_CLASSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setClasses(getStoredClasses());
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesTeacher = item.classTeacher.toLowerCase().includes(q);
        const matchesSection = item.section.toLowerCase().includes(q);
        if (!matchesName && !matchesTeacher && !matchesSection) return false;
      }
      if (gradeFilter !== "all" && item.grade !== gradeFilter) {
        return false;
      }
      if (yearFilter !== "all" && item.academicYear !== yearFilter) {
        return false;
      }
      return true;
    });
  }, [classes, searchQuery, gradeFilter, yearFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || gradeFilter !== "all" || yearFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setGradeFilter("all");
    setYearFilter("all");
  }

  function handleSaveClass(values: ClassFormValues) {
    const className = `${values.grade}-${values.section}`;

    if (editingClass) {
      // Reference contract: PATCH /schools/{school_id}/classes/{class_id}
      const updated = classes.map((c) =>
        c.id === editingClass.id
          ? {
              ...c,
              name: className,
              grade: values.grade,
              section: values.section,
              academicYear: values.academicYear,
              capacity: Number(values.capacity) || 45,
              description: values.description,
            }
          : c,
      );
      setClasses(updated);
      saveStoredClasses(updated);
      setToast({
        title: "Class updated",
        description: `${className} (${values.academicYear}) has been updated.`,
      });
    } else {
      // Reference contract: POST /schools/{school_id}/classes
      const slug = `${values.grade.toLowerCase().replace(/\s+/g, "-")}-${values.section.toLowerCase()}-${Date.now().toString().slice(-3)}`;
      const newClass: ClassRecord = {
        id: slug,
        name: className,
        grade: values.grade,
        section: values.section,
        academicYear: values.academicYear,
        enrolledCount: 0,
        capacity: Number(values.capacity) || 45,
        classTeacher: "Unassigned",
        status: "Active",
        description: values.description,
        attendanceRate: 0,
        presentToday: 0,
        absentToday: 0,
        assignedTeachers: [],
      };
      const updated = [newClass, ...classes];
      setClasses(updated);
      saveStoredClasses(updated);
      setToast({
        title: "Class created",
        description: `${className} has been added to the ${values.academicYear} academic directory.`,
      });
    }

    setIsFormOpen(false);
    setEditingClass(null);
  }

  function handleConfirmDelete() {
    if (!deletingClass) return;
    // Reference contract: DELETE /schools/{school_id}/classes/{class_id}
    const removedName = deletingClass.name;
    const updated = classes.filter((c) => c.id !== deletingClass.id);
    setClasses(updated);
    saveStoredClasses(updated);
    setDeletingClass(null);
    setToast({
      title: "Class removed",
      description: `${removedName} was removed from the directory.`,
    });
  }

  return (
    <AppLayout>
      <div className="es-stack">
        {/* Page Header */}
        <PageHeader
          title="Classes"
          subtitle="Organise academic classes, manage enrollment and assign teachers."
          actions={
            <>
              <Tabs
                tabs={[
                  { id: "grid", label: "Card Grid" },
                  { id: "table", label: "Table View" },
                ]}
                activeTab={viewMode}
                onChange={(id) => setViewMode(id as "grid" | "table")}
              />
              <Button
                variant="primary"
                size="md"
                leftIcon={<Icon name="plus" size={15} />}
                onClick={() => {
                  setEditingClass(null);
                  setIsFormOpen(true);
                }}
              >
                Create Class
              </Button>
            </>
          }
        />

        {/* 4 Overview Statistic Cards */}
        <section className="es-grid-4" aria-label="Class Management Statistics">
          <article className="es-stat-card">
            <div className="es-stat-top">
              <span style={{ fontWeight: 600, color: "var(--es-text-secondary)" }}>
                Total Classes
              </span>
              <span className="es-stat-icon-box">
                <Icon name="book-open" size={16} />
              </span>
            </div>
            <div className="es-stat-value">
              {CLASS_DIRECTORY_STATS.totalClasses}
            </div>
            <div className="es-stat-meta">Across Grades 1 to 12</div>
          </article>

          <article className="es-stat-card">
            <div className="es-stat-top">
              <span style={{ fontWeight: 600, color: "var(--es-text-secondary)" }}>
                Total Enrolled Students
              </span>
              <span className="es-stat-icon-box">
                <Icon name="graduation-cap" size={16} />
              </span>
            </div>
            <div className="es-stat-value">
              {CLASS_DIRECTORY_STATS.totalEnrolledStudents.toLocaleString(
                "en-IN",
              )}
            </div>
            <div className="es-stat-meta">Active section enrollments</div>
          </article>

          <article className="es-stat-card">
            <div className="es-stat-top">
              <span style={{ fontWeight: 600, color: "var(--es-text-secondary)" }}>
                Assigned Teachers
              </span>
              <span className="es-stat-icon-box">
                <Icon name="users" size={16} />
              </span>
            </div>
            <div className="es-stat-value">
              {CLASS_DIRECTORY_STATS.assignedTeachers}
            </div>
            <div className="es-stat-meta">Primary class advisors assigned</div>
          </article>

          <article className="es-stat-card">
            <div className="es-stat-top">
              <span style={{ fontWeight: 600, color: "var(--es-text-secondary)" }}>
                Classes Without Teachers
              </span>
              <span
                className="es-stat-icon-box"
                style={{
                  backgroundColor: "var(--es-warning-bg)",
                  color: "var(--es-warning)",
                  borderColor: "var(--es-warning-border)",
                }}
              >
                <Icon name="alert-triangle" size={16} />
              </span>
            </div>
            <div className="es-stat-value">
              {CLASS_DIRECTORY_STATS.classesWithoutTeachers}
            </div>
            <div
              className="es-stat-meta"
              style={{ color: "var(--es-warning)", fontWeight: 500 }}
            >
              Pending advisor assignment
            </div>
          </article>
        </section>

        {/* Search & Filters Bar */}
        <Card>
          <CardHeader style={{ flexWrap: "wrap", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
                minWidth: "240px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "220px", maxWidth: "340px" }}>
                <Input
                  placeholder="Search by class name, section, or teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ width: "160px" }}>
                <Select
                  aria-label="Filter by grade"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Grades" },
                    { value: "Class 6", label: "Class 6" },
                    { value: "Class 7", label: "Class 7" },
                    { value: "Class 8", label: "Class 8" },
                    { value: "Class 9", label: "Class 9" },
                    { value: "Class 10", label: "Class 10" },
                  ]}
                />
              </div>

              <div style={{ width: "165px" }}>
                <Select
                  aria-label="Filter by academic year"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Academic Years" },
                    ...ACADEMIC_YEARS.map((yr) => ({ value: yr, label: yr })),
                  ]}
                />
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            <div style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
              Showing <strong>{filteredClasses.length}</strong> of{" "}
              {classes.length} classes
            </div>
          </CardHeader>

          {viewMode === "table" && (
            <CardBody flush>
              {filteredClasses.length === 0 ? (
                <EmptyState
                  icon="book-open"
                  title="No matching classes found"
                  description="Try adjusting your grade or academic year filters, or create a new class section."
                  action={
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Reset Filters
                    </Button>
                  }
                />
              ) : (
                <ClassTable
                  classes={filteredClasses}
                  onEdit={(item) => {
                    setEditingClass(item);
                    setIsFormOpen(true);
                  }}
                  onDelete={(item) => setDeletingClass(item)}
                />
              )}
            </CardBody>
          )}
        </Card>

        {/* Card Grid View */}
        {viewMode === "grid" &&
          (filteredClasses.length === 0 ? (
            <Card>
              <CardBody>
                <EmptyState
                  icon="book-open"
                  title="No matching classes found"
                  description="Try adjusting your grade or academic year filters, or create a new class section."
                  action={
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Reset Filters
                    </Button>
                  }
                />
              </CardBody>
            </Card>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredClasses.map((item) => (
                <ClassCard
                  key={item.id}
                  classItem={item}
                  onEdit={(cls) => {
                    setEditingClass(cls);
                    setIsFormOpen(true);
                  }}
                  onDelete={(cls) => setDeletingClass(cls)}
                />
              ))}
            </div>
          ))}
      </div>

      {/* Create / Edit Class Form Modal */}
      <ClassForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClass(null);
        }}
        onSubmit={handleSaveClass}
        initialData={editingClass}
      />

      {/* Delete Class Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingClass !== null}
        onClose={() => setDeletingClass(null)}
        onConfirm={handleConfirmDelete}
        title={deletingClass ? `Delete ${deletingClass.name}?` : "Delete Class"}
        description={
          deletingClass
            ? `Are you sure you want to remove ${deletingClass.name} (${deletingClass.academicYear})? This action will unassign its class schedule from the local directory.`
            : ""
        }
        confirmLabel="Delete Class"
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
