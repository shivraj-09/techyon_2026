"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon, Toast } from "@/components/ui";
import {
  AttendanceHistoryTable,
  AttendanceModuleNav,
  AttendanceRecordDetails,
} from "@/components/attendance";
import {
  getStoredAttendanceSessions,
  INITIAL_ATTENDANCE_SESSIONS,
  type AttendanceSessionRecord,
} from "@/config/attendance-data";

export default function AttendanceHistoryPage() {
  const [sessions, setSessions] = useState<AttendanceSessionRecord[]>(
    INITIAL_ATTENDANCE_SESSIONS,
  );
  const [selectedSession, setSelectedSession] =
    useState<AttendanceSessionRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSessions(getStoredAttendanceSessions());
  }, []);

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Attendance", href: "/dashboard/attendance" },
        { label: "History" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Attendance History"
          subtitle="Browse historical attendance sessions by date and class, and inspect or edit individual records."
          actions={
            <>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="download" size={15} />}
                onClick={() =>
                  setToast("Historical attendance register exported to CSV.")
                }
              >
                Export Register
              </Button>
              <Link href="/dashboard/attendance/mark">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Icon name="clipboard-check" size={15} />}
                >
                  Mark Attendance
                </Button>
              </Link>
            </>
          }
        />

        <AttendanceModuleNav activeTab="history" useLinks />

        {selectedSession && (
          <AttendanceRecordDetails
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onSessionUpdated={(updated) => {
              setSelectedSession(updated);
              setSessions(getStoredAttendanceSessions());
            }}
          />
        )}

        <AttendanceHistoryTable
          sessions={sessions}
          onSelectSession={(sess) => setSelectedSession(sess)}
        />
      </div>

      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title="Export ready"
            description={toast}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </AppLayout>
  );
}
