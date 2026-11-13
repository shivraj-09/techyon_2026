"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Alert } from "@/components/ui/Alert";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your school invitation...");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function accept() {
      try {
        if (!cancelled) {
          setVerified(true);
          setMessage("Invitation accepted. Your school workspace access is ready.");
          setTimeout(() => router.replace("/dashboard"), 1200);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to complete invitation verification.",
          );
        }
      }
    }

    void accept();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="es-error-shell">
      <div className="es-error-card" role="region" aria-label="Accept invitation">
        <div className="es-error-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                backgroundColor: "#4F9CF9",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="brand-hub" size={16} />
            </span>
            <span style={{ fontWeight: 700, fontSize: "15px" }}>EduSync</span>
          </div>
          <Link
            href="/login"
            style={{
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#FFE492",
              textDecoration: "none",
            }}
          >
            Back to Sign In
          </Link>
        </div>

        <div className="es-error-body">
          <div className="es-error-icon-wrap" aria-hidden="true">
            <Icon name={error ? "alert-triangle" : "check-circle"} size={22} />
          </div>

          <h1 className="es-error-title">Accept school invitation</h1>

          {error ? (
            <Alert variant="danger" title="Verification error">
              {error}
            </Alert>
          ) : (
            <Alert
              variant={verified ? "success" : "info"}
              title={verified ? "Workspace ready" : "Checking invitation"}
            >
              {message}
            </Alert>
          )}

          <div className="es-error-actions">
            <Link href="/dashboard" className="es-btn es-btn-primary es-btn-md">
              Open Dashboard
            </Link>
            <Link href="/login" className="es-btn es-btn-secondary es-btn-md">
              Sign In with Another Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
