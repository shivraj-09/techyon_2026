"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PendingInvitation = {
  school_id: string;
};

export default function AcceptInvitePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your invitation…");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    async function acceptInvitation() {
      try {
        const supabase = createClient();
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const tokenHash = params.get("token_hash");
        const type = params.get("type");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && (type === "invite" || type === "signup")) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (verifyError) throw verifyError;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) {
          throw new Error(
            "This invitation link is invalid or expired. Ask your administrator to resend it.",
          );
        }

        const api = (
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
        ).replace(/\\/$/, "");
        const headers = {
          Authorization: `Bearer ${session.access_token}`,
        };

        // The backend scopes this lookup to the authenticated user's JWT.
        const pendingResponse = await fetch(
          `${api}/api/v1/auth/pending-invitations`,
          { headers, cache: "no-store" },
        );

        if (!pendingResponse.ok) {
          throw new Error(
            pendingResponse.status === 401
              ? "Your invitation session has expired. Sign in again using the invitation link."
              : "Could not verify your pending school invitation.",
          );
        }

        const pendingData = await pendingResponse.json();
        if (
          pendingData?.success !== true ||
          !Array.isArray(pendingData?.invitations)
        ) {
          throw new Error("The invitation service returned an invalid response.");
        }

        const pending = pendingData.invitations as PendingInvitation[];
        if (pending.length === 0) {
          throw new Error(
            "No pending school invitation was found for this account. Ask your administrator to resend it.",
          );
        }

        for (const invitation of pending) {
          const response = await fetch(
            `${api}/api/v1/schools/${invitation.school_id}/members/accept`,
            {
              method: "POST",
              headers,
            },
          );

          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(
              body.detail || "Could not activate your school membership.",
            );
          }
        }

        if (!cancelled) {
          setMessage("Invitation accepted. Your school access is ready.");
          redirectTimer = setTimeout(() => router.replace("/dashboard"), 1200);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to accept invitation.",
          );
        }
      }
    }

    void acceptInvitation();

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="mark">E</span>EduSync
        </div>
      </header>
      <div className="auth card">
        <span className="pill">SCHOOL INVITATION</span>
        <h1>You’re almost in</h1>
        {error ? (
          <>
            <p className="error" role="alert">{error}</p>
            <Link href="/login">Go to sign in</Link>
          </>
        ) : (
          <p className="success" role="status">{message}</p>
        )}
      </div>
    </main>
  );
}
