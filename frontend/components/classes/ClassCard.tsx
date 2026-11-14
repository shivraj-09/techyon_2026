"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Icon,
} from "@/components/ui";
import type { ClassRecord } from "@/config/stage3-data";

export interface ClassCardProps {
  classItem: ClassRecord;
  onEdit: (classItem: ClassRecord) => void;
  onDelete: (classItem: ClassRecord) => void;
}

export function ClassCard({ classItem, onEdit, onDelete }: ClassCardProps) {
  const capacityPct =
    classItem.capacity > 0
      ? Math.min(
          100,
          Math.round((classItem.enrolledCount / classItem.capacity) * 100),
        )
      : 0;

  const isUnassigned =
    !classItem.classTeacher || classItem.classTeacher === "Unassigned";

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "border-color 140ms ease, box-shadow 140ms ease",
      }}
    >
      <CardBody
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Top Row: Class Name + Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div>
            <Link
              href={`/dashboard/classes/${classItem.id}`}
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              {classItem.name}
            </Link>
            <div
              style={{
                fontSize: "12px",
                color: "var(--es-text-muted)",
                marginTop: "2px",
              }}
            >
              Section {classItem.section} · {classItem.academicYear}
            </div>
          </div>

          <Badge
            variant={classItem.status === "Active" ? "success" : "neutral"}
            dot
          >
            {classItem.status}
          </Badge>
        </div>

        {/* Enrollment & Capacity Progress */}
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "var(--es-bg-app)",
            border: "1px solid var(--es-border-subtle)",
            borderRadius: "var(--es-radius-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12.5px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                color: "var(--es-text-secondary)",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Icon name="graduation-cap" size={14} />
              <span>{classItem.enrolledCount} Students</span>
            </span>
            <span style={{ fontSize: "11.5px", color: "var(--es-text-muted)" }}>
              Capacity: {classItem.enrolledCount}/{classItem.capacity}
            </span>
          </div>
          <div className="es-progress-track">
            <div
              className={`es-progress-fill ${
                capacityPct >= 95 ? "moderate" : "good"
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>

        {/* Class Teacher Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            marginTop: "auto",
            paddingTop: "4px",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
            Class Teacher
          </div>
          {isUnassigned ? (
            <Badge variant="warning">Unassigned</Badge>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Avatar name={classItem.classTeacher} size="sm" />
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                }}
              >
                {classItem.classTeacher}
              </span>
            </div>
          )}
        </div>
      </CardBody>

      <CardFooter>
        <Link
          href={`/dashboard/classes/${classItem.id}`}
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<Icon name="chevron-right" size={14} />}
          >
            View Details
          </Button>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(classItem)}
            title="Edit class"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: "var(--es-danger)" }}
            onClick={() => onDelete(classItem)}
            title="Delete class"
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
