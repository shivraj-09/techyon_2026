"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Input,
  Select,
} from "@/components/ui";
import {
  ACADEMIC_YEARS,
  CLASS_OPTIONS,
  type StudentRecord,
} from "@/config/stage3-data";

export interface StudentFormValues {
  // Section A — Student Information
  fullName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  studentId: string;
  bloodGroup: string;
  address: string;
  profilePhotoName: string;
  status: "Active" | "Inactive";
  // Section B — Academic Information
  academicYear: string;
  className: string;
  enrollmentDate: string;
  admissionNumber: string;
  // Section C — Guardian Information
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;
}

export interface StudentFormProps {
  initialStudent?: StudentRecord | null;
  onCancel: () => void;
  onSave: (student: StudentRecord) => void;
}

export function StudentForm({
  initialStudent,
  onCancel,
  onSave,
}: StudentFormProps) {
  const primaryGuardian = initialStudent?.guardians?.[0];

  const [values, setValues] = useState<StudentFormValues>({
    fullName: initialStudent?.fullName || "",
    dateOfBirth: initialStudent?.dateOfBirth || "",
    gender: initialStudent?.gender || "Male",
    studentId:
      initialStudent?.studentId ||
      `STU-2026-${String(Math.floor(100 + Math.random() * 899))}`,
    bloodGroup: initialStudent?.bloodGroup || "O+",
    address: initialStudent?.address || "",
    profilePhotoName: "",
    status: initialStudent?.status || "Active",
    academicYear: initialStudent?.academicYear || ACADEMIC_YEARS[0],
    className: initialStudent?.className || "Class 8-A",
    enrollmentDate:
      initialStudent?.enrollmentDate || new Date().toISOString().slice(0, 10),
    admissionNumber:
      initialStudent?.admissionNumber ||
      `ADM-26-${String(Math.floor(1000 + Math.random() * 8999))}`,
    guardianName: primaryGuardian?.name || "",
    guardianRelationship: primaryGuardian?.relationship || "Father",
    guardianPhone: primaryGuardian?.phone || "",
    guardianEmail: primaryGuardian?.email || "",
    guardianAddress: primaryGuardian?.address || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormValues, string>>>({});

  function updateField<K extends keyof StudentFormValues>(
    field: K,
    value: StudentFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof StudentFormValues, string>> = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Student full name is required.";
    }
    if (!values.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    }
    if (!values.studentId.trim()) {
      nextErrors.studentId = "Student ID is required.";
    }
    if (!values.address.trim()) {
      nextErrors.address = "Residential address is required.";
    }
    if (!values.academicYear) {
      nextErrors.academicYear = "Academic year is required.";
    }
    if (!values.className) {
      nextErrors.className = "Assigned class is required.";
    }
    if (!values.enrollmentDate) {
      nextErrors.enrollmentDate = "Enrollment date is required.";
    }
    if (!values.admissionNumber.trim()) {
      nextErrors.admissionNumber = "Admission number is required.";
    }
    if (!values.guardianName.trim()) {
      nextErrors.guardianName = "Guardian full name is required.";
    }
    if (!values.guardianRelationship.trim()) {
      nextErrors.guardianRelationship = "Relationship is required.";
    }
    if (!values.guardianPhone.trim()) {
      nextErrors.guardianPhone = "Guardian phone number is required.";
    } else if (values.guardianPhone.replace(/\D/g, "").length < 10) {
      nextErrors.guardianPhone = "Enter a valid 10-digit phone number.";
    }
    if (!values.guardianEmail.trim()) {
      nextErrors.guardianEmail = "Guardian email address is required.";
    } else if (!values.guardianEmail.includes("@")) {
      nextErrors.guardianEmail = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const classSlug =
      values.className === "Unassigned"
        ? ""
        : values.className.toLowerCase().replace(/\s+/g, "-");

    const updatedStudent: StudentRecord = {
      id: initialStudent?.id || `stu-${Date.now()}`,
      studentId: values.studentId.trim(),
      fullName: values.fullName.trim(),
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      bloodGroup: values.bloodGroup || undefined,
      address: values.address.trim(),
      academicYear: values.academicYear,
      classId: classSlug,
      className: values.className,
      enrollmentDate: values.enrollmentDate,
      admissionNumber: values.admissionNumber.trim(),
      status: values.status,
      guardians: [
        {
          id: primaryGuardian?.id || `g-${Date.now()}`,
          name: values.guardianName.trim(),
          relationship: values.guardianRelationship,
          phone: values.guardianPhone.trim(),
          email: values.guardianEmail.trim(),
          address: values.guardianAddress.trim() || values.address.trim(),
          isPrimary: true,
        },
        ...(initialStudent?.guardians?.slice(1) || []),
      ],
      attendanceSummary: initialStudent?.attendanceSummary || {
        percentage: 96.0,
        presentDays: 144,
        absentDays: 6,
        lateDays: 2,
        history: [
          { date: "14 Nov 2026", status: "Present", remarks: "On time" },
          { date: "13 Nov 2026", status: "Present", remarks: "On time" },
          { date: "12 Nov 2026", status: "Present", remarks: "On time" },
        ],
      },
      feeSummary: initialStudent?.feeSummary || {
        totalFees: 68000,
        amountPaid: 51000,
        outstandingAmount: 17000,
        payments: [
          {
            id: "pay-init-1",
            receiptNo: "REC-2026-101",
            date: "10 Aug 2026",
            installment: "Term I Tuition & Lab Fee",
            amount: 34000,
            method: "UPI / NEFT",
            status: "Paid",
          },
          {
            id: "pay-init-2",
            receiptNo: "REC-2026-289",
            date: "05 Nov 2026",
            installment: "Term II Tuition Fee (Part 1)",
            amount: 17000,
            method: "Online Portal",
            status: "Paid",
          },
        ],
      },
    };

    onSave(updatedStudent);
  }

  const fieldGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "16px",
  };

  const errorTextStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--es-danger)",
    marginTop: "4px",
  };

  return (
    <form onSubmit={handleSubmit} className="es-stack" noValidate>
      {/* Section A — Student Information */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Section A — Student Information</CardTitle>
            <CardDescription>
              Personal identity, demographics, and residential details
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody className="es-stack">
          {/* Profile Photo Optional UI */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px 16px",
              backgroundColor: "var(--es-bg-app)",
              border: "1px solid var(--es-border-subtle)",
              borderRadius: "var(--es-radius-md)",
            }}
          >
            <Avatar name={values.fullName || "Student"} size="lg" />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                }}
              >
                Profile Photo{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: "var(--es-text-muted)",
                    fontSize: "12px",
                  }}
                >
                  (Optional)
                </span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-text-muted)",
                  marginTop: "2px",
                }}
              >
                {values.profilePhotoName
                  ? `Selected: ${values.profilePhotoName}`
                  : "Upload a passport-size student photograph (JPG or PNG, max 2 MB)."}
              </div>
            </div>
            <label
              className="es-btn es-btn-secondary es-btn-sm"
              style={{ cursor: "pointer" }}
            >
              <span>Choose Photo</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) updateField("profilePhotoName", file.name);
                }}
              />
            </label>
          </div>

          <div style={fieldGridStyle}>
            <div>
              <Input
                label="Full Name *"
                placeholder="e.g. Aarav Naik"
                value={values.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
              />
              {errors.fullName && (
                <div style={errorTextStyle}>{errors.fullName}</div>
              )}
            </div>

            <div>
              <Input
                label="Date of Birth *"
                type="date"
                value={values.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
              />
              {errors.dateOfBirth && (
                <div style={errorTextStyle}>{errors.dateOfBirth}</div>
              )}
            </div>

            <div>
              <Select
                label="Gender *"
                value={values.gender}
                onChange={(e) =>
                  updateField(
                    "gender",
                    e.target.value as StudentFormValues["gender"],
                  )
                }
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </div>

            <div>
              <Input
                label="Student ID *"
                placeholder="e.g. STU-2026-015"
                value={values.studentId}
                onChange={(e) => updateField("studentId", e.target.value)}
              />
              {errors.studentId && (
                <div style={errorTextStyle}>{errors.studentId}</div>
              )}
            </div>

            <div>
              <Select
                label="Blood Group (Optional)"
                value={values.bloodGroup}
                onChange={(e) => updateField("bloodGroup", e.target.value)}
                options={[
                  { value: "", label: "Not Specified" },
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                ]}
              />
            </div>

            <div>
              <Select
                label="Enrollment Status *"
                value={values.status}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value as StudentFormValues["status"],
                  )
                }
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          <div>
            <Input
              label="Residential Address *"
              placeholder="House/Flat No., Street, Locality, City, PIN"
              value={values.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
            {errors.address && (
              <div style={errorTextStyle}>{errors.address}</div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Section B — Academic Information */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Section B — Academic Information</CardTitle>
            <CardDescription>
              Class assignment, admission details, and academic session
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <div style={fieldGridStyle}>
            <div>
              <Select
                label="Academic Year *"
                value={values.academicYear}
                onChange={(e) => updateField("academicYear", e.target.value)}
                options={ACADEMIC_YEARS.map((yr) => ({ value: yr, label: yr }))}
              />
              {errors.academicYear && (
                <div style={errorTextStyle}>{errors.academicYear}</div>
              )}
            </div>

            <div>
              <Select
                label="Class *"
                value={values.className}
                onChange={(e) => updateField("className", e.target.value)}
                options={[
                  ...CLASS_OPTIONS.map((cls) => ({
                    value: cls.name,
                    label: cls.name,
                  })),
                  { value: "Unassigned", label: "Unassigned" },
                ]}
              />
              {errors.className && (
                <div style={errorTextStyle}>{errors.className}</div>
              )}
            </div>

            <div>
              <Input
                label="Enrollment Date *"
                type="date"
                value={values.enrollmentDate}
                onChange={(e) => updateField("enrollmentDate", e.target.value)}
              />
              {errors.enrollmentDate && (
                <div style={errorTextStyle}>{errors.enrollmentDate}</div>
              )}
            </div>

            <div>
              <Input
                label="Admission Number *"
                placeholder="e.g. ADM-26-1048"
                value={values.admissionNumber}
                onChange={(e) => updateField("admissionNumber", e.target.value)}
              />
              {errors.admissionNumber && (
                <div style={errorTextStyle}>{errors.admissionNumber}</div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Section C — Guardian Information */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Section C — Guardian Information</CardTitle>
            <CardDescription>
              Primary parent or legal guardian emergency contact details
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody className="es-stack">
          <div style={fieldGridStyle}>
            <div>
              <Input
                label="Guardian Full Name *"
                placeholder="e.g. Rajesh Naik"
                value={values.guardianName}
                onChange={(e) => updateField("guardianName", e.target.value)}
              />
              {errors.guardianName && (
                <div style={errorTextStyle}>{errors.guardianName}</div>
              )}
            </div>

            <div>
              <Select
                label="Relationship to Student *"
                value={values.guardianRelationship}
                onChange={(e) =>
                  updateField("guardianRelationship", e.target.value)
                }
                options={[
                  { value: "Father", label: "Father" },
                  { value: "Mother", label: "Mother" },
                  { value: "Legal Guardian", label: "Legal Guardian" },
                  { value: "Grandparent", label: "Grandparent" },
                ]}
              />
              {errors.guardianRelationship && (
                <div style={errorTextStyle}>{errors.guardianRelationship}</div>
              )}
            </div>

            <div>
              <Input
                label="Phone Number *"
                placeholder="e.g. +91 98230 11223"
                value={values.guardianPhone}
                onChange={(e) => updateField("guardianPhone", e.target.value)}
              />
              {errors.guardianPhone && (
                <div style={errorTextStyle}>{errors.guardianPhone}</div>
              )}
            </div>

            <div>
              <Input
                label="Email Address *"
                type="email"
                placeholder="e.g. rajesh.naik@example.in"
                value={values.guardianEmail}
                onChange={(e) => updateField("guardianEmail", e.target.value)}
              />
              {errors.guardianEmail && (
                <div style={errorTextStyle}>{errors.guardianEmail}</div>
              )}
            </div>
          </div>

          <div>
            <Input
              label="Guardian Address (Optional — defaults to student address)"
              placeholder="Leave blank if same as student residential address"
              value={values.guardianAddress}
              onChange={(e) => updateField("guardianAddress", e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Form Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "10px",
          paddingTop: "4px",
        }}
      >
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          leftIcon={<Icon name="check-circle" size={16} />}
        >
          Save Student
        </Button>
      </div>
    </form>
  );
}
