"use client";

import React, { useMemo, useState } from "react";
import { Avatar, Badge, Button, Icon, Input, Modal } from "@/components/ui";
import type { StudentRecord } from "@/config/stage3-data";

export interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameLabel: string;
  availableStudents: StudentRecord[];
  onEnroll: (studentId: string) => void;
}

export function EnrollmentModal({
  isOpen,
  onClose,
  classNameLabel,
  availableStudents,
  onEnroll,
}: EnrollmentModalProps) {
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableStudents;
    return availableStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q),
    );
  }, [availableStudents, search]);

  function handleConfirm() {
    if (!selectedStudentId) return;
    onEnroll(selectedStudentId);
    setSelectedStudentId("");
    setSearch("");
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedStudentId("");
        setSearch("");
        onClose();
      }}
      title={`Enroll Student in ${classNameLabel}`}
      description="Select a student not currently enrolled in this class section."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!selectedStudentId}
            onClick={handleConfirm}
          >
            Enroll Student
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Input
          placeholder="Search by student name, ID, or current class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div
          style={{
            maxHeight: "260px",
            overflowY: "auto",
            border: "1px solid var(--es-border)",
            borderRadius: "var(--es-radius-md)",
            divideY: "1px solid var(--es-border-subtle)",
          } as React.CSSProperties}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
                fontSize: "13px",
                color: "var(--es-text-muted)",
              }}
            >
              No eligible students match your search.
            </div>
          ) : (
            filtered.map((student) => {
              const isSelected = selectedStudentId === student.id;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudentId(student.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "10px 12px",
                    border: "none",
                    borderBottom: "1px solid var(--es-border-subtle)",
                    backgroundColor: isSelected
                      ? "var(--es-primary-subtle)"
                      : "var(--es-bg-surface)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--es-font-sans)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      minWidth: 0,
                    }}
                  >
                    <Avatar name={student.fullName} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {student.fullName}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {student.studentId} · Current: {student.className}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Badge
                      variant={
                        student.className === "Unassigned"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {student.className}
                    </Badge>
                    {isSelected && (
                      <span style={{ color: "var(--es-primary)" }}>
                        <Icon name="check-circle" size={16} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
