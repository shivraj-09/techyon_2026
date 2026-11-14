"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function AcceptInvitePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your invitation…");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function accept() {
      try {
        const supabase = createClient();
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const tokenHash = params.get("token_hash");
        const type = params.get("type");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && (type === "invite" || type === "signup" || type === "email")) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "invite" | "signup" | "email",
          });
          if (verifyError) throw verifyError;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) {
          throw new Error("Invitation link is invalid or expired. Ask your administrator to resend it.");
        }

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const pendingResponse = await fetch(`${API}/api/v1/auth/pending-invitations`, {
          headers, cache: "no-store",
        });
        if (!pendingResponse.ok) throw new Error("Could not verify pending school invitations.");
        const pendingData = await pendingResponse.json();
        const pending = Array.isArray(pendingData.invitations) ? pendingData.invitations : [];
        if (pending.length === 0) throw new Error("No pending school invitation was found for this account.");

        const accepted = [];
        for (const invitation of pending) {
          const response = await fetch(`${API}/api/v1/schools/${invitation.school_id}/members/accept`, {
            method: "POST", headers, cache: "no-store",
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Could not activate school membership.");
          accepted.push(data.membership);
        }
        const membership = accepted.find((item) => item?.status === "active") || accepted[0];
        if (!membership?.school_id || !membership?.role) throw new Error("The invitation service returned an invalid membership.");

        sessionStorage.setItem("edusync_demo_email", session.user.email || "");
        sessionStorage.setItem("edusync_demo_role", membership.role);
        sessionStorage.setItem("edusync_active_school_id", membership.school_id);
        if (!cancelled) {
          setMessage("Invitation accepted. Your school access is ready.");
          const destination = membership.role === "counsellor" ? "/counsellor/dashboard"
            : membership.role === "teacher" ? "/teacher/dashboard"
              : membership.role === "parent" ? "/parent/dashboard" : "/dashboard";
          router.replace(destination);
          router.refresh();
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to accept invitation.");
      }
    }
    void accept();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <main>
      <header className="topbar"><div className="brand"><span className="mark"><Image src="/circle-logo.svg" alt="" width={28} height={28} className="circle-auth-brand-logo" priority /></span>CIRCLE</div></header>
      <div className="auth card">
        <span className="pill">SCHOOL INVITATION</span>
        <h1>You’re almost in</h1>
        {error ? <><p className="error">{error}</p><Link href="/login">Go to sign in</Link></> : <p className="success">{message}</p>}
      </div>
    </main>
  );
}
