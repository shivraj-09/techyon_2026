"use client";

import React from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { TeacherProfileView } from "@/components/teacher";

export default function TeacherProfilePage() {
  return (
    <AppLayout
      defaultRole="teacher"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "Teacher Profile" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Teacher Profile"
          subtitle="Your faculty profile, assigned classes and workspace preferences."
        />

        <TeacherProfileView />
      </div>
    </AppLayout>
  );
}
