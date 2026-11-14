"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { THEME_INIT_SCRIPT, readStoredTheme, resolveTheme } from "@/lib/theme";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    console.error("Critical layout error:", error.digest ?? "unexpected");
    setIsDark(resolveTheme(readStoredTheme()) === "dark");
  }, [error]);

  const bgCanvas = isDark ? "#0B1120" : "#F5F7FA";
  const bgCard = isDark ? "#17243A" : "#FFFFFF";
  const borderCol = isDark ? "#26364D" : "#E2E8F0";
  const bannerBg = isDark ? "#081629" : "#043873";
  const textMain = isDark ? "#F1F5F9" : "#212529";
  const textMuted = isDark ? "#B6C2D2" : "#4F5660";
  const refBg = isDark ? "#142236" : "#F5F7FA";
  const refColor = isDark ? "#A7CEFC" : "#043873";
  const btnPrimaryBg = isDark ? "#4F9CF9" : "#1D6CE0";
  const btnPrimaryFg = isDark ? "#061A33" : "#FFFFFF";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: bgCanvas,
          color: textMain,
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
            backgroundColor: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 18px 34px -6px rgba(2, 6, 23, 0.72)"
              : "0 14px 28px -6px rgba(1, 43, 91, 0.14)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: bannerBg,
              color: "#FFFFFF",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "9px" }}>
              <Image src="/circle-logo.svg" alt="" width={30} height={30} style={{ filter: "brightness(0) invert(1)" }} priority />
              Circle
            </span>
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
                color: textMain,
              }}
            >
              Something went wrong on our side
            </h1>
            <p
              style={{
                margin: "0 0 18px",
                fontSize: "14.5px",
                lineHeight: 1.6,
                color: textMuted,
              }}
            >
              We encountered an unexpected error while loading Circle. You can
              try reloading this view or return to the login page.
            </p>

            {error.digest && (
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: "12.5px",
                  color: textMuted,
                }}
              >
                Reference ID:{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: refBg,
                    border: `1px solid ${borderCol}`,
                    color: refColor,
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
                  backgroundColor: btnPrimaryBg,
                  color: btnPrimaryFg,
                  fontSize: "13.5px",
                  fontWeight: 600,
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
                  border: `1px solid ${borderCol}`,
                  backgroundColor: bgCard,
                  color: textMain,
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
