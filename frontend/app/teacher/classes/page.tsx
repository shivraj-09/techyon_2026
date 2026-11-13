"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
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
} from "@/components/ui";
import { TeacherClassCard } from "@/components/teacher";
import {
  TEACHER_ASSIGNED_CLASSES,
  TEACHER_PROFILE,
} from "@/config/teacher-data";

export default function TeacherClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TEACHER_ASSIGNED_CLASSES.filter((cls) => {
      if (classFilter !== "all" && cls.id !== classFilter) {
        return false;
      }
      if (statusFilter === "Submitted" && cls.attendanceStatusToday !== "Submitted") {
        return false;
      }
      if (statusFilter === "Pending" && cls.attendanceStatusToday !== "Pending") {
        return false;
      }
      if (statusFilter === "class-teacher" && !cls.isClassTeacher) {
        return false;
      }
      if (!q) return true;
      return (
        cls.name.toLowerCase().includes(q) ||
        cls.subject.toLowerCase().includes(q) ||
        cls.room.toLowerCase().includes(q) ||
        cls.section.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, classFilter, statusFilter]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    classFilter !== "all" ||
    statusFilter !== "all";

  function handleClearFilters() {
    setSearchQuery("");
    setClassFilter("all");
    setStatusFilter("all");
  }

  return (
    <AppLayout
      defaultRole="teacher"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "My Classes" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="My Classes"
          subtitle="View and manage your assigned classes."
          actions={
            <>
              <Badge variant="primary">
                {TEACHER_ASSIGNED_CLASSES.length} Assigned Classes ·{" "}
                {TEACHER_PROFILE.academicYear}
              </Badge>
              <Link
                href="/teacher/attendance"
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

        {/* Search & Class/Status Filters */}
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
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                flex: 1,
              }}
            >
              <Input
                id="teacher-classes-search"
                label="Search Classes"
                aria-label="Search assigned classes"
                placeholder="Search by class, subject, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Icon name="search" size={14} />}
              />

              <Select
                id="teacher-classes-select"
                label="Assigned Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Assigned Classes" },
                  ...TEACHER_ASSIGNED_CLASSES.map((cls) => ({
                    value: cls.id,
                    label: cls.name,
                  })),
                ]}
              />

              <Select
                id="teacher-classes-status"
                label="Today's Status & Role"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "Submitted", label: "Attendance Submitted" },
                  { value: "Pending", label: "Attendance Pending" },
                  { value: "class-teacher", label: "Class Teacher Only" },
                ]}
              />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </CardBody>
        </Card>

        {/* Responsive Grid of Assigned Class Cards */}
        {filteredClasses.length > 0 ? (
          <section
            aria-label="Assigned Classes Grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredClasses.map((cls) => (
              <TeacherClassCard key={cls.id} classItem={cls} />
            ))}
          </section>
        ) : (
          <Card>
            <CardBody>
              <EmptyState
                icon="book-open"
                title="No assigned classes match your filters"
                description="Try clearing your search or status filter to view all 4 classes assigned to you."
                action={
                  <Button variant="secondary" onClick={handleClearFilters}>
                    Reset Filters
                  </Button>
                }
              />
            </CardBody>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
