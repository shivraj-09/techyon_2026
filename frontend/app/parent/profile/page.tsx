"use client";

import React from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { ParentProfileView } from "@/components/parent";

export default function ParentProfilePage() {
  return (
    <AppLayout
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "Parent Profile" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Parent Profile"
          subtitle="Your guardian contact details, linked children and notification preferences."
        />

        <ParentProfileView />
      </div>
    </AppLayout>
  );
}

