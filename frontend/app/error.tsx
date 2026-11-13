"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";

const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  counsellor: "/counsellor/dashboard",
  student: "/student/voice",
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  useEffect(() => {
    console.error("Application route error:", error.digest ?? "unexpected");
  }, [error]);

  useEffect(() => {
    if (pathname?.startsWith("/teacher")) setDashboardHref("/teacher/dashboard");
    else if (pathname?.startsWith("/parent")) setDashboardHref("/parent/dashboard");
    else if (pathname?.startsWith("/counsellor")) setDashboardHref("/counsellor/dashboard");
    else if (pathname?.startsWith("/student")) setDashboardHref("/student/voice");
    else if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("edusync_demo_role");
      if (saved && ROLE_HOME[saved]) setDashboardHref(ROLE_HOME[saved]);
    }
  }, [pathname]);

  return (
    <ErrorState
      kind="500"
      referenceId={error.digest}
      primaryAction={{
        label: "Try Again",
        onClick: () => reset(),
      }}
      secondaryAction={{
        label: "Go to Dashboard",
        href: dashboardHref,
      }}
    />
  );
}
