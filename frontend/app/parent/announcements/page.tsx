"use client";

import React from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { ParentAnnouncementList } from "@/components/parent";

export default function ParentAnnouncementsPage() {
  return (
    <AppLayout
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "Announcements" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Announcements"
          subtitle="Stay informed about important school updates."
          actions={<Badge variant="neutral">Read-Only Notices</Badge>}
        />

        <ParentAnnouncementList />
      </div>
    </AppLayout>
  );
}

