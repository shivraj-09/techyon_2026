"use client";

import React from "react";
import Link from "next/link";
import { Avatar, Badge, Button, Card, CardBody } from "@/components/ui";
import type { ParentChildRecord } from "@/config/parent-data";

export interface ChildProfileHeaderProps {
  child: ParentChildRecord;
  backHref?: string;
  backLabel?: string;
}

export function ChildProfileHeader({
  child,
  backHref = "/parent/children",
  backLabel = "Back to My Children",
}: ChildProfileHeaderProps) {
  return (
    <Card>
      <CardBody>
        <div
          style={{
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
              name={child.fullName}
              size="lg"
              style={{ width: 60, height: 60, fontSize: "20px" }}
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
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--es-text-primary)",
                  }}
                >
                  {child.fullName}
                </h2>
                <Badge
                  variant={
                    child.enrollmentStatus === "Active" ? "success" : "neutral"
                  }
                  dot
                >
                  {child.enrollmentStatus}
                </Badge>
                <Badge variant="primary">{child.className}</Badge>
              </div>

              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
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
                    {child.studentId}
                  </strong>
                </span>
                <span>·</span>
                <span>Academic Year: {child.academicYear}</span>
                <span>·</span>
                <span>Roll No: {child.rollNumber}</span>
                <span>·</span>
                <span>Class Teacher: {child.classTeacher}</span>
              </div>
            </div>
          </div>

          {backHref && (
            <Link href={backHref} style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="md">
                {backLabel}
              </Button>
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
