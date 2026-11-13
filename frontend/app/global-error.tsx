"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical layout error:", error.digest ?? "unexpected");
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#F5F7FA",
          color: "#212529",
          fontFamily:
            'var(--font-dm-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          role="region"
          aria-label="Unexpected error"
          style={{
            width: "100%",
            maxWidth: "540px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow:
              "0 14px 28px -6px rgba(1, 43, 91, 0.14), 0 6px 12px -4px rgba(1, 43, 91, 0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: "#043873",
              color: "#FFFFFF",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "15px" }}>EduSync</span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#FFE492",
              }}
            >
              500 Unexpected Error
            </span>
          </div>

          <div style={{ padding: "28px 24px 24px" }}>
            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "22px",
                fontWeight: 700,
                color: "#212529",
              }}
            >
              Something went wrong on our side
            </h1>
            <p
              style={{
                margin: "0 0 18px",
                fontSize: "14.5px",
                lineHeight: 1.6,
                color: "#4F5660",
              }}
            >
              We encountered an unexpected error while loading EduSync. You can
              try reloading this view or return to the login page.
            </p>

            {error.digest && (
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: "12.5px",
                  color: "#5F6975",
                }}
              >
                Reference ID:{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: "#F5F7FA",
                    border: "1px solid #E2E8F0",
                    color: "#043873",
                  }}
                >
                  {error.digest}
                </span>
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  height: "38px",
                  padding: "0 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#1D6CE0",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <a
                href="/login"
                style={{
                  height: "38px",
                  padding: "0 16px",
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  color: "#212529",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
