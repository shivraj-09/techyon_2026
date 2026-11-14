"use client";

import React, { useEffect, useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  counsellor: "/counsellor/dashboard",
  student: "/student/voice",
};

export default function AccessDeniedPage() {
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("edusync_demo_role");
    if (saved && ROLE_HOME[saved]) {
      setDashboardHref(ROLE_HOME[saved]);
    }
  }, []);

  return (
    <ErrorState
      kind="403"
      primaryAction={{
        label: "Go to My Workspace",
        href: dashboardHref,
      }}
      secondaryAction={{
        label: "Switch Account",
        href: "/login",
      }}
    />
  );
}

