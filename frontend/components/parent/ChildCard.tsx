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
import { formatINR } from "@/config/fee-data";
import type { ParentChildRecord } from "@/config/parent-data";

export interface ChildCardProps {
  child: ParentChildRecord;
  selected?: boolean;
  onSelect?: (child: ParentChildRecord) => void;
  actionLabel?: string;
  href?: string;
}

export function ChildCard({
  child,
  selected = false,
  onSelect,
  actionLabel = "View Profile",
  href,
}: ChildCardProps) {
  const profileHref = href ?? `/parent/children/${child.id}`;
  const hasBalance = child.outstandingBalance > 0;
  const attendanceBarTone =
    child.attendancePercentage >= 90
      ? "good"
      : child.attendancePercentage >= 75
        ? "moderate"
        : "low";

  return (
    <Card
      onClick={onSelect ? () => onSelect(child) : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(child);
              }
            }
          : undefined
      }
      style={{
        cursor: onSelect ? "pointer" : "default",
        border: selected
          ? "1.5px solid var(--es-primary)"
          : "1px solid var(--es-border)",
        backgroundColor: selected
          ? "var(--es-primary-subtle)"
          : "var(--es-bg-surface)",
        boxShadow: selected ? "var(--es-shadow-sm)" : "var(--es-shadow-xs)",
        transition: "all var(--es-transition-fast)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardBody
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          flex: 1,
        }}
      >
        {/* Top Row: Avatar, Name, Student ID & Selection Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar name={child.fullName} size="lg" />
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--es-text-primary)",
                  }}
                >
                  {child.fullName}
                </h3>
                <Badge variant="neutral">{child.relationship}</Badge>
              </div>
              <div
                style={{
                  marginTop: "3px",
                  fontSize: "12.5px",
                  color: "var(--es-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--es-font-mono)",
                    fontWeight: 600,
                    color: "var(--es-text-secondary)",
                  }}
                >
                  {child.studentId}
                </span>
                <span>·</span>
                <span>{child.className}</span>
              </div>
            </div>
          </div>

          {selected ? (
            <Badge variant="primary" dot>
              Active Child
            </Badge>
          ) : (
            <Badge variant="success" dot>
              {child.enrollmentStatus}
            </Badge>
          )}
        </div>

        {/* Metrics Strip: Attendance, Academic Year, Fee Status */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "10px",
            padding: "12px",
            borderRadius: "var(--es-radius-md)",
            backgroundColor: selected
              ? "var(--es-bg-surface)"
              : "var(--es-bg-app)",
            border: "1px solid var(--es-border-subtle)",
          }}
        >
          <div>
            <div className="es-metric-mini-label">Attendance</div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--es-text-primary)",
                marginTop: "2px",
              }}
            >
              {child.attendancePercentage.toFixed(1)}%
            </div>
            <div
              className="es-progress-track"
              style={{ height: 5, marginTop: "6px" }}
            >
              <div
                className={`es-progress-fill ${attendanceBarTone}`}
                style={{ width: `${child.attendancePercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="es-metric-mini-label">Academic Year</div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--es-text-primary)",
                marginTop: "4px",
              }}
            >
              {child.academicYear}
            </div>
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--es-text-muted)",
                marginTop: "2px",
              }}
            >
              Roll {child.rollNumber}
            </div>
          </div>

          <div>
            <div className="es-metric-mini-label">Fee Balance</div>
            <div style={{ marginTop: "4px" }}>
              {hasBalance ? (
                <Badge variant="warning" dot>
                  {formatINR(child.outstandingBalance)} Due
                </Badge>
              ) : (
                <Badge variant="success" dot>
                  Paid in Full
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardBody>

      <CardFooter
        style={{
          backgroundColor: selected
            ? "var(--es-footer-selected-tint)"
            : "var(--es-bg-surface)",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
          Class Teacher: {child.classTeacher}
        </span>

        <Link
          href={profileHref}
          onClick={(e) => e.stopPropagation()}
          style={{ textDecoration: "none" }}
        >
          <Button
            variant={selected ? "primary" : "secondary"}
            size="sm"
            rightIcon={<Icon name="chevron-right" size={14} />}
          >
            {actionLabel}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
