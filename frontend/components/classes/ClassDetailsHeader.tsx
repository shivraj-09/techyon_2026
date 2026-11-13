"use client";

import React from "react";
import Link from "next/link";
import { Avatar, Badge, Button, Card, CardBody, Icon } from "@/components/ui";
import type { ClassRecord } from "@/config/stage3-data";

export interface ClassDetailsHeaderProps {
  classItem: ClassRecord;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClassDetailsHeader({
  classItem,
  onEdit,
  onDelete,
}: ClassDetailsHeaderProps) {
  const isUnassigned =
    !classItem.classTeacher || classItem.classTeacher === "Unassigned";

  return (
    <Card>
      <CardBody>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "var(--es-radius-lg)",
                backgroundColor: "var(--es-primary-subtle)",
                color: "var(--es-primary)",
                border: "1px solid var(--es-primary-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "17px",
                flexShrink: 0,
              }}
            >
              {classItem.grade.replace("Class ", "")}
              {classItem.section}
            </div>

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
                    fontSize: "21px",
                    fontWeight: 700,
                    color: "var(--es-text-primary)",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {classItem.name}
                </h1>
                <Badge
                  variant={
                    classItem.status === "Active" ? "success" : "neutral"
                  }
                  dot
                >
                  {classItem.status}
                </Badge>
                <Badge variant="neutral">Section {classItem.section}</Badge>
                <Badge variant="primary">{classItem.academicYear}</Badge>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "var(--es-text-secondary)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Icon
                    name="graduation-cap"
                    size={15}
                    style={{ color: "var(--es-text-muted)" }}
                  />
                  <span>
                    <strong>{classItem.enrolledCount}</strong> /{" "}
                    {classItem.capacity} Enrolled Students
                  </span>
                </span>

                <span style={{ color: "var(--es-border-strong)" }}>•</span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ color: "var(--es-text-muted)" }}>
                    Assigned Teacher:
                  </span>
                  {isUnassigned ? (
                    <Badge variant="warning">Unassigned</Badge>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 600,
                        color: "var(--es-text-primary)",
                      }}
                    >
                      <Avatar name={classItem.classTeacher} size="sm" />
                      {classItem.classTeacher}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/dashboard/classes">
              <Button variant="secondary" size="md">
                Back to Classes
              </Button>
            </Link>
            <Button variant="primary" size="md" onClick={onEdit}>
              Edit Class
            </Button>
            <Button
              variant="ghost"
              size="md"
              style={{ color: "var(--es-danger)" }}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
