"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Icon,
} from "@/components/ui";
import type { TeacherClassItem } from "@/config/teacher-data";

export interface TeacherClassCardProps {
  classItem: TeacherClassItem;
}

export function TeacherClassCard({ classItem }: TeacherClassCardProps) {
  const isSubmitted = classItem.attendanceStatusToday === "Submitted";
  const progressTone =
    classItem.attendanceRate >= 92
      ? "good"
      : classItem.attendanceRate >= 82
        ? "moderate"
        : "low";

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
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
        {/* Top Row: Class Name + Badges */}
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
              href={`/teacher/classes/${classItem.id}`}
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
                fontSize: "12.5px",
                color: "var(--es-text-muted)",
                marginTop: "2px",
              }}
            >
              Section {classItem.section} · {classItem.subject} ·{" "}
              {classItem.academicYear}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <Badge variant={isSubmitted ? "success" : "warning"} dot>
              {classItem.attendanceStatusToday}
            </Badge>
            {classItem.isClassTeacher && (
              <Badge variant="primary">Class Teacher</Badge>
            )}
          </div>
        </div>

        {/* Student Count & Schedule Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            fontSize: "12.5px",
            color: "var(--es-text-secondary)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
            }}
          >
            <Icon name="graduation-cap" size={14} />
            <span>{classItem.studentCount} Enrolled Students</span>
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--es-text-muted)",
            }}
          >
            <Icon name="clock" size={13} />
            <span>
              {classItem.scheduleTime} · {classItem.room}
            </span>
          </span>
        </div>

        {/* Attendance Summary Bar */}
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "var(--es-bg-app)",
            border: "1px solid var(--es-border-subtle)",
            borderRadius: "var(--es-radius-md)",
            marginTop: "auto",
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
            <span style={{ color: "var(--es-text-secondary)", fontWeight: 500 }}>
              Attendance Rate
            </span>
            <strong style={{ color: "var(--es-text-primary)" }}>
              {classItem.attendanceRate.toFixed(1)}%
            </strong>
          </div>

          <div className="es-progress-track">
            <div
              className={`es-progress-fill ${progressTone}`}
              style={{ width: `${Math.min(100, classItem.attendanceRate)}%` }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "8px",
              fontSize: "11.5px",
              color: "var(--es-text-muted)",
            }}
          >
            <span>Present: {classItem.presentCount}</span>
            <span>·</span>
            <span>Absent: {classItem.absentCount}</span>
            <span>·</span>
            <span>Late: {classItem.lateCount}</span>
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <Link
          href={`/teacher/classes/${classItem.id}`}
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<Icon name="chevron-right" size={14} />}
          >
            View Class
          </Button>
        </Link>

        <Link
          href={`/teacher/attendance?classId=${classItem.id}`}
          style={{ textDecoration: "none" }}
        >
          <Button
            variant={isSubmitted ? "ghost" : "primary"}
            size="sm"
            leftIcon={<Icon name="calendar-check" size={14} />}
          >
            Mark Attendance
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

