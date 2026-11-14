"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";

function getSafeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return null;
  }
  return raw;
}

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <ErrorState
      kind="401"
      primaryAction={{
        label: "Sign In to CIRCLE",
        href: loginHref,
      }}
      secondaryAction={{
        label: "Back to Home",
        href: "/",
      }}
    />
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <ErrorState
          kind="401"
          primaryAction={{ label: "Sign In to CIRCLE", href: "/login" }}
          secondaryAction={{ label: "Back to Home", href: "/" }}
        />
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}

