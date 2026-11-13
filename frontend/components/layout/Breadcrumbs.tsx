"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  roleLabel?: string;
  homeHref?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  teacher: "Teacher",
  parent: "Parent",
  counsellor: "Counsellor",
  student: "Student Voice",
  voice: "Student Voice",
  referrals: "Referrals",
  cases: "Cases",
  sessions: "Sessions",
  notices: "Notices",
  "student-voice": "Student Voice",
  "meeting-requests": "Meeting Requests",
  conversations: "My Conversations",
  "student-voice-linking": "Student Voice Linking",
  new: "New",
  children: "My Children",
  profile: "Profile",
  students: "Students",
  classes: "Classes",
  attendance: "Attendance",
  mark: "Mark Attendance",
  history: "History",
  fees: "Fees",
  invoices: "Invoices",
  balances: "Outstanding Balances",
  payments: "Payment History",
  announcements: "Announcements",
  notifications: "Notifications",
  "ai-insights": "AI Insights",
  settings: "Settings",
};

export function Breadcrumbs({
  items,
  roleLabel = "Admin",
  homeHref,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  const resolvedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const segments = pathname.split("/").filter(Boolean);
    const defaultHomeHref = pathname.startsWith("/counsellor")
      ? "/counsellor/dashboard"
      : pathname.startsWith("/student")
        ? "/student/voice"
        : pathname.startsWith("/parent")
          ? "/parent/dashboard"
          : pathname.startsWith("/teacher")
            ? "/teacher/dashboard"
            : "/dashboard";
    const trail: BreadcrumbItem[] = [
      { label: roleLabel, href: homeHref || defaultHomeHref },
    ];

    if (segments.length <= 1) {
      trail.push({ label: "Dashboard" });
      return trail;
    }

    const startIndex =
      segments[0] === "counsellor" ||
      segments[0] === "student" ||
      segments[0] === "parent" ||
      segments[0] === "teacher" ||
      segments[0] === "admin" ||
      segments[0] === "dashboard"
        ? segments[0] === "student" && segments[1] === "voice"
          ? 2
          : 1
        : 0;

    segments.slice(startIndex).forEach((seg, idx) => {
      const actualIndex = startIndex + idx;
      const href = "/" + segments.slice(0, actualIndex + 1).join("/");
      const isLast = actualIndex === segments.length - 1;
      const label =
        SEGMENT_LABELS[seg] ||
        seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      trail.push({
        label,
        href: isLast ? undefined : href,
      });
    });

    return trail;
  }, [items, pathname, roleLabel, homeHref]);

  return (
    <nav className="es-breadcrumbs" aria-label="Breadcrumb">
      {resolvedItems.map((item, idx) => {
        const isLast = idx === resolvedItems.length - 1;
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && (
              <span className="es-breadcrumb-sep" aria-hidden="true">
                <Icon name="chevron-right" size={14} />
              </span>
            )}
            {isLast || !item.href ? (
              <span className="es-breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="es-breadcrumb-item">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

