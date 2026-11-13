"use client";

import React from "react";
import Link from "next/link";
import { Avatar, Badge, Button, Dropdown, Icon } from "@/components/ui";
import type { StudentRecord } from "@/config/stage3-data";

export interface StudentProfileHeaderProps {
  student: StudentRecord;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export function StudentProfileHeader({
  student,
  onEdit,
  onToggleStatus,
  onDelete,
}: StudentProfileHeaderProps) {
  const isUnassigned =
    !student.className || student.className === "Unassigned";

  return (
    <div
      style={{
        backgroundColor: "var(--es-bg-surface)",
        border: "1px solid var(--es-border)",
        borderRadius: "var(--es-radius-lg)",
        padding: "20px 24px",
        boxShadow: "var(--es-shadow-xs)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          name={student.fullName}
          size="lg"
          style={{ width: "56px", height: "56px", fontSize: "18px" }}
        />

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                margin: 0,
              }}
            >
              {student.fullName}
            </h1>
            <Badge
              variant={student.status === "Active" ? "success" : "neutral"}
              dot
            >
              {student.status}
            </Badge>
            {isUnassigned ? (
              <Badge variant="warning">Unassigned</Badge>
            ) : (
              <Badge variant="primary">{student.className}</Badge>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "6px",
              fontSize: "13px",
              color: "var(--es-text-muted)",
            }}
          >
            <span>
              Student ID:{" "}
              <strong
                style={{
                  fontFamily: "var(--es-font-mono)",
                  color: "var(--es-text-secondary)",
                }}
              >
                {student.studentId}
              </strong>
            </span>
            <span>·</span>
            <span>
              Admission No:{" "}
              <strong style={{ color: "var(--es-text-secondary)" }}>
                {student.admissionNumber}
              </strong>
            </span>
            <span>·</span>
            <span>
              Academic Year:{" "}
              <strong style={{ color: "var(--es-text-secondary)" }}>
                {student.academicYear}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/dashboard/students">
          <Button variant="secondary" size="md">
            Back to Directory
          </Button>
        </Link>

        <Button variant="primary" size="md" onClick={onEdit}>
          Edit Student
        </Button>

        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="es-icon-btn is-bordered"
              aria-label="More student actions"
              title="More actions"
            >
              <Icon name="more-horizontal" size={16} />
            </button>
          }
          items={[
            {
              id: "status",
              label:
                student.status === "Active"
                  ? "Mark as Inactive"
                  : "Activate Student",
              icon: <Icon name="check-circle" size={14} />,
              onClick: onToggleStatus,
            },
            {
              id: "delete",
              label: "Delete Student Record",
              icon: <Icon name="x" size={14} />,
              danger: true,
              dividerBefore: true,
              onClick: onDelete,
            },
          ]}
        />
      </div>
    </div>
  );
}
