"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root error caught by GlobalError:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#f5f8f8",
          color: "#17313d",
          fontFamily: "Arial, Helvetica, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            backgroundColor: "#ffffff",
            border: "1px solid #e2eaed",
            borderRadius: "16px",
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
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
          <h1
            style={{
              fontSize: "22px",
              margin: "0 0 10px 0",
              color: "#0f172a",
            }}
          >
            Application Error
          </h1>
          <p
            style={{
              color: "#6b7e87",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            A critical system error occurred. Please try reloading the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              width: "100%",
              padding: "13px 18px",
              border: 0,
              borderRadius: "9px",
              backgroundColor: "#087e78",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}

