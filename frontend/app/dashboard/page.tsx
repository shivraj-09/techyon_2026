"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Icon,
  Modal,
  Tabs,
  Toast,
  Tooltip,
} from "@/components/ui";
import {
  AiInsightsCard,
  AnnouncementsCard,
  AttendanceOverviewCard,
  ClassAttendanceCard,
  FeeCollectionCard,
  QuickActionsSection,
  RecentActivityCard,
} from "@/components/dashboard";
import {
  OVERVIEW_STATS_BY_RANGE,
  type AnnouncementPreviewItem,
  type DashboardRange,
  type QuickActionItem,
} from "@/config/admin-dashboard-data";

/*
 * ============================================================================
 * DISCONNECTED ENDPOINTS & PREVIOUS CODE REFERENCE (Preserved for Backend Re-integration)
 * ============================================================================
 *
 * [DISCONNECTED ENDPOINT CLIENT]
 * // import { createClient } from "@/lib/supabase/client";
 *
 * [DELETED / REPLACED PREVIOUS DASHBOARD FETCH & AUTH LOGIC]
 * Previously in DashboardPage():
 *
 *   useEffect(() => {
 *     async function load() {
 *       // [DISCONNECTED ENDPOINT 1] Supabase Session Check (GET /auth/v1/user via supabase.auth.getSession)
 *       const supabase = createClient();
 *       const { data: { session }, error } = await supabase.auth.getSession();
 *       if (error) throw error;
 *       if (!session) {
 *         router.replace("/login");
 *         return;
 *       }
 *       setEmail(session.user.email || "");
 *
 *       // [DISCONNECTED ENDPOINT 2] FastAPI Memberships Endpoint (GET /api/v1/auth/memberships)
 *       const api = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
 *       const res = await fetch(api + "/api/v1/auth/memberships", {
 *         headers: { Authorization: "Bearer " + session.access_token },
 *       });
 *       if (!res.ok) throw new Error("Could not load school memberships.");
 *       const data = await res.json();
 *       setMemberships(data.memberships || []);
 *     }
 *     void load();
 *   }, [router]);
 *
 *   async function signOut() {
 *     // [DISCONNECTED ENDPOINT 3] Supabase Sign Out (POST /auth/v1/logout via createClient().auth.signOut)
 *     await createClient().auth.signOut();
 *     router.replace("/login");
 *     router.refresh();
 *   }
 * ============================================================================
 */

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DashboardRange>("today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QuickActionItem | null>(
    null,
  );
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementPreviewItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const currentStats = OVERVIEW_STATS_BY_RANGE[dateRange];

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage({
        title: "Dashboard metrics refreshed",
        description: "Showing latest school operations data.",
      });
    }, 550);
  }

  return (
    <AppLayout>
      <div className="es-stack">
        {/* 1. Dashboard Page Header & Welcome Message */}
        <div>
          <PageHeader
            title="Dashboard"
            subtitle="Overview of your school's performance and daily operations."
            actions={
              <>
                <span className="es-date-pill" title="Current academic date">
                  <Icon
                    name="calendar"
                    size={14}
                    style={{ color: "var(--es-text-muted)" }}
                  />
                  <span>14 Nov 2026</span>
                </span>

                <Tabs
                  tabs={[
                    { id: "today", label: "Today" },
                    { id: "week", label: "This Week" },
                    { id: "month", label: "This Month" },
                  ]}
                  activeTab={dateRange}
                  onChange={(id) => setDateRange(id as DashboardRange)}
                />

                <Tooltip content="Refresh dashboard">
                  <button
                    type="button"
                    className={`es-refresh-btn ${isRefreshing ? "spinning" : ""}`.trim()}
                    onClick={handleRefresh}
                    aria-label="Refresh dashboard data"
                  >
                    <Icon name="refresh-cw" size={15} />
                  </button>
                </Tooltip>
              </>
            }
          />

          {/* Welcome Message Banner */}
          <div className="es-welcome-strip">
            <div>
              <h2 className="es-welcome-greeting">Good morning, Admin</h2>
              <p className="es-welcome-context">
                Here&apos;s what&apos;s happening across your school today.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge variant="success" dot>
                Academic Session 2026–27 Active
              </Badge>
            </div>
          </div>
        </div>

        {/* 2. Four Primary Overview Statistic Cards */}
        <section className="es-grid-4" aria-label="Overview Statistics">
          {currentStats.map((stat) => (
            <article key={stat.id} className="es-stat-card">
              <div className="es-stat-top">
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--es-text-secondary)",
                    fontSize: "13px",
                  }}
                >
                  {stat.title}
                </span>
                <span className="es-stat-icon-box">
                  <Icon name={stat.icon} size={17} />
                </span>
              </div>

              <div className="es-stat-value">{stat.value}</div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "2px",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
                  {stat.label}
                </span>
                <span className={`es-stat-indicator ${stat.indicatorTone}`}>
                  {stat.indicatorTone === "positive" ? (
                    <Icon name="trending-up" size={13} />
                  ) : (
                    <Icon name="clock" size={13} />
                  )}
                  <span>{stat.indicator}</span>
                </span>
              </div>
            </article>
          ))}
        </section>

        {/* 3. Attendance & Fee Analytics Charts */}
        <section
          className="es-dashboard-grid-main"
          aria-label="Attendance and Fee Analytics"
        >
          <AttendanceOverviewCard />
          <FeeCollectionCard />
        </section>

        {/* 4. Class-wise Attendance & Recent Activity */}
        <section
          className="es-dashboard-grid-main"
          aria-label="Class-wise Attendance and Recent Activity"
        >
          <ClassAttendanceCard />
          <RecentActivityCard />
        </section>

        {/* 5. Quick Actions */}
        <QuickActionsSection
          onSelectAction={(action) => setSelectedAction(action)}
        />

        {/* 6. Announcements & AI Insights */}
        <section
          className="es-dashboard-grid-main"
          aria-label="Announcements and AI Insights"
        >
          <AnnouncementsCard
            onSelectAnnouncement={(ann) => setSelectedAnnouncement(ann)}
          />
          <AiInsightsCard />
        </section>
      </div>

      {/* Quick Action Interactive Modal */}
      <Modal
        isOpen={selectedAction !== null}
        onClose={() => setSelectedAction(null)}
        title={selectedAction ? selectedAction.label : "Quick Action"}
        description={
          selectedAction
            ? `${selectedAction.subtitle} workflow preview`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSelectedAction(null)}
            >
              Close
            </Button>
            {selectedAction && (
              <Link href={selectedAction.href}>
                <Button
                  variant="primary"
                  rightIcon={<Icon name="arrow-up-right" size={14} />}
                >
                  Open {selectedAction.label} Module
                </Button>
              </Link>
            )}
          </>
        }
      >
        {selectedAction && (
          <div style={{ fontSize: "13.5px", color: "var(--es-text-secondary)", lineHeight: 1.6 }}>
            <p style={{ margin: "0 0 12px 0" }}>
              You selected <strong>{selectedAction.label}</strong> from the
              Admin Dashboard Quick Actions bar.
            </p>
            <p style={{ margin: 0, color: "var(--es-text-muted)" }}>
              Click <strong>Open {selectedAction.label} Module</strong> below to
              open that workspace, or close this dialog to remain on the Admin
              Dashboard.
            </p>
          </div>
        )}
      </Modal>

      {/* Announcement Detail Interactive Modal */}
      <Modal
        isOpen={selectedAnnouncement !== null}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement ? selectedAnnouncement.title : "Announcement"}
        description={
          selectedAnnouncement ? selectedAnnouncement.publishedDate : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSelectedAnnouncement(null)}
            >
              Close
            </Button>
            <Link href="/dashboard/announcements">
              <Button variant="primary">View All Announcements</Button>
            </Link>
          </>
        }
      >
        {selectedAnnouncement && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <Badge variant={selectedAnnouncement.audienceVariant}>
                Audience: {selectedAnnouncement.audience}
              </Badge>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "13.5px",
                color: "var(--es-text-primary)",
                lineHeight: 1.6,
              }}
            >
              {selectedAnnouncement.description}
            </p>
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toastMessage.title}
            description={toastMessage.description}
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}
    </AppLayout>
  );
}
