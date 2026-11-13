"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type LinkRecord = { id: string; student_id: string; student_user_id: string; status: "active" | "revoked"; created_at: string };
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const API = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;

export default function StudentVoiceLinksPage() {
  const [schoolId, setSchoolId] = useState("");
  const [token, setToken] = useState("");
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [studentId, setStudentId] = useState("");
  const [studentUserId, setStudentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${API}/api/v1${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Request failed.");
    return data;
  }, [token]);

  const load = useCallback(async (sid: string) => {
    const data = await request(`/schools/${sid}/student-voice/links`);
    setLinks(data.links || []);
  }, [request]);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) { window.location.replace("/login"); return; }
        const response = await fetch(`${API}/api/v1/auth/memberships`, {
          headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not verify school membership.");
        const data = await response.json();
        const savedSchool = sessionStorage.getItem("edusync_active_school_id");
        const membership = (data.memberships || []).find((item: { role: string; status: string; school_id: string }) =>
          item.role === "admin" && item.status === "active" && (!savedSchool || item.school_id === savedSchool),
        );
        if (!membership) { window.location.replace("/login"); return; }
        if (!active) return;
        setToken(session.access_token);
        setSchoolId(membership.school_id);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load access.");
      }
    }
    void init();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!schoolId || !token) return;
    setLoading(true);
    load(schoolId).catch((err) => setError(err instanceof Error ? err.message : "Could not load links."))
      .finally(() => setLoading(false));
  }, [schoolId, token, load]);

  async function createLink(event: FormEvent) {
    event.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    try {
      await request(`/schools/${schoolId}/student-voice/links`, {
        method: "POST",
        body: JSON.stringify({ student_id: studentId.trim(), student_user_id: studentUserId.trim() }),
      });
      setStudentId(""); setStudentUserId("");
      setMessage("Student Voice access linked.");
      await load(schoolId);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create link."); }
    finally { setBusy(false); }
  }

  async function revokeLink(link: LinkRecord) {
    if (!window.confirm("Revoke this Student Voice link? This action is terminal and cannot be undone.")) return;
    setError(""); setMessage(""); setBusy(true);
    try {
      await request(`/schools/${schoolId}/student-voice/links/${link.id}/revoke`, { method: "PATCH" });
      setMessage("Student Voice access revoked.");
      await load(schoolId);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not revoke link."); }
    finally { setBusy(false); }
  }

  return (
    <AppLayout defaultRole="admin">
      <div className="es-stack">
        <PageHeader title="Student Voice Access" subtitle="Manage which authenticated student accounts can use pseudonymous Student Voice." />
        <section className="es-card">
          <h2>Link a student account</h2>
          <p className="es-muted">Use the student's school record UUID and their Supabase Auth user UUID. Verify both identifiers before creating a link. A student and an Auth account can each be linked only once per school.</p>
          <form onSubmit={createLink} className="es-form-grid">
            <label>Student record ID<input value={studentId} onChange={(e) => setStudentId(e.target.value)} required placeholder="UUID from the student record" /></label>
            <label>Supabase Auth user ID<input value={studentUserId} onChange={(e) => setStudentUserId(e.target.value)} required placeholder="UUID from Authentication → Users" /></label>
            <Button type="submit" disabled={busy || !studentId.trim() || !studentUserId.trim()}>{busy ? "Saving…" : "Create link"}</Button>
          </form>
        </section>
        {error && <div className="es-card" role="alert" style={{ color: "var(--es-danger)" }}>{error}</div>}
        {message && <div className="es-card" role="status">{message}</div>}
        <section className="es-card">
          <h2>Linked accounts</h2>
          {loading ? <p>Loading links…</p> : links.length === 0 ? <p>No Student Voice links exist for this school.</p> : links.map((link) => (
            <article key={link.id} className="es-list-row">
              <div>
                <strong>Student {link.student_id.slice(0, 8)}</strong>
                <p>Auth user: {link.student_user_id}</p>
                <small>{link.status} · linked {new Date(link.created_at).toLocaleString()}</small>
              </div>
              {link.status === "active" && <Button size="sm" variant="danger" disabled={busy} onClick={() => void revokeLink(link)}>Revoke access</Button>}
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}
