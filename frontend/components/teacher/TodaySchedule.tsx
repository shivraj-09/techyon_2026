"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components/ui";
import {
  TODAY_SCHEDULE,
  type TodayScheduleItem,
} from "@/config/teacher-data";

export interface TodayScheduleProps {
  items?: TodayScheduleItem[];
}

export function TodaySchedule({ items = TODAY_SCHEDULE }: TodayScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Today&apos;s Classes</CardTitle>
          <CardDescription>
            Your teaching schedule and daily attendance submission status
          </CardDescription>
        </div>
        <Link href="/teacher/classes" style={{ textDecoration: "none" }}>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<Icon name="chevron-right" size={14} />}
          >
            All My Classes
          </Button>
        </Link>
      </CardHeader>

      <CardBody>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "14px",
          }}
        >
          {items.map((slot) => {
            const isSubmitted = slot.attendanceStatus === "Submitted";
            return (
              <div
                key={slot.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 16px",
                  borderRadius: "var(--es-radius-md)",
                  border: "1px solid var(--es-border)",
                  backgroundColor: "var(--es-bg-app)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--es-text-primary)",
                      }}
                    >
                      {slot.className}
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        color: "var(--es-text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {slot.subject} · {slot.room}
                    </div>
                  </div>

                  <Badge variant={isSubmitted ? "success" : "warning"} dot>
                    {slot.attendanceStatus}
                  </Badge>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    fontSize: "12px",
                    color: "var(--es-text-secondary)",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--es-border-subtle)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontWeight: 600,
                    }}
                  >
                    <Icon name="clock" size={13} />
                    <span>{slot.time}</span>
                  </span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Icon name="users" size={13} />
                    <span>{slot.studentCount} students</span>
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/teacher/classes/${slot.classId}`}
                    style={{ textDecoration: "none", flex: 1 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ width: "100%" }}
                      rightIcon={<Icon name="chevron-right" size={13} />}
                    >
                      View Class
                    </Button>
                  </Link>

                  {!isSubmitted && (
                    <Link
                      href={`/teacher/attendance?classId=${slot.classId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="primary" size="sm">
                        Mark
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

