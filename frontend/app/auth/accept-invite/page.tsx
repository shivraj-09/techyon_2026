"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// [DISCONNECTED ENDPOINT CLIENT] Supabase browser client (used for invite token exchange, OTP verification, and querying school_memberships)
// import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your invitation…");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function accept() {
      try {
        /*
        const supabase = createClient();
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const tokenHash = params.get("token_hash");
        const type = params.get("type");

        // [DISCONNECTED ENDPOINT 1] Supabase Auth Code Exchange / OTP Verify
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && (type === "invite" || type === "signup")) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (error) throw error;
        }

        // [DISCONNECTED ENDPOINT 2] Supabase Session Check
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session)
          throw new Error(
            "Invitation link is invalid or expired. Ask your administrator to resend it.",
          );

        // [DISCONNECTED ENDPOINT 3] Supabase PostgREST Query: GET /rest/v1/school_memberships
        const { data: pending, error: queryError } = await supabase
          .from("school_memberships")
          .select("school_id")
          .eq("user_id", session.user.id)
          .eq("status", "invited");
        if (queryError) throw queryError;
        if (!pending?.length)
          throw new Error(
            "No pending school invitation was found for this account.",
          );

        // [DISCONNECTED ENDPOINT 4] FastAPI Accept Invitation: POST /api/v1/schools/{school_id}/members/accept
        const api =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        for (const item of pending) {
          const response = await fetch(
            api + "/api/v1/schools/" + item.school_id + "/members/accept",
            {
              method: "POST",
              headers: { Authorization: "Bearer " + session.access_token },
            },
          );
          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(
              body.detail || "Could not activate school membership.",
            );
          }
        }
        */

        // Offline/Preview mode: simulate invitation accepted
        if (!cancelled) {
          setMessage(
            "[Preview Mode] Invitation accepted. Your school access is ready.",
          );
          setTimeout(() => router.replace("/dashboard"), 1200);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Unable to accept invitation.",
          );
      }
    }

    void accept();
    return () => {
      cancelled = true;
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
            <p className="error">{error}</p>
            <Link href="/login">Go to sign in</Link>
          </>
        ) : (
          <p className="success">{message}</p>
        )}
      </div>
    </main>
  );
}
