"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { ACADEMIC_YEARS, type ClassRecord } from "@/config/stage3-data";

export interface ClassFormValues {
  grade: string;
  section: string;
  academicYear: string;
  capacity: string;
  description: string;
}

export interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ClassFormValues) => void;
  initialData?: ClassRecord | null;
}

const GRADE_OPTIONS = [
  { value: "", label: "Select Grade / Class" },
  { value: "Class 6", label: "Class 6" },
  { value: "Class 7", label: "Class 7" },
  { value: "Class 8", label: "Class 8" },
  { value: "Class 9", label: "Class 9" },
  { value: "Class 10", label: "Class 10" },
  { value: "Class 11", label: "Class 11" },
  { value: "Class 12", label: "Class 12" },
];

const SECTION_OPTIONS = [
  { value: "", label: "Select Section" },
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },
];

export function ClassForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ClassFormProps) {
  const [grade, setGrade] = useState("Class 6");
  const [section, setSection] = useState("A");
  const [academicYear, setAcademicYear] = useState(
    ACADEMIC_YEARS[0] || "2026-2027",
  );
  const [capacity, setCapacity] = useState("45");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setGrade(initialData.grade || initialData.name.split("-")[0] || "Class 6");
      setSection(initialData.section || "A");
      setAcademicYear(initialData.academicYear || "2026-2027");
      setCapacity(String(initialData.capacity || 45));
      setDescription(initialData.description || "");
    } else {
      setGrade("Class 6");
      setSection("A");
      setAcademicYear(ACADEMIC_YEARS[0] || "2026-2027");
      setCapacity("45");
      setDescription("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!grade.trim()) {
      nextErrors.grade = "Class Name / Grade is required.";
    }
    if (!section.trim()) {
      nextErrors.section = "Section is required.";
    }
    if (!academicYear.trim()) {
      nextErrors.academicYear = "Academic Year is required.";
    }
    if (capacity.trim()) {
      const num = Number(capacity);
      if (Number.isNaN(num) || num < 1 || num > 120) {
        nextErrors.capacity = "Capacity must be a number between 1 and 120.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      grade: grade.trim(),
      section: section.trim().toUpperCase(),
      academicYear: academicYear.trim(),
      capacity: capacity.trim() || "45",
      description: description.trim(),
    });
  }

  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${initialData?.name}` : "Create New Class"}
      description={
        isEditing
          ? "Update class section details, academic year, and student capacity."
          : "Configure a new academic class section for student enrollment and teacher assignment."
      }
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="es-class-form">
            Save Class
          </Button>
        </>
      }
    >
      <form
        id="es-class-form"
        onSubmit={handleFormSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        noValidate
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <Select
              label="Class Name / Grade *"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              options={GRADE_OPTIONS}
            />
            {errors.grade && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-danger)",
                  marginTop: "4px",
                }}
              >
                {errors.grade}
              </div>
            )}
          </div>
          <div>
            <Select
              label="Section *"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              options={SECTION_OPTIONS}
            />
            {errors.section && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-danger)",
                  marginTop: "4px",
                }}
              >
                {errors.section}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <Select
              label="Academic Year *"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              options={ACADEMIC_YEARS.map((yr) => ({ value: yr, label: yr }))}
            />
            {errors.academicYear && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-danger)",
                  marginTop: "4px",
                }}
              >
                {errors.academicYear}
              </div>
            )}
          </div>
          <div>
            <Input
              label="Maximum Student Capacity (Optional)"
              type="number"
              min={1}
              max={120}
              placeholder="e.g. 45"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
            {errors.capacity && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-danger)",
                  marginTop: "4px",
                }}
              >
                {errors.capacity}
              </div>
            )}
          </div>
        </div>

        <div className="es-field">
          <label className="es-label" htmlFor="es-class-desc">
            Description (Optional)
          </label>
          <textarea
            id="es-class-desc"
            className="es-input"
            rows={3}
            style={{
              height: "auto",
              padding: "8px 12px",
              resize: "vertical",
            }}
            placeholder="Add classroom location, stream notes, or academic remarks..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
