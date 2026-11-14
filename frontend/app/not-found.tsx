"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";

const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  counsellor: "/counsellor/dashboard",
  student: "/student/voice",
};

function resolveDashboardPath(pathname: string | null): string {
  if (pathname?.startsWith("/teacher")) return "/teacher/dashboard";
  if (pathname?.startsWith("/parent")) return "/parent/dashboard";
  if (pathname?.startsWith("/counsellor")) return "/counsellor/dashboard";
  if (pathname?.startsWith("/student")) return "/student/voice";
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem("edusync_demo_role");
    if (saved && ROLE_HOME[saved]) return ROLE_HOME[saved];
  }
  return "/dashboard";
}

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  useEffect(() => {
    setDashboardHref(resolveDashboardPath(pathname));
  }, [pathname]);

  return (
    <ErrorState
      kind="404"
      primaryAction={{
        label: "Go to Dashboard",
        href: dashboardHref,
      }}
      secondaryAction={{
        label: "Go Back",
        onClick: () => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        },
      }}
    />
  );
}
