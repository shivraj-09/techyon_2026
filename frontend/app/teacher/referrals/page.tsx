"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Select } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type ClassOption = { id: string; name: string; grade_level: string | null; section: string | null; academic_year: string };
type StudentOption = { id: string; class_id: string; name: string; admission_no: string; roll_number: string | null };
type Referral = { id: string; student_id: string; class_id: string; category: string; summary: string; urgency: string; status: string; created_at: string };

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const CATEGORY_MAP: Record<string, string> = {
  "Academic Difficulty": "academic",
  "Behavioural Concern": "behaviour",
  "Social or Peer Difficulties": "peer_relationships",
  "Emotional Wellbeing Concern": "wellbeing",
  "Attendance-Related Concern": "attendance",
  "Other": "other",
};

export default function TeacherReferralsPage() {
  const [token, setToken] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState("Academic Difficulty");
  const [urgency, setUrgency] = useState("normal");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
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
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Request failed.");
    return data;
  }, [token]);

  const load = useCallback(async (sid: string) => {
    const [classData, referralData] = await Promise.all([
      request(`/schools/${sid}/classes`),
      request(`/schools/${sid}/counsellor/referrals`),
    ]);
    setClasses(classData.classes || []);
    setReferrals(referralData.referrals || []);
  }, [request]);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) { window.location.replace("/login"); return; }
        const response = await fetch(`${API}/api/v1/auth/memberships`, {
          headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not verify teacher membership.");
        const data = await response.json();
        const savedSchool = sessionStorage.getItem("edusync_active_school_id");
        const membership = (data.memberships || []).find((item: { role: string; status: string; school_id: string }) =>
          item.role === "teacher" && item.status === "active" && (!savedSchool || item.school_id === savedSchool),
        );
        if (!membership) { window.location.replace("/login"); return; }

        const { data: assignments, error: assignmentError } = await supabase
          .from("class_teacher_assignments")
          .select("class_id")
          .eq("school_id", membership.school_id)
          .eq("teacher_user_id", session.user.id);
        if (assignmentError) throw assignmentError;
        const assignedIds = new Set((assignments || []).map((item: { class_id: string }) => item.class_id));

        const { data: enrollmentRows, error: enrollmentError } = await supabase
          .from("student_enrollments")
          .select("student_id,class_id,roll_number,students(id,first_name,last_name,admission_no)")
          .eq("school_id", membership.school_id)
          .eq("status", "active");
        if (enrollmentError) throw enrollmentError;
        const studentOptions: StudentOption[] = (enrollmentRows || [])
          .filter((item: any) => assignedIds.has(item.class_id) && item.students)
          .map((item: any) => ({
            id: item.student_id,
            class_id: item.class_id,
            name: [item.students.first_name, item.students.last_name].filter(Boolean).join(" "),
            admission_no: item.students.admission_no || "",
            roll_number: item.roll_number,
          }));
        if (!active) return;
        setToken(session.access_token);
        setSchoolId(membership.school_id);
        setStudents(studentOptions);
        sessionStorage.setItem("edusync_active_school_id", membership.school_id);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load teacher access.");
      }
    }
    void initialise();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!schoolId || !token) return;
    setLoading(true);
    load(schoolId).catch((err) => setError(err instanceof Error ? err.message : "Could not load referrals."))
      .finally(() => setLoading(false));
  }, [schoolId, token, load]);

  const classStudents = useMemo(() => students.filter((student) => student.class_id === classId), [students, classId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(""); setNotice("");
    if (!classId || !studentId) { setError("Select a class and student."); return; }
    if (summary.trim().length < 10) { setError("Please provide at least 10 characters of factual context."); return; }
    setBusy(true);
    try {
      await request(`/schools/${schoolId}/counsellor/referrals`, {
        method: "POST",
        body: JSON.stringify({
          class_id: classId,
          student_id: studentId,
          category: CATEGORY_MAP[category],
          urgency,
          summary: summary.trim(),
        }),
      });
      setSummary("");
      setStudentId("");
      setNotice("Referral submitted securely to the school counsellor.");
      await load(schoolId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit referral.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout defaultRole="teacher">
      <div className="es-stack">
        <PageHeader title="Student Referrals" subtitle="Submit factual, school-scoped wellbeing referrals for students in your assigned classes." />
        {error && <div className="es-card" role="alert">{error}</div>}
        {notice && <div className="es-card" role="status">{notice}</div>}
        <Card>
          <CardHeader><CardTitle>New referral</CardTitle></CardHeader>
          <CardBody>
            <form id="new" onSubmit={submit} className="es-form-grid">
              <label>Class
                <select value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); }} required>
                  <option value="">Choose assigned class</option>
                  {classes.filter((item) => students.some((s) => s.class_id === item.id)).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}{item.section ? ` · ${item.section}` : ""} · {item.academic_year}</option>
                  ))}
                </select>
              </label>
              <label>Student
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required disabled={!classId}>
                  <option value="">Choose student</option>
                  {classStudents.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.admission_no}{item.roll_number ? ` · Roll ${item.roll_number}` : ""}</option>)}
                </select>
              </label>
              <label>Concern category
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {Object.keys(CATEGORY_MAP).map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>Urgency
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
                </select>
              </label>
              <label className="es-form-grid-full">Factual observations and context
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} minLength={10} maxLength={3000} rows={5} required placeholder="Describe what you observed, when it occurred, and any support already offered. Avoid assumptions or diagnoses." />
              </label>
              <Button type="submit" disabled={busy || !classId || !studentId || summary.trim().length < 10}>{busy ? "Submitting…" : "Submit referral"}</Button>
            </form>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>My submitted referrals</CardTitle></CardHeader>
          <CardBody>
            {loading ? <p>Loading referrals…</p> : referrals.length === 0 ? <p>No referrals submitted yet.</p> : referrals.map((item) => (
              <article key={item.id} className="es-list-row">
                <div><strong>{item.category.replaceAll("_", " ")}</strong><p>{item.summary}</p><small>{item.status.replaceAll("_", " ")} · {new Date(item.created_at).toLocaleString()}</small></div>
                <div className="es-row-actions"><Badge>{item.urgency}</Badge></div>
              </article>
            ))}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
