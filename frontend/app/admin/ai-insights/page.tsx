"use client";

import React, { useEffect, useRef, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Badge, Button, Icon, Select, Toast } from "@/components/ui";
import {
  AiInsightCardsSection,
  AiInsightsOverviewCards,
  AskEduSyncSection,
  AttendanceInsightsSection,
  FeeInsightsSection,
  InsightHistorySection,
  RecommendedActionsSection,
} from "@/components/ai-insights";
import {
  AI_INSIGHTS_CATALOG,
  ANALYTICS_BY_RANGE,
  DATE_RANGE_OPTIONS,
  INSIGHT_HISTORY_REPORTS,
  LOW_ATTENDANCE_STUDENTS,
  OVERDUE_INVOICE_ROWS,
  RECOMMENDED_ACTIONS,
  type DateRangeKey,
  type InsightReportRecord,
} from "@/config/ai-insights-data";

/*
 * ============================================================================
 * DISCONNECTED ENDPOINT REFERENCE (Not called in Frontend Preview Mode)
 * ============================================================================
 * POST /api/v1/schools/{school_id}/ai-insights/generate
 * - Current analytics are rule-based summaries, not a predictive AI model.
 * - Response schema is not yet finalised; all metrics, insight cards, Q&A
 *   summaries and history records are generated locally from mock data.
 * ============================================================================
 */

export default function AdminAiInsightsPage() {
  const [dateRange, setDateRange] = useState<DateRangeKey>("30d");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string>(
    "13 Nov 2026, 09:00 AM",
  );
  const [reports, setReports] = useState<InsightReportRecord[]>(
    INSIGHT_HISTORY_REPORTS,
  );
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    variant: "success" | "info";
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const activeBundle = ANALYTICS_BY_RANGE[dateRange];
  const selectedRangeLabel =
    DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)?.label ||
    "Last 30 days";

  function handleGenerateInsights() {
    if (isGenerating) return;
    setIsGenerating(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const now = new Date();
      const formattedTimestamp = `${now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}, ${now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      setLastGeneratedAt(formattedTimestamp);

      const snapshotReport: InsightReportRecord = {
        id: `rep-live-${Date.now()}`,
        title: `Rule-Based Snapshot — ${selectedRangeLabel}`,
        category: "Comprehensive",
        generatedDate: formattedTimestamp,
        periodCovered: activeBundle.overview.periodLabel,
        summary: `Generated locally for ${selectedRangeLabel}: ${activeBundle.overview.attendanceRate.toFixed(
          1,
        )}% attendance rate and ${activeBundle.overview.feeCollectionPct.toFixed(
          1,
        )}% fee collection rate.`,
        keyMetrics: [
          {
            label: "Attendance Rate",
            value: `${activeBundle.overview.attendanceRate.toFixed(1)}%`,
          },
          {
            label: "Students < 75%",
            value: String(activeBundle.overview.lowAttendanceStudentsCount),
          },
          {
            label: "Fees Collected",
            value: `₹${activeBundle.overview.feeCollected.toLocaleString("en-IN")}`,
          },
          {
            label: "Overdue Invoices",
            value: `${activeBundle.overview.overdueInvoicesCount}`,
          },
        ],
        highlights: [
          `Evaluated ${activeBundle.classAttendance.length} class attendance benchmarks for ${selectedRangeLabel}.`,
          `Identified ${activeBundle.overview.overdueInvoicesCount} overdue invoices totalling ₹${activeBundle.overview.overdueAmount.toLocaleString("en-IN")}.`,
        ],
      };

      setReports((prev) => [snapshotReport, ...prev.slice(0, 4)]);
      setIsGenerating(false);
      setToast({
        title: "Insights refreshed locally",
        description: `Rule-based summaries updated for ${selectedRangeLabel}.`,
        variant: "success",
      });
    }, 450);
  }

  return (
    <AppLayout defaultRole="admin">
      <div className="es-stack" style={{ gap: "24px" }}>
        <PageHeader
          title="AI Insights"
          subtitle="Understand school performance and identify areas that need attention."
          actions={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: "170px" }}>
                <Select
                  aria-label="Select analytics date range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
                  options={DATE_RANGE_OPTIONS}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateInsights}
                disabled={isGenerating}
                leftIcon={<Icon name="sparkles" size={15} />}
              >
                {isGenerating ? "Generating..." : "Generate Insights"}
              </Button>
            </div>
          }
        />

        {/* Last-Generated Timestamp & Scope Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "var(--es-radius-md)",
            border: "1px solid var(--es-border)",
            backgroundColor: "var(--es-bg-surface)",
            fontSize: "12.5px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon
              name="clock"
              size={14}
              style={{ color: "var(--es-text-subtle)" }}
            />
            <span style={{ color: "var(--es-text-muted)" }}>
              Last generated:{" "}
              <strong style={{ color: "var(--es-text-primary)" }}>
                {lastGeneratedAt}
              </strong>
            </span>
            <span style={{ color: "var(--es-text-subtle)" }}>·</span>
            <span style={{ color: "var(--es-text-muted)" }}>
              Window: {activeBundle.overview.periodLabel}
            </span>
          </div>
          <Badge variant="primary">
            Rule-based aggregate analytics (Mock preview)
          </Badge>
        </div>

        {toast && (
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={() => setToast(null)}
          />
        )}

        {/* Section 3: Analytics Overview Cards */}
        <AiInsightsOverviewCards
          metrics={activeBundle.overview}
          isLoading={isGenerating}
        />

        {/* Section 4: Attendance Insights */}
        <AttendanceInsightsSection
          periodLabel={activeBundle.overview.periodLabel}
          trendPoints={activeBundle.attendanceTrend}
          classComparison={activeBundle.classAttendance}
          students={LOW_ATTENDANCE_STUDENTS}
        />

        {/* Section 5: Fee Insights */}
        <FeeInsightsSection
          metrics={activeBundle.overview}
          timeline={activeBundle.feeTimeline}
          classBreakdown={activeBundle.classFeeBreakdown}
          overdueInvoices={OVERDUE_INVOICE_ROWS}
        />

        {/* Section 6: AI-Generated Insight Cards */}
        <AiInsightCardsSection
          insights={AI_INSIGHTS_CATALOG}
          lastGeneratedLabel={lastGeneratedAt}
        />

        {/* Section 7: Recommended Actions */}
        <RecommendedActionsSection actions={RECOMMENDED_ACTIONS} />

        {/* Section 8: Ask EduSync Natural Language Analytics */}
        <AskEduSyncSection activeRange={dateRange} />

        {/* Section 9: Insight History / Recent Reports */}
        <InsightHistorySection reports={reports} />
      </div>
    </AppLayout>
  );
}

