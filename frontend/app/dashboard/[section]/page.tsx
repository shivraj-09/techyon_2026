"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  type IconName,
} from "@/components/ui";

const MODULE_META: Record<
  string,
  { title: string; subtitle: string; icon: IconName }
> = {
  students: {
    title: "Students",
    subtitle: "Student directory, enrollment profiles, and guardian links.",
    icon: "graduation-cap",
  },
  classes: {
    title: "Classes",
    subtitle: "Grade sections, subject allocations, and timetable rosters.",
    icon: "book-open",
  },
  attendance: {
    title: "Attendance",
    subtitle: "Daily roll call registers and section-wise attendance logs.",
    icon: "calendar-check",
  },
  fees: {
    title: "Fees",
    subtitle: "Fee structures, installment schedules, and payment records.",
    icon: "credit-card",
  },
  announcements: {
    title: "Announcements",
    subtitle: "School-wide circulars, notices, and scheduled dispatches.",
    icon: "megaphone",
  },
  notifications: {
    title: "Notifications",
    subtitle: "System alerts, activity updates, and delivery logs.",
    icon: "bell",
  },
  "ai-insights": {
    title: "AI Insights",
    subtitle: "Automated academic, attendance, and operational analytics.",
    icon: "sparkles",
  },
  settings: {
    title: "Settings",
    subtitle: "Institution profile, academic year preferences, and roles.",
    icon: "settings",
  },
};

export default function DashboardSectionPlaceholderPage() {
  const params = useParams<{ section: string }>();
  const sectionKey = params?.section || "module";

  const meta = MODULE_META[sectionKey] || {
    title: sectionKey
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: "Module layout placeholder.",
    icon: "inbox" as IconName,
  };

  return (
    <AppLayout>
      <div className="es-stack">
        <PageHeader
          title={meta.title}
          subtitle={meta.subtitle}
          actions={<Badge variant="neutral">Stage 1 Layout Preview</Badge>}
        />

        <Card>
          <CardBody>
            <EmptyState
              icon={meta.icon}
              title={`${meta.title} module placeholder`}
              description="This route is wired into the shared application layout and sidebar navigation for Stage 1. Module-specific views will be implemented in subsequent stages."
              action={
                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<Icon name="layout-dashboard" size={15} />}
                  >
                    Return to Dashboard Preview
                  </Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}

