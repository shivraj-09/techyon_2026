"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

type Conversation = { id: string; public_ref: string; status: string; created_at: string };
type Message = { id: string; sender_kind: string; body: string; created_at: string };
type MeetingRequest = { id: string; preferred_times: string; student_message?: string | null; status: string; created_at: string };
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const API = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;

export default function StudentVoicePage() {
  const [schoolId, setSchoolId] = useState("");
  const [token, setToken] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");
  const [meetingMessage, setMeetingMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!token) throw new Error("Your session is not ready.");
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

  const refresh = useCallback(async (sid: string) => {
    const [conversationData, meetingData] = await Promise.all([
      request(`/schools/${sid}/student-voice/conversations/mine`),
      request(`/schools/${sid}/student-voice/meeting-requests/mine`),
    ]);
    setConversations(conversationData.conversations || []);
    setMeetings(meetingData.meeting_requests || []);
  }, [request]);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) { window.location.replace("/login"); return; }
        const response = await fetch(`${API}/api/v1/auth/student-voice-access`, {
          headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not verify Student Voice access.");
        const data = await response.json();
        const savedSchool = sessionStorage.getItem("edusync_active_school_id");
        const link = (data.access || []).find((item: { school_id: string }) => !savedSchool || item.school_id === savedSchool);
        if (!link?.school_id) {
          await supabase.auth.signOut();
          window.location.replace("/login");
          return;
        }
        if (!active) return;
        sessionStorage.setItem("edusync_demo_role", "student");
        sessionStorage.setItem("edusync_active_school_id", link.school_id);
        setToken(session.access_token);
        setSchoolId(link.school_id);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not initialise Student Voice.");
      }
    }
    void initialise();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!token || !schoolId) return;
    setLoading(true);
    refresh(schoolId).catch((err) => setError(err instanceof Error ? err.message : "Could not load conversations."))
      .finally(() => setLoading(false));
  }, [token, schoolId, refresh]);

  async function run(action: () => Promise<void>) {
    setError(""); setInfo(""); setBusy(true);
    try { await action(); }
    catch (err) { setError(err instanceof Error ? err.message : "Action failed."); }
    finally { setBusy(false); }
  }

  async function startConversation() {
    await run(async () => {
      const data = await request(`/schools/${schoolId}/student-voice/conversations`, { method: "POST" });
      const conversation = data.conversation as Conversation;
      setSelected(conversation);
      setMessages([]);
      await refresh(schoolId);
      setInfo(`Your conversation reference is ${conversation.public_ref}. Keep this reference for future visits.`);
    });
  }

  async function openConversation(conversation: Conversation) {
    await run(async () => {
      const data = await request(`/schools/${schoolId}/student-voice/conversations/${conversation.id}/messages`);
      setSelected(conversation);
      setMessages(data.messages || []);
    });
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selected || !messageDraft.trim()) return;
    await run(async () => {
      await request(`/schools/${schoolId}/student-voice/conversations/${selected.id}/messages`, {
        method: "POST", body: JSON.stringify({ body: messageDraft }),
      });
      setMessageDraft("");
      const data = await request(`/schools/${schoolId}/student-voice/conversations/${selected.id}/messages`);
      setMessages(data.messages || []);
      await refresh(schoolId);
    });
  }

  async function requestMeeting(event: FormEvent) {
    event.preventDefault();
    if (!selected || !preferredTimes.trim()) return;
    await run(async () => {
      await request(`/schools/${schoolId}/student-voice/conversations/${selected.id}/meeting-requests`, {
        method: "POST",
        body: JSON.stringify({ preferred_times: preferredTimes, student_message: meetingMessage || null }),
      });
      setPreferredTimes(""); setMeetingMessage("");
      await refresh(schoolId);
      setInfo("Your meeting request has been sent to the counsellor.");
    });
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("edusync_demo_email");
    sessionStorage.removeItem("edusync_demo_role");
    sessionStorage.removeItem("edusync_active_school_id");
    window.location.replace("/login");
  }

  return (
    <main className="es-student-voice-page" style={{ minHeight: "100vh", background: "var(--es-bg-app)", padding: "24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 18 }}>
        <header className="es-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div><div className="es-brand-title">EduSync · Student Voice</div><p className="es-muted">A private, pseudonymous way to contact your school counsellor.</p></div>
          <button type="button" className="es-btn es-btn-secondary es-btn-sm" onClick={() => void signOut()}>Sign out</button>
        </header>
        <div className="es-card" style={{ borderColor: "var(--es-info-border)", background: "var(--es-info-bg)" }}>
          <strong>About privacy</strong>
          <p className="es-muted">Your conversation is shown to counsellors using a reference instead of your name. This is pseudonymous, not guaranteed anonymity. If you or someone else is in immediate danger, contact a trusted adult or local emergency services now.</p>
        </div>
        {error && <div className="es-card" role="alert" style={{ color: "var(--es-danger)" }}>{error}</div>}
        {info && <div className="es-card" role="status">{info}</div>}
        {loading ? <div className="es-card">Loading your Student Voice access…</div> : (
          <div className="es-dashboard-grid-main">
            <section className="es-card">
              <h2>Your conversations</h2>
              <Button onClick={() => void startConversation()} disabled={busy}>Start a conversation</Button>
              {conversations.length === 0 ? <p className="es-muted">You have not started a conversation yet.</p> : conversations.map((item) => (
                <button key={item.id} type="button" className="es-list-row" onClick={() => void openConversation(item)}>
                  <strong>{item.public_ref}</strong><span>{item.status} · {new Date(item.created_at).toLocaleDateString()}</span>
                </button>
              ))}
              <h3>Meeting requests</h3>
              {meetings.length === 0 ? <p className="es-muted">No meeting requests yet.</p> : meetings.map((item) => <article className="es-list-row" key={item.id}><div><strong>{item.status}</strong><p>{item.preferred_times}</p>{item.student_message && <small>{item.student_message}</small>}</div></article>)}
            </section>
            <section className="es-card">
              <h2>{selected ? selected.public_ref : "Choose a conversation"}</h2>
              {!selected ? <p className="es-muted">Select an existing conversation or start a new one.</p> : (
                <>
                  <div className="es-message-list">{messages.length === 0 ? <p className="es-muted">Send your first message whenever you are ready.</p> : messages.map((item) => <p key={item.id}><strong>{item.sender_kind === "counsellor" ? "Counsellor" : "You"}:</strong> {item.body}</p>)}</div>
                  {selected.status === "open" && <form onSubmit={sendMessage} className="es-form-grid"><label>Message<textarea value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} required maxLength={5000} rows={3} /></label><Button type="submit" disabled={busy || !messageDraft.trim()}>Send message</Button></form>}
                  <form onSubmit={requestMeeting} className="es-form-grid"><h3>Request an in-person meeting</h3><label>Preferred times<textarea value={preferredTimes} onChange={(e) => setPreferredTimes(e.target.value)} required maxLength={2000} rows={2} placeholder="Share days or times that work for you" /></label><label>Optional message<textarea value={meetingMessage} onChange={(e) => setMeetingMessage(e.target.value)} maxLength={2000} rows={2} /></label><Button type="submit" variant="secondary" disabled={busy || !preferredTimes.trim() || selected.status !== "open"}>Request meeting</Button></form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
