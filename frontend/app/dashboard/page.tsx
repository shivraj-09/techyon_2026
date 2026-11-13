"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "admin" | "teacher" | "parent";
type Membership = {
  id: string;
  school_id: string;
  role: Role;
  status: string;
};
type SchoolClass = {
  id: string;
  school_id: string;
  name: string;
  grade_level: string | null;
  section: string | null;
  academic_year: string;
};
type Student = {
  id: string;
  admission_no: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  status: string;
};
type FeeBalance = {
  invoice_id: string;
  student_id: string;
  invoice_number: string;
  amount_due: string | number;
  amount_paid: string | number;
  outstanding_amount: string | number;
  due_date: string;
  status: string;
};
type AttendanceRecord = {
  id: string;
  student_id: string;
  attendance_date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks: string | null;
};

const apiBase = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function apiRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail =
      typeof body.detail === "string" ? body.detail : "The request could not be completed.";
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeBalances, setFeeBalances] = useState<FeeBalance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "students" | "attendance" | "fees">("overview");
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [admissionNo, setAdmissionNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);

  const activeMembership = useMemo(
    () => memberships.find((membership) => membership.school_id === schoolId),
    [memberships, schoolId],
  );
  const isAdmin = activeMembership?.role === "admin";

  useEffect(() => {
    let cancelled = false;
    async function loadAccount() {
      try {
        const supabase = createClient();
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) {
          router.replace("/login");
          return;
        }
        setEmail(data.session.user.email || "");
        setToken(data.session.access_token);
        const result = await apiRequest<{ success: boolean; memberships: Membership[] }>(
          "/api/v1/auth/memberships",
          data.session.access_token,
        );
        if (!result.success || !Array.isArray(result.memberships)) {
          throw new Error("The school membership service returned an invalid response.");
        }
        if (!cancelled) {
          setMemberships(result.memberships);
          setSchoolId(result.memberships[0]?.school_id || "");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load your account.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadAccount();
    return () => { cancelled = true; };
  }, [router]);

  const loadSchoolData = useCallback(async () => {
    if (!token || !schoolId) {
      setClasses([]);
      setStudents([]);
      return;
    }
    setDataLoading(true);
    setError("");
    try {
      const [classResult, studentResult] = await Promise.all([
        apiRequest<{ classes: SchoolClass[] }>(
          `/api/v1/schools/${schoolId}/classes`,
          token,
        ),
        apiRequest<{ students: Student[] }>(
          `/api/v1/schools/${schoolId}/students?limit=100`,
          token,
        ),
      ]);
      setClasses(classResult.classes || []);
      setStudents(studentResult.students || []);
      if (!selectedClassId && classResult.classes?.length) {
        setSelectedClassId(classResult.classes[0].id);
      }
      const feeResult = await apiRequest<{ balances: FeeBalance[] }>(
        `/api/v1/schools/${schoolId}/fees/balances?limit=100`,
        token,
      ).catch(() => ({ balances: [] }));
      setFeeBalances(feeResult.balances || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load school data.");
    } finally {
      setDataLoading(false);
    }
  }, [schoolId, token, selectedClassId]);

  useEffect(() => {
    void loadSchoolData();
  }, [loadSchoolData]);

  const loadAttendance = useCallback(async () => {
    if (!token || !schoolId || !selectedClassId || !attendanceDate) {
      setAttendanceRecords([]);
      return;
    }
    try {
      const result = await apiRequest<{ records: AttendanceRecord[] }>(
        `/api/v1/schools/${schoolId}/classes/${selectedClassId}/attendance?attendance_date=${attendanceDate}`,
        token,
      );
      setAttendanceRecords(result.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load attendance.");
      setAttendanceRecords([]);
    }
  }, [attendanceDate, schoolId, selectedClassId, token]);

  useEffect(() => {
    if (activeTab === "attendance") void loadAttendance();
  }, [activeTab, loadAttendance]);

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolId || !token) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(
        `/api/v1/schools/${schoolId}/classes`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            name: className.trim(),
            grade_level: gradeLevel.trim() || null,
            section: section.trim() || null,
            academic_year: academicYear.trim(),
          }),
        },
      );
      setClassName("");
      setGradeLevel("");
      setSection("");
      setClassFormOpen(false);
      setNotice("Class created successfully.");
      await loadSchoolData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create class.");
    } finally {
      setSaving(false);
    }
  }

  async function registerStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolId || !token) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(
        `/api/v1/schools/${schoolId}/students`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            admission_no: admissionNo.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim() || null,
            date_of_birth: dateOfBirth || null,
          }),
        },
      );
      setAdmissionNo("");
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setStudentFormOpen(false);
      setNotice("Student registered successfully.");
      await loadSchoolData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register student.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="shell"><p>Loading your EduSync workspace…</p></main>;
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="mark">E</span>EduSync</div>
        <div className="row">
          <span className="muted">{email}</span>
          <button className="btn secondary" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <div className="shell">
        <section className="hero">
          <span className="pill">SCHOOL OPERATING SYSTEM</span>
          <h1>Your school, connected.</h1>
          <p>Manage classes and student records from one workspace. Your access is determined by your verified school membership.</p>
        </section>

        {error && <p className="error" role="alert">{error}</p>}
        {notice && <p className="success" role="status">{notice}</p>}

        {memberships.length === 0 ? (
          <section className="card" style={{ marginTop: 20 }}>
            <h2>No active school access yet</h2>
            <p className="muted">You are signed in, but no active school membership is linked to this account. If you were invited, open the invitation link again or contact your school administrator.</p>
          </section>
        ) : (
          <>
            <section className="row" style={{ justifyContent: "space-between", marginTop: 28, flexWrap: "wrap" }}>
              <div>
                <span className="pill">YOUR WORKSPACE</span>
                <h2 style={{ marginBottom: 4 }}>School overview</h2>
                <p className="muted">Select a school workspace to view its records.</p>
              </div>
              {memberships.length > 1 && (
                <select
                  aria-label="Select school"
                  value={schoolId}
                  onChange={(event) => setSchoolId(event.target.value)}
                  style={{ padding: 12, borderRadius: 9, border: "1px solid #d5e0e4", minWidth: 240 }}
                >
                  {memberships.map((membership) => (
                    <option key={membership.id} value={membership.school_id}>
                      {membership.school_id} · {membership.role}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {activeMembership && (
              <p className="muted">
                Signed in as <strong>{activeMembership.role}</strong> · Membership {activeMembership.status} · School ID {schoolId}
              </p>
            )}

            <nav className="row" aria-label="School modules" style={{ gap: 8, flexWrap: "wrap", margin: "20px 0" }}>
              {(["overview", "classes", "students", "attendance", "fees"] as const).map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "btn" : "btn secondary"}
                  onClick={() => setActiveTab(tab)}
                  aria-current={activeTab === tab ? "page" : undefined}
                >
                  {tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <button className="btn secondary" onClick={() => void loadSchoolData()} disabled={dataLoading}>
                {dataLoading ? "Refreshing…" : "Refresh"}
              </button>
            </nav>

            {dataLoading ? (
              <p>Loading school records…</p>
            ) : (
              <>
                {activeTab === "overview" && (
                  <>
                    <section className="grid">
                      <article className="stat"><span className="muted">Classes</span><h2>{classes.length}</h2></article>
                      <article className="stat"><span className="muted">Student records</span><h2>{students.length}</h2></article>
                      <article className="stat"><span className="muted">Outstanding fees</span><h2>₹{feeBalances.reduce((sum, item) => sum + Number(item.outstanding_amount || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2></article>
                      <article className="stat"><span className="muted">Your role</span><h2 style={{ textTransform: "capitalize" }}>{activeMembership?.role}</h2></article>
                    </section>
                    <section className="grid">
                      <article className="card">
                        <h2>Classes</h2>
                        <p className="muted">Browse academic years, grades and sections.</p>
                        <button className="btn secondary" onClick={() => setActiveTab("classes")}>View classes</button>
                      </article>
                      <article className="card">
                        <h2>Students</h2>
                        <p className="muted">Review registered student records.</p>
                        <button className="btn secondary" onClick={() => setActiveTab("students")}>View students</button>
                      </article>
                    </section>
                  </>
                )}

                {activeTab === "classes" && (
                  <section className="card">
                    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                      <div><h2>Classes</h2><p className="muted">Classes available in this school.</p></div>
                      {isAdmin && <button className="btn" onClick={() => setClassFormOpen(!classFormOpen)}>{classFormOpen ? "Close" : "＋ Add class"}</button>}
                    </div>
                    {classFormOpen && isAdmin && (
                      <form onSubmit={createClass} className="field">
                        <label>Class name<input required value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. Class 10" /></label>
                        <label>Grade level<input value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="e.g. 10" /></label>
                        <label>Section<input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" /></label>
                        <label>Academic year<input required minLength={4} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} /></label>
                        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Create class"}</button>
                      </form>
                    )}
                    {classes.length === 0 ? <p className="muted">No classes have been added yet.</p> : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead><tr><th style={{ padding: 10 }}>Class</th><th style={{ padding: 10 }}>Grade</th><th style={{ padding: 10 }}>Section</th><th style={{ padding: 10 }}>Academic year</th></tr></thead>
                          <tbody>{classes.map((item) => (
                            <tr key={item.id} style={{ borderTop: "1px solid #e2eaed" }}>
                              <td style={{ padding: 10 }}>{item.name}</td><td style={{ padding: 10 }}>{item.grade_level || "—"}</td><td style={{ padding: 10 }}>{item.section || "—"}</td><td style={{ padding: 10 }}>{item.academic_year}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}

                {activeTab === "attendance" && (
                  <section className="card">
                    <h2>Attendance</h2>
                    <p className="muted">Review attendance recorded for a class and date.</p>
                    <div className="row" style={{ flexWrap: "wrap", margin: "16px 0" }}>
                      <label className="field" style={{ minWidth: 220 }}>Class
                        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                          {classes.map((item) => <option key={item.id} value={item.id}>{item.name}{item.section ? ` · ${item.section}` : ""}</option>)}
                        </select>
                      </label>
                      <label className="field">Date
                        <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                      </label>
                      <button className="btn secondary" onClick={() => void loadAttendance()}>Load attendance</button>
                    </div>
                    {attendanceRecords.length === 0 ? <p className="muted">No attendance records found for this class and date.</p> : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead><tr><th style={{ padding: 10 }}>Student</th><th style={{ padding: 10 }}>Admission no.</th><th style={{ padding: 10 }}>Status</th><th style={{ padding: 10 }}>Remarks</th></tr></thead>
                          <tbody>{attendanceRecords.map((record) => {
                            const student = students.find((item) => item.id === record.student_id);
                            return <tr key={record.id} style={{ borderTop: "1px solid #e2eaed" }}>
                              <td style={{ padding: 10 }}>{student ? `${student.first_name} ${student.last_name || ""}` : record.student_id}</td>
                              <td style={{ padding: 10 }}>{student?.admission_no || "—"}</td>
                              <td style={{ padding: 10, textTransform: "capitalize" }}>{record.status}</td>
                              <td style={{ padding: 10 }}>{record.remarks || "—"}</td>
                            </tr>;
                          })}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}

                {activeTab === "fees" && (
                  <section className="card">
                    <h2>Fee balances</h2>
                    <p className="muted">Outstanding balances returned by the school's fee API. Payment recording remains an admin-only workflow.</p>
                    <div className="grid">
                      <article className="stat"><span className="muted">Invoices</span><h2>{feeBalances.length}</h2></article>
                      <article className="stat"><span className="muted">Total invoiced</span><h2>₹{feeBalances.reduce((sum, item) => sum + Number(item.amount_due || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2></article>
                      <article className="stat"><span className="muted">Outstanding</span><h2>₹{feeBalances.reduce((sum, item) => sum + Number(item.outstanding_amount || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2></article>
                    </div>
                    {feeBalances.length === 0 ? <p className="muted">No fee balances are available for this account.</p> : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead><tr><th style={{ padding: 10 }}>Invoice</th><th style={{ padding: 10 }}>Due date</th><th style={{ padding: 10 }}>Amount due</th><th style={{ padding: 10 }}>Paid</th><th style={{ padding: 10 }}>Outstanding</th><th style={{ padding: 10 }}>Status</th></tr></thead>
                          <tbody>{feeBalances.map((item) => (
                            <tr key={item.invoice_id} style={{ borderTop: "1px solid #e2eaed" }}>
                              <td style={{ padding: 10 }}>{item.invoice_number}</td><td style={{ padding: 10 }}>{item.due_date}</td><td style={{ padding: 10 }}>₹{Number(item.amount_due).toLocaleString("en-IN")}</td><td style={{ padding: 10 }}>₹{Number(item.amount_paid).toLocaleString("en-IN")}</td><td style={{ padding: 10 }}>₹{Number(item.outstanding_amount).toLocaleString("en-IN")}</td><td style={{ padding: 10, textTransform: "capitalize" }}>{item.status.replaceAll("_", " ")}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}

                {activeTab === "students" && (
                  <section className="card">
                    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                      <div><h2>Students</h2><p className="muted">Student registry for this school.</p></div>
                      {isAdmin && <button className="btn" onClick={() => setStudentFormOpen(!studentFormOpen)}>{studentFormOpen ? "Close" : "＋ Register student"}</button>}
                    </div>
                    {studentFormOpen && isAdmin && (
                      <form onSubmit={registerStudent} className="field">
                        <label>Admission number<input required value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} placeholder="e.g. RHS-2026-001" /></label>
                        <label>First name<input required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
                        <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
                        <label>Date of birth<input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} /></label>
                        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Register student"}</button>
                      </form>
                    )}
                    {students.length === 0 ? <p className="muted">No student records are available for this school.</p> : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead><tr><th style={{ padding: 10 }}>Admission no.</th><th style={{ padding: 10 }}>Student</th><th style={{ padding: 10 }}>Date of birth</th><th style={{ padding: 10 }}>Status</th></tr></thead>
                          <tbody>{students.map((student) => (
                            <tr key={student.id} style={{ borderTop: "1px solid #e2eaed" }}>
                              <td style={{ padding: 10 }}>{student.admission_no}</td><td style={{ padding: 10 }}>{student.first_name} {student.last_name || ""}</td><td style={{ padding: 10 }}>{student.date_of_birth || "—"}</td><td style={{ padding: 10, textTransform: "capitalize" }}>{student.status}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </>
        )}
        <p className="muted" style={{ marginTop: 28 }}>EduSync prototype · Data access is enforced by the backend and Supabase row-level security.</p>
      </div>
    </main>
  );
}
