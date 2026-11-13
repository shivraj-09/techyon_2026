"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught by error boundary:", error);
  }, [error]);

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="mark">E</span>EduSync
        </div>
        <Link href="/">← Home</Link>
      </header>

      <div className="auth card" style={{ textAlign: "center" }}>
        <span
          className="pill"
          style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
        >
          SYSTEM ALERT
        </span>

        <div
          style={{
            margin: "20px auto 14px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b91c1c",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 style={{ margin: "0 0 10px 0", fontSize: "24px", color: "#0f172a" }}>
          Something went wrong
        </h1>
        <p className="muted" style={{ margin: "0 0 20px 0" }}>
          An unexpected error occurred while processing your request. You can try
          reloading the component or returning to the dashboard.
        </p>

        {error.digest && (
          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              wordBreak: "break-all",
              margin: "0 0 20px 0",
            }}
          >
            Error reference: {error.digest}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => reset()}
            className="btn"
            style={{ width: "100%" }}
          >
            Try again
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/" style={{ flex: 1 }}>
              <button
                type="button"
                className="btn secondary"
                style={{ width: "100%" }}
              >
                Go to Home
              </button>
            </Link>
            <Link href="/login" style={{ flex: 1 }}>
              <button
                type="button"
                className="btn secondary"
                style={{ width: "100%" }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

