"use client";

import React from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon } from "@/components/ui";
import {
  AttendanceMarkingWorkspace,
  AttendanceModuleNav,
} from "@/components/attendance";

export default function AttendanceMarkPage() {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Attendance", href: "/dashboard/attendance" },
        { label: "Mark Attendance" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Mark Attendance"
          subtitle="Select a class section and date to record daily student roll call."
          actions={
            <>
              <Link href="/dashboard/attendance/history">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Icon name="calendar-check" size={15} />}
                >
                  Attendance History
                </Button>
              </Link>
              <Link href="/dashboard/attendance">
                <Button variant="ghost" size="md">
                  Back to Overview
                </Button>
              </Link>
            </>
          }
        />

        <AttendanceModuleNav activeTab="mark" useLinks />

        <AttendanceMarkingWorkspace />
      </div>
    </AppLayout>
  );
}
