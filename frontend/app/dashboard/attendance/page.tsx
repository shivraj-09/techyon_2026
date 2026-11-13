"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon, Select, Toast } from "@/components/ui";
import {
  AttendanceDistributionChart,
  AttendanceHistoryTable,
  AttendanceMarkingWorkspace,
  AttendanceModuleNav,
  type AttendanceModuleTab,
  AttendanceOverview,
  AttendanceRecordDetails,
  AttendanceStats,
  AttendanceTrendChart,
  ClassAttendanceChart,
  LowAttendanceTable,
} from "@/components/attendance";
import {
  ATTENDANCE_CLASSES,
  getStoredAttendanceSessions,
  INITIAL_ATTENDANCE_SESSIONS,
  type AttendanceSessionRecord,
} from "@/config/attendance-data";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<AttendanceModuleTab>("overview");
  const [sessions, setSessions] = useState<AttendanceSessionRecord[]>(
    INITIAL_ATTENDANCE_SESSIONS,
  );
  const [selectedDate, setSelectedDate] = useState("2026-11-14");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceSessionRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setSessions(getStoredAttendanceSessions());
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as AttendanceModuleTab | null;
      if (
        tabParam &&
        ["overview", "mark", "history", "analytics"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  function refreshSessions() {
    setSessions(getStoredAttendanceSessions());
  }

  function handleExportReport() {
    setToast({
      title: "Attendance report exported",
      description: `Prepared CSV attendance summary for ${selectedDate || "all dates"}.`,
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Attendance" },
      ]}
    >
      <div className="es-stack">
        {/* Page Header & Actions */}
        <PageHeader
          title="Attendance"
          subtitle="Monitor daily attendance, review records and track attendance trends across your school."
          actions={
            <>
              <input
                type="date"
                className="es-input"
                style={{ width: "152px", height: "36px" }}
                aria-label="Select attendance date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <Select
                aria-label="Filter by class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ width: "155px", height: "36px" }}
                options={[
                  { value: "all", label: "All Classes" },
                  ...ATTENDANCE_CLASSES.filter((c) => c.totalStudents > 0).map(
                    (c) => ({
                      value: c.id,
                      label: c.name,
                    }),
                  ),
                ]}
              />

              <div
                className="es-input-wrapper"
                style={{ width: "210px", maxWidth: "100%" }}
              >
                <span className="es-input-icon-left">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="search"
                  className="es-input has-left-icon"
                  placeholder="Search students..."
                  aria-label="Search students"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="download" size={15} />}
                onClick={handleExportReport}
              >
                Export
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

        {/* 4 Attendance Overview Stat Cards */}
        <AttendanceStats />

        {/* Secondary Module Navigation */}
        <AttendanceModuleNav
          activeTab={activeTab}
          onTabChange={(nextTab) => {
            setActiveTab(nextTab);
            setSelectedRecord(null);
          }}
        />

        {/* Selected Record Detailed View (when inspecting a class/date session) */}
        {selectedRecord && (
          <AttendanceRecordDetails
            session={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onSessionUpdated={(updated) => {
              setSelectedRecord(updated);
              refreshSessions();
            }}
          />
        )}

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <AttendanceOverview
            sessions={sessions}
            selectedDate={selectedDate}
            selectedClassId={selectedClassId}
            searchQuery={searchQuery}
            onSelectSession={(sess) => setSelectedRecord(sess)}
            onSwitchToMark={() => setActiveTab("mark")}
          />
        )}

        {/* Tab 2: Mark Attendance */}
        {activeTab === "mark" && (
          <AttendanceMarkingWorkspace
            initialClassId={
              selectedClassId !== "all" ? selectedClassId : "class-8-a"
            }
            initialDate={selectedDate || "2026-11-14"}
            onSessionSaved={() => refreshSessions()}
          />
        )}

        {/* Tab 3: History */}
        {activeTab === "history" && (
          <AttendanceHistoryTable
            sessions={sessions}
            onSelectSession={(sess) => setSelectedRecord(sess)}
          />
        )}

        {/* Tab 4: Analytics */}
        {activeTab === "analytics" && (
          <div className="es-stack">
            <div className="es-dashboard-grid-main">
              <AttendanceTrendChart />
              <AttendanceDistributionChart />
            </div>

            <ClassAttendanceChart />

            <LowAttendanceTable />
          </div>
        )}
      </div>

      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </AppLayout>
  );
}
