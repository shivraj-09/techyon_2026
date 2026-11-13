"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import {
  FEE_CATEGORIES,
  computeInvoiceStatus,
  formatINR,
  type FeeCategory,
  type FeeInvoiceRecord,
} from "@/config/fee-data";
import { ACADEMIC_YEARS, getStoredStudents } from "@/config/stage3-data";

export interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: FeeInvoiceRecord, isEdit: boolean) => void;
  initialInvoice?: FeeInvoiceRecord | null;
}

export function InvoiceForm({
  isOpen,
  onClose,
  onSave,
  initialInvoice,
}: InvoiceFormProps) {
  const students = getStoredStudents();
  const isEdit = Boolean(initialInvoice);

  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id || "stu-101",
  );
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeeCategory>("Tuition Fee");
  const [invoiceDate, setInvoiceDate] = useState("2026-11-14");
  const [dueDate, setDueDate] = useState("2026-11-30");
  const [description, setDescription] = useState("");
  const [originalAmount, setOriginalAmount] = useState("25000");
  const [discount, setDiscount] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialInvoice) {
      setSelectedStudentId(initialInvoice.studentId);
      setAcademicYear(initialInvoice.academicYear);
      setTitle(initialInvoice.title);
      setCategory(initialInvoice.category);
      setInvoiceDate(initialInvoice.invoiceDate);
      setDueDate(initialInvoice.dueDate);
      setDescription(initialInvoice.description || "");
      setOriginalAmount(String(initialInvoice.originalAmount));
      setDiscount(String(initialInvoice.discount));
      setErrors({});
    } else {
      setSelectedStudentId(students[0]?.id || "stu-101");
      setAcademicYear("2026-2027");
      setTitle("Term II Tuition & Academic Fee");
      setCategory("Tuition Fee");
      setInvoiceDate("2026-11-14");
      setDueDate("2026-11-30");
      setDescription("");
      setOriginalAmount("25000");
      setDiscount("0");
      setErrors({});
    }
  }, [initialInvoice, isOpen]);

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  const parsedOriginal = Math.max(0, Number(originalAmount) || 0);
  const parsedDiscount = Math.max(0, Number(discount) || 0);
  const finalAmount = Math.max(0, parsedOriginal - parsedDiscount);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!selectedStudentId) nextErrors.student = "Please select a student.";
    if (!title.trim()) nextErrors.title = "Invoice title is required.";
    if (!invoiceDate) nextErrors.invoiceDate = "Invoice date is required.";
    if (!dueDate) nextErrors.dueDate = "Due date is required.";
    if (parsedOriginal <= 0) {
      nextErrors.originalAmount = "Total amount must be greater than ₹0.";
    }
    if (parsedDiscount >= parsedOriginal && parsedOriginal > 0) {
      nextErrors.discount = "Discount cannot exceed or equal the total amount.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const paidAmount = initialInvoice ? initialInvoice.paidAmount : 0;
    const balanceAmount = Math.max(0, finalAmount - paidAmount);
    const status = computeInvoiceStatus(finalAmount, paidAmount, dueDate);

    const record: FeeInvoiceRecord = {
      id: initialInvoice?.id || `inv-${Date.now()}`,
      invoiceId:
        initialInvoice?.invoiceId ||
        `INV-2026-${Math.floor(110 + Math.random() * 890)}`,
      studentId: currentStudent?.id || selectedStudentId,
      studentCode: currentStudent?.studentId || "STU-2026-001",
      studentName: currentStudent?.fullName || "Aarav Naik",
      className: currentStudent?.className || "Class 8-A",
      guardianName:
        currentStudent?.guardians?.[0]?.name || "Suresh Naik",
      guardianPhone:
        currentStudent?.guardians?.[0]?.phone || "+91 98230 11223",
      academicYear,
      title: title.trim(),
      category,
      invoiceDate,
      dueDate,
      description: description.trim() || undefined,
      originalAmount: parsedOriginal,
      discount: parsedDiscount,
      totalAmount: finalAmount,
      paidAmount,
      balanceAmount,
      status,
    };

    onSave(record, isEdit);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Invoice — ${initialInvoice?.invoiceId}` : "Create Fee Invoice"}
      description="Generate a student fee invoice with automatic amount calculation."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Create Invoice"}
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Section 1: Student Details */}
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--es-primary)",
              marginBottom: "10px",
            }}
          >
            1. Student Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Select
                label="Select Student *"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                options={students.map((s) => ({
                  value: s.id,
                  label: `${s.fullName} (${s.studentId} · ${s.className})`,
                }))}
              />
              {errors.student && (
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--es-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.student}
                </span>
              )}
            </div>

            <Input
              label="Student ID (Auto-populated)"
              value={currentStudent?.studentId || ""}
              readOnly
              disabled
            />

            <Input
              label="Class (Auto-populated)"
              value={currentStudent?.className || ""}
              readOnly
              disabled
            />

            <div style={{ gridColumn: "1 / -1" }}>
              <Select
                label="Academic Year *"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Invoice Details */}
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--es-primary)",
              marginBottom: "10px",
            }}
          >
            2. Invoice Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Input
                label="Invoice Title *"
                placeholder="e.g. Term II Tuition Fee"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--es-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.title}
                </span>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <Select
                label="Fee Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value as FeeCategory)}
                options={FEE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </div>

            <div>
              <Input
                type="date"
                label="Invoice Date *"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
              {errors.invoiceDate && (
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--es-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.invoiceDate}
                </span>
              )}
            </div>

            <div>
              <Input
                type="date"
                label="Due Date *"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {errors.dueDate && (
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--es-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.dueDate}
                </span>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <Input
                label="Description (Optional)"
                placeholder="Optional fee breakdown notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Amount Details */}
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--es-primary)",
              marginBottom: "10px",
            }}
          >
            3. Amount Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <Input
                type="number"
                min="0"
                label="Total Amount (₹) *"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
              />
              {errors.originalAmount && (
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--es-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.originalAmount}
                </span>
              )}
            </div>

            <div>
              <Input
                type="number"
                min="0"
                label="Discount (₹, Optional)"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              {errors.discount && (
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--es-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.discount}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              padding: "12px 14px",
              backgroundColor: "var(--es-primary-subtle)",
              border: "1px solid var(--es-primary-border)",
              borderRadius: "var(--es-radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--es-text-primary)",
              }}
            >
              Final Calculated Invoice Amount
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--es-primary)",
              }}
            >
              {formatINR(finalAmount)}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
