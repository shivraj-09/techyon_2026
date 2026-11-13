"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type Referral = { id: string; student_id: string; class_id: string; category: string; summary: string; urgency: string; status: string; assigned_counsellor_id?: string | null; created_at: string };
type CaseRecord = { id: string; student_id: string; referral_id: string; status: string; opened_at: string; closed_at?: string | null };
type Conversation = { id: string; public_ref: string; status: string; assigned_counsellor_id?: string | null; last_message_at?: string | null };
type Message = { id: string; sender_kind: string; body: string; created_at: string };
type MeetingRequest = { id: string; conversation_id: string; preferred_times: string; student_message?: string | null; status: string; created_at: string };
type SessionRecord = { id: string; title: string; description: string; audience: string; starts_at: string; ends_at: string; status: string; location?: string | null };
type NoticeRecord = { id: string; title: string; body: string; audience: string; publish_at: string; status: string };

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function CounsellorDashboardPage() {
  const [schoolId, setSchoolId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [noteCaseId, setNoteCaseId] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");
  const [sessionAudience, setSessionAudience] = useState("students");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeAudience, setNoticeAudience] = useState("students");

  const apiFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!token) throw new Error("Your session is not ready. Sign in again.");
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
    if (!response.ok) {
      const detail = typeof data.detail === "string" ? data.detail : "The request could not be completed.";
      throw new Error(detail);
    }
    return data;
  }, [token]);

  const loadWorkspace = useCallback(async (sid: string) => {
    const results = await Promise.all([
      apiFetch(`/schools/${sid}/counsellor/referrals`),
      apiFetch(`/schools/${sid}/counselling/cases`),
      apiFetch(`/schools/${sid}/counselling/sessions`),
      apiFetch(`/schools/${sid}/counselling/notices`),
      apiFetch(`/schools/${sid}/student-voice/conversations/inbox`),
      apiFetch(`/schools/${sid}/student-voice/meeting-requests`),
    ]);
    setReferrals(results[0].referrals || []);
    setCases(results[1].cases || []);
    setSessions(results[2].sessions || []);
    setNotices(results[3].notices || []);
    setConversations(results[4].conversations || []);
    setMeetingRequests(results[5].meeting_requests || []);
  }, [apiFetch]);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) {
          window.location.replace("/login");
          return;
        }
        const response = await fetch(`${API}/api/v1/auth/memberships`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not verify your school membership.");
        const data = await response.json();
        const requestedSchool = sessionStorage.getItem("edusync_active_school_id");
        const membership = (data.memberships || []).find((item: { role: string; status: string; school_id: string }) =>
          item.role === "counsellor" && item.status === "active" && (!requestedSchool || item.school_id === requestedSchool),
        );
        if (!membership) {
          await supabase.auth.signOut();
          window.location.replace("/login");
          return;
        }
        if (!active) return;
        sessionStorage.setItem("edusync_demo_role", "counsellor");
        sessionStorage.setItem("edusync_active_school_id", membership.school_id);
        setToken(session.access_token);
        setSchoolId(membership.school_id);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not initialise counsellor workspace.");
      }
    }
    void initialise();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!token || !schoolId) return;
    setLoading(true);
    loadWorkspace(schoolId)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load counsellor workspace."))
      .finally(() => setLoading(false));
  }, [token, schoolId, loadWorkspace]);

  async function runAction(action: () => Promise<void>) {
    setError("");
    setNotice("");
    try { await action(); }
    catch (err) { setError(err instanceof Error ? err.message : "Action failed."); }
  }

  async function reviewReferral(referral: Referral, status: string) {
    await apiFetch(`/schools/${schoolId}/counsellor/referrals/${referral.id}`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    setNotice("Referral updated.");
    await loadWorkspace(schoolId);
  }

  async function openCase(referral: Referral) {
    await apiFetch(`/schools/${schoolId}/counselling/cases`, {
      method: "POST", body: JSON.stringify({ referral_id: referral.id }),
    });
    setNotice("Confidential case opened.");
    await loadWorkspace(schoolId);
  }

  async function updateCase(record: CaseRecord, status: string) {
    await apiFetch(`/schools/${schoolId}/counselling/cases/${record.id}`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    setNotice("Case status updated.");
    await loadWorkspace(schoolId);
  }

  async function saveCaseNote(event: FormEvent) {
    event.preventDefault();
    if (!noteCaseId || !noteDraft.trim()) return;
    await runAction(async () => {
      await apiFetch(`/schools/${schoolId}/counselling/cases/${noteCaseId}/notes`, {
        method: "POST", body: JSON.stringify({ note_body: noteDraft }),
      });
      setNoteDraft("");
      setNotice("Private case note saved.");
    });
  }

  async function openConversation(conversation: Conversation) {
    await runAction(async () => {
      const data = await apiFetch(`/schools/${schoolId}/student-voice/conversations/${conversation.id}/messages`);
      setSelectedConversation(conversation);
      setMessages(data.messages || []);
    });
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selectedConversation || !messageDraft.trim()) return;
    await runAction(async () => {
      await apiFetch(`/schools/${schoolId}/student-voice/conversations/${selectedConversation.id}/messages`, {
        method: "POST", body: JSON.stringify({ body: messageDraft }),
      });
      setMessageDraft("");
      await openConversation(selectedConversation);
      await loadWorkspace(schoolId);
    });
  }

  async function reviewMeeting(request: MeetingRequest, status: string) {
    await apiFetch(`/schools/${schoolId}/student-voice/meeting-requests/${request.id}`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    setNotice("Meeting request updated.");
    await loadWorkspace(schoolId);
  }

  async function revealIdentity(request: MeetingRequest) {
    const data = await apiFetch(`/schools/${schoolId}/student-voice/meeting-requests/${request.id}/student-identity`);
    setNotice(`Identity access audited. Student record: ${data.identity.student_id}`);
  }

  async function updateSession(item: SessionRecord, status: string) {
    await runAction(async () => {
      await apiFetch(`/schools/${schoolId}/counselling/sessions/${item.id}`, {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      setNotice("Session status updated.");
      await loadWorkspace(schoolId);
    });
  }

  async function updateNotice(item: NoticeRecord, status: string) {
    await runAction(async () => {
      await apiFetch(`/schools/${schoolId}/counselling/notices/${item.id}`, {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      setNotice("Notice status updated.");
      await loadWorkspace(schoolId);
    });
  }

  async function createSession(event: FormEvent) {
    event.preventDefault();
    await runAction(async () => {
      await apiFetch(`/schools/${schoolId}/counselling/sessions`, {
        method: "POST",
        body: JSON.stringify({
          title: sessionTitle, description: sessionDescription, audience: sessionAudience,
          starts_at: new Date(sessionStart).toISOString(), ends_at: new Date(sessionEnd).toISOString(),
          status: "draft", meeting_mode: "in_person",
        }),
      });
      setSessionTitle(""); setSessionDescription(""); setSessionStart(""); setSessionEnd("");
      setNotice("Session saved as a draft.");
      await loadWorkspace(schoolId);
    });
  }

  async function createNotice(event: FormEvent) {
    event.preventDefault();
    await runAction(async () => {
      await apiFetch(`/schools/${schoolId}/counselling/notices`, {
        method: "POST",
        body: JSON.stringify({
          title: noticeTitle, body: noticeBody, audience: noticeAudience,
          publish_at: new Date().toISOString(), status: "draft",
        }),
      });
      setNoticeTitle(""); setNoticeBody("");
      setNotice("Notice saved as a draft.");
      await loadWorkspace(schoolId);
    });
  }

  return (
    <AppLayout defaultRole="counsellor">
      <div className="es-stack">
        <PageHeader title="Counsellor Workspace" subtitle="Confidential student support, referrals, sessions and Student Voice." />
        {error && <div className="es-card" role="alert" style={{ borderColor: "#dc6b6b", color: "#a52b2b" }}>{error}</div>}
        {notice && <div className="es-card" role="status">{notice}</div>}
        {loading ? <div className="es-card">Loading secure counsellor workspace…</div> : (
          <>
            <section className="es-grid-4">
              <article className="es-stat-card"><span className="es-stat-label">Referrals</span><strong className="es-stat-value">{referrals.length}</strong></article>
              <article className="es-stat-card"><span className="es-stat-label">Active cases</span><strong className="es-stat-value">{cases.filter((item) => item.status !== "closed").length}</strong></article>
              <article className="es-stat-card"><span className="es-stat-label">Student Voice</span><strong className="es-stat-value">{conversations.length}</strong></article>
              <article className="es-stat-card"><span className="es-stat-label">Meeting requests</span><strong className="es-stat-value">{meetingRequests.filter((item) => item.status === "pending").length}</strong></article>
            </section>

            <section id="referrals" className="es-card">
              <h2>Referral inbox</h2><p className="es-muted">Review teacher-submitted concerns. Student identifiers are limited to authorized backend responses.</p>
              {referrals.length === 0 ? <p>No referrals available.</p> : referrals.map((item) => (
                <article key={item.id} className="es-list-row">
                  <div><strong>{item.category.replaceAll("_", " ")}</strong> <Badge>{item.urgency}</Badge><p>{item.summary}</p><small>{item.status} · {new Date(item.created_at).toLocaleString()}</small></div>
                  <div className="es-row-actions">
                    {item.status === "submitted" && <Button size="sm" onClick={() => void runAction(() => reviewReferral(item, "under_review"))}>Review</Button>}
                    {["submitted", "under_review", "clarification_requested"].includes(item.status) && <Button size="sm" variant="secondary" onClick={() => void runAction(() => reviewReferral(item, "accepted"))}>Accept</Button>}
                    {item.status === "accepted" && <Button size="sm" onClick={() => void runAction(() => openCase(item))}>Open case</Button>}
                    {item.status !== "closed" && item.status !== "declined" && <Button size="sm" variant="ghost" onClick={() => void runAction(() => reviewReferral(item, "declined"))}>Decline</Button>}
                  </div>
                </article>
              ))}
            </section>

            <section id="cases" className="es-card">
              <h2>Confidential cases</h2><p className="es-muted">Only the assigned counsellor can access case records and private notes.</p>
              {cases.length === 0 ? <p>No cases assigned yet.</p> : cases.map((item) => (
                <article key={item.id} className="es-list-row">
                  <div><strong>Case {item.id.slice(0, 8)}</strong><p>Status: {item.status}</p><small>Opened {new Date(item.opened_at).toLocaleDateString()}</small></div>
                  <div className="es-row-actions">
                    {item.status === "open" && <Button size="sm" onClick={() => void runAction(() => updateCase(item, "in_progress"))}>Start</Button>}
                    {item.status !== "closed" && <Button size="sm" variant="secondary" onClick={() => void runAction(() => updateCase(item, "closed"))}>Close</Button>}
                  </div>
                </article>
              ))}
              <form onSubmit={saveCaseNote} className="es-form-grid">
                <label>Case<select value={noteCaseId} onChange={(e) => setNoteCaseId(e.target.value)} required><option value="">Select a case</option>{cases.filter((item) => item.status !== "closed").map((item) => <option key={item.id} value={item.id}>{item.id.slice(0, 8)}</option>)}</select></label>
                <label>Private note<textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} required maxLength={10000} rows={3} /></label>
                <Button type="submit" disabled={!noteCaseId || !noteDraft.trim()}>Save private note</Button>
              </form>
            </section>

            <section id="sessions" className="es-card">
              <h2>Counselling sessions & notices</h2>
              <div className="es-dashboard-grid-main">
                <form onSubmit={createSession} className="es-form-grid">
                  <h3>Create session (draft)</h3>
                  <label>Title<input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} required maxLength={160} /></label>
                  <label>Description<textarea value={sessionDescription} onChange={(e) => setSessionDescription(e.target.value)} required maxLength={5000} /></label>
                  <label>Audience<select value={sessionAudience} onChange={(e) => setSessionAudience(e.target.value)}><option value="students">Students</option><option value="parents">Parents</option><option value="teachers">Teachers</option></select></label>
                  <label>Starts at<input type="datetime-local" value={sessionStart} onChange={(e) => setSessionStart(e.target.value)} required /></label>
                  <label>Ends at<input type="datetime-local" value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)} required /></label>
                  <Button type="submit">Save session draft</Button>
                </form>
                <form onSubmit={createNotice} className="es-form-grid">
                  <h3>Create notice (draft)</h3>
                  <label>Title<input value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} required maxLength={160} /></label>
                  <label>Message<textarea value={noticeBody} onChange={(e) => setNoticeBody(e.target.value)} required maxLength={5000} /></label>
                  <label>Audience<select value={noticeAudience} onChange={(e) => setNoticeAudience(e.target.value)}><option value="students">Students</option><option value="parents">Parents</option><option value="teachers">Teachers</option></select></label>
                  <Button type="submit">Save notice draft</Button>
                </form>
              </div>
              <h3>Scheduled sessions</h3>{sessions.map((item) => <article key={item.id} className="es-list-row"><div><strong>{item.title}</strong><p>{item.audience} · {item.status} · {new Date(item.starts_at).toLocaleString()}</p></div><div className="es-row-actions">{item.status === "draft" && <Button size="sm" onClick={() => void updateSession(item, "published")}>Publish</Button>}{item.status === "published" && <><Button size="sm" variant="secondary" onClick={() => void updateSession(item, "completed")}>Complete</Button><Button size="sm" variant="ghost" onClick={() => void updateSession(item, "cancelled")}>Cancel</Button></>}</div></article>)}
              <h3>Notices</h3>{notices.map((item) => <article key={item.id} className="es-list-row"><div><strong>{item.title}</strong><p>{item.audience} · {item.status}</p></div><div className="es-row-actions">{item.status === "draft" && <Button size="sm" onClick={() => void updateNotice(item, "published")}>Publish</Button>}{item.status === "published" && <Button size="sm" variant="ghost" onClick={() => void updateNotice(item, "cancelled")}>Cancel</Button>}</div></article>)}
            </section>

            <section id="student-voice" className="es-card">
              <h2>Student Voice</h2><p className="es-muted">Conversations are pseudonymous. Identity is not displayed in the inbox.</p>
              <div className="es-dashboard-grid-main">
                <div><h3>Conversation inbox</h3>{conversations.map((item) => <button key={item.id} className="es-list-row" type="button" onClick={() => void openConversation(item)}><strong>{item.public_ref}</strong><span>{item.status} · {item.assigned_counsellor_id ? "Assigned" : "Unassigned"}</span></button>)}</div>
                <div><h3>Meeting requests</h3>{meetingRequests.map((item) => <article key={item.id} className="es-list-row"><div><strong>{item.status}</strong><p>{item.preferred_times}</p>{item.student_message && <p>{item.student_message}</p>}</div><div className="es-row-actions">{item.status === "pending" && <><Button size="sm" onClick={() => void runAction(() => reviewMeeting(item, "approved"))}>Approve</Button><Button size="sm" variant="secondary" onClick={() => void runAction(() => reviewMeeting(item, "declined"))}>Decline</Button></>}{["approved", "completed"].includes(item.status) && <Button size="sm" variant="ghost" onClick={() => void runAction(() => revealIdentity(item))}>Audited identity reveal</Button>}{item.status === "approved" && <Button size="sm" variant="secondary" onClick={() => void runAction(() => reviewMeeting(item, "completed"))}>Mark completed</Button>}</div></article>)}</div>
              </div>
              {selectedConversation && <div className="es-card" style={{ marginTop: 16 }}><h3>{selectedConversation.public_ref}</h3><div className="es-message-list">{messages.map((item) => <p key={item.id}><strong>{item.sender_kind}:</strong> {item.body}</p>)}</div><form onSubmit={sendMessage} className="es-form-grid"><label>Reply<textarea value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} required maxLength={5000} /></label><Button type="submit" disabled={!messageDraft.trim()}>Send reply</Button></form></div>}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
