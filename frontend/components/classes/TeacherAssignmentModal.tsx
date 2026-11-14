"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Icon,
  Input,
  Modal,
  Select,
} from "@/components/ui";
import type { TeacherDirectoryItem } from "@/config/stage3-data";

export interface TeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameLabel: string;
  availableTeachers: TeacherDirectoryItem[];
  onAssign: (
    teacher: TeacherDirectoryItem,
    role: "Class Teacher" | "Subject Teacher",
  ) => void;
}

export function TeacherAssignmentModal({
  isOpen,
  onClose,
  classNameLabel,
  availableTeachers,
  onAssign,
}: TeacherAssignmentModalProps) {
  const [search, setSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [role, setRole] = useState<"Class Teacher" | "Subject Teacher">(
    "Class Teacher",
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableTeachers;
    return availableTeachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q),
    );
  }, [availableTeachers, search]);

  function handleConfirm() {
    const teacher = availableTeachers.find((t) => t.id === selectedTeacherId);
    if (!teacher) return;
    onAssign(teacher, role);
    setSelectedTeacherId("");
    setSearch("");
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedTeacherId("");
        setSearch("");
        onClose();
      }}
      title={`Assign Teacher to ${classNameLabel}`}
      description="Select a faculty member and assignment role for this class."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!selectedTeacherId}
            onClick={handleConfirm}
          >
            Confirm Assignment
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Select
          label="Assignment Role"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "Class Teacher" | "Subject Teacher")
          }
          options={[
            {
              value: "Class Teacher",
              label: "Class Teacher (Primary Advisor)",
            },
            { value: "Subject Teacher", label: "Subject Teacher" },
          ]}
        />

        <Input
          label="Search Available Faculty"
          placeholder="Search by teacher name, email, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div
          style={{
            maxHeight: "240px",
            overflowY: "auto",
            border: "1px solid var(--es-border)",
            borderRadius: "var(--es-radius-md)",
          }}
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
              No available faculty members match your search.
            </div>
          ) : (
            filtered.map((teacher) => {
              const isSelected = selectedTeacherId === teacher.id;
              return (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setSelectedTeacherId(teacher.id)}
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
                    <Avatar name={teacher.name} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "var(--es-text-primary)",
                        }}
                      >
                        {teacher.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--es-text-muted)",
                        }}
                      >
                        {teacher.email}
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
                    <Badge variant="neutral">{teacher.subject}</Badge>
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
