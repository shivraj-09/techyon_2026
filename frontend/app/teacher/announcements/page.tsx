"use client";

import React, { useEffect, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { TeacherAnnouncementList } from "@/components/teacher";

export default function TeacherAnnouncementsPage() {
  const [initialCreateOpen, setInitialCreateOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("create") === "1") {
        setInitialCreateOpen(true);
      }
    }
  }, []);

  return (
    <AppLayout
      defaultRole="teacher"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "Announcements" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Announcements"
          subtitle="View school notices and share updates with your classes."
        />

        <TeacherAnnouncementList initialCreateOpen={initialCreateOpen} />
      </div>
    </AppLayout>
  );
}
