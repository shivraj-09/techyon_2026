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
type FeePayment = { id: string; amount: string | number; payment_method: string; reference_number: string | null; status: string; paid_at: string; };
type AttendanceStatus = "present" | "absent" | "late" | "excused";
type AttendanceRecord = {
  id: string;
  student_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  remarks: string | null;
};
type RosterStudent = {
  id: string;
  admission_no: string;
  first_name: string;
  last_name: string | null;
  roll_number: number | null;
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
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [invoiceStudentId, setInvoiceStudentId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [feeSaving, setFeeSaving] = useState(false);
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, { amount: string; method: "cash" | "upi" | "bank_transfer" | "card" | "other"; reference: string }>>({});
  const [paymentSavingId, setPaymentSavingId] = useState("");
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});
  const [paymentHistory, setPaymentHistory] = useState<Record<string, FeePayment[]>>({});
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState<Record<string, boolean>>({});
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceRoster, setAttendanceRoster] = useState<RosterStudent[]>([]);
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);
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
  const [enrollingStudentId, setEnrollingStudentId] = useState("");
  const [enrollmentClassByStudent, setEnrollmentClassByStudent] = useState<Record<string, string>>({});

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
      const records = result.records || [];
      setAttendanceRecords(records);
      if (activeMembership?.role === "admin" || activeMembership?.role === "teacher") {
        const rosterResult = await apiRequest<{ students: RosterStudent[] }>(
          `/api/v1/schools/${schoolId}/classes/${selectedClassId}/roster`,
          token,
        );
        setAttendanceRoster(rosterResult.students || []);
        setAttendanceDraft(
          Object.fromEntries(
            (rosterResult.students || []).map((student) => [
              student.id,
              records.find((record) => record.student_id === student.id)?.status || "present",
            ]),
          ) as Record<string, AttendanceStatus>,
        );
      } else {
        setAttendanceRoster([]);
        setAttendanceDraft({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load attendance.");
      setAttendanceRecords([]);
      setAttendanceRoster([]);
    }
  }, [activeMembership?.role, attendanceDate, schoolId, selectedClassId, token]);

  useEffect(() => {
    if (activeTab === "attendance") void loadAttendance();
  }, [activeTab, loadAttendance]);

  async function saveAttendance() {
    if (!schoolId || !token || !selectedClassId || attendanceRoster.length === 0) return;
    setAttendanceSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(
        `/api/v1/schools/${schoolId}/classes/${selectedClassId}/attendance`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            attendance_date: attendanceDate,
            records: attendanceRoster.map((student) => ({
              student_id: student.id,
              status: attendanceDraft[student.id] || "present",
            })),
          }),
        },
      );
      setNotice("Attendance saved successfully.");
      await loadAttendance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save attendance.");
    } finally {
      setAttendanceSaving(false);
    }
  }


  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolId || !token || !isAdmin) return;
    setFeeSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/v1/schools/${schoolId}/fees/invoices`, token, {
        method: "POST",
        body: JSON.stringify({
          student_id: invoiceStudentId,
          invoice_number: invoiceNumber.trim(),
          description: invoiceDescription.trim(),
          amount_due: invoiceAmount,
          due_date: invoiceDueDate,
        }),
      });
      setInvoiceStudentId("");
      setInvoiceNumber("");
      setInvoiceDescription("");
      setInvoiceAmount("");
      setInvoiceDueDate("");
      setInvoiceFormOpen(false);
      setNotice("Fee invoice created successfully.");
      await loadSchoolData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create fee invoice.");
    } finally {
      setFeeSaving(false);
    }
  }

  async function recordFeePayment(event: FormEvent<HTMLFormElement>, invoiceId: string) {
    event.preventDefault();
    if (!schoolId || !token || !isAdmin) return;
    const draft = paymentDrafts[invoiceId];
    if (!draft?.amount) return;
    setPaymentSavingId(invoiceId);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/v1/schools/${schoolId}/fees/invoices/${invoiceId}/payments`, token, {
        method: "POST",
        body: JSON.stringify({
          amount: draft.amount,
          payment_method: draft.method,
          reference_number: draft.reference.trim() || null,
        }),
      });
      setPaymentDrafts((previous) => ({ ...previous, [invoiceId]: { amount: "", method: "upi", reference: "" } }));
      setNotice("Payment recorded successfully.");
      const history = await apiRequest<{ payments: FeePayment[] }>(
        `/api/v1/schools/${schoolId}/fees/invoices/${invoiceId}/payments`, token,
      );
      setPaymentHistory((previous) => ({ ...previous, [invoiceId]: history.payments || [] }));
      setExpandedPayments((previous) => ({ ...previous, [invoiceId]: true }));
      await loadSchoolData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record payment.");
    } finally {
      setPaymentSavingId("");
    }
  }

  async function togglePaymentHistory(invoiceId: string) {
    const nextOpen = !expandedPayments[invoiceId];
    setExpandedPayments((previous) => ({ ...previous, [invoiceId]: nextOpen }));
    if (!nextOpen || paymentHistory[invoiceId]) return;
    setPaymentHistoryLoading((previous) => ({ ...previous, [invoiceId]: true }));
    try {
      const result = await apiRequest<{ payments: FeePayment[] }>(
        `/api/v1/schools/${schoolId}/fees/invoices/${invoiceId}/payments`, token,
      );
      setPaymentHistory((previous) => ({ ...previous, [invoiceId]: result.payments || [] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load payment history.");
      setExpandedPayments((previous) => ({ ...previous, [invoiceId]: false }));
    } finally {
      setPaymentHistoryLoading((previous) => ({ ...previous, [invoiceId]: false }));
    }
  }

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

  async function enrollStudent(studentId: string) {
    const classId = enrollmentClassByStudent[studentId] || classes[0]?.id;
    const selectedClass = classes.find((item) => item.id === classId);
    if (!schoolId || !token || !selectedClass) {
      setError("Create a class before enrolling students.");
      return;
    }
    setEnrollingStudentId(studentId);
    setError("");
    setNotice("");
    try {
      await apiRequest(
        `/api/v1/schools/${schoolId}/students/${studentId}/enrollments`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            class_id: selectedClass.id,
            academic_year: selectedClass.academic_year,
          }),
        },
      );
      setNotice("Student enrolled successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enroll student.");
    } finally {
      setEnrollingStudentId("");
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
                    <p className="muted">Review or record attendance for an enrolled class roster.</p>
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
                    {(activeMembership?.role === "admin" || activeMembership?.role === "teacher") && attendanceRoster.length > 0 && (
                      <>
                        <p className="muted">{attendanceRecords.length > 0 ? "Attendance has already been submitted for this date. Existing records are shown below." : "Set each student's status, then submit the class attendance."}</p>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead><tr><th style={{ padding: 10 }}>Roll no.</th><th style={{ padding: 10 }}>Student</th><th style={{ padding: 10 }}>Admission no.</th><th style={{ padding: 10 }}>Status</th></tr></thead>
                            <tbody>{attendanceRoster.map((student) => {
                              const existing = attendanceRecords.find((record) => record.student_id === student.id);
                              return <tr key={student.id} style={{ borderTop: "1px solid #e2eaed" }}>
                                <td style={{ padding: 10 }}>{student.roll_number ?? "—"}</td>
                                <td style={{ padding: 10 }}>{student.first_name} {student.last_name || ""}</td>
                                <td style={{ padding: 10 }}>{student.admission_no}</td>
                                <td style={{ padding: 10 }}>
                                  {existing ? <span style={{ textTransform: "capitalize" }}>{existing.status}</span> : (
                                    <select
                                      aria-label={`Attendance status for ${student.first_name}`}
                                      value={attendanceDraft[student.id] || "present"}
                                      onChange={(event) => setAttendanceDraft((previous) => ({ ...previous, [student.id]: event.target.value as AttendanceStatus }))}
                                    >
                                      <option value="present">Present</option>
                                      <option value="absent">Absent</option>
                                      <option value="late">Late</option>
                                      <option value="excused">Excused</option>
                                    </select>
                                  )}
                                </td>
                              </tr>;
                            })}</tbody>
                          </table>
                        </div>
                        {attendanceRecords.length === 0 && (
                          <button className="btn" onClick={() => void saveAttendance()} disabled={attendanceSaving}>
                            {attendanceSaving ? "Saving…" : "Submit attendance"}
                          </button>
                        )}
                      </>
                    )}
                    {attendanceRecords.length > 0 && (
                      <p className="muted">Submitted records: {attendanceRecords.length}</p>
                    )}
                    {attendanceRoster.length === 0 && attendanceRecords.length === 0 && (
                      <p className="muted">No active students are enrolled in this class, or no roster is available for your role.</p>
                    )}
                    {activeMembership?.role === "parent" && attendanceRecords.length === 0 && (
                      <p className="muted">No attendance records found for this class and date.</p>
                    )}
                  </section>
                )}

                {activeTab === "fees" && (
                  <section className="card">
                    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                      <div><h2>Fee management</h2><p className="muted">Create invoices, record collections and review payment history.</p></div>
                      {isAdmin && <button className="btn" onClick={() => setInvoiceFormOpen((open) => !open)}>{invoiceFormOpen ? "Close" : "＋ Create invoice"}</button>}
                    </div>
                    {invoiceFormOpen && isAdmin && (
                      <form onSubmit={createInvoice} className="field" style={{ margin: "16px 0" }}>
                        <label>Student
                          <select required value={invoiceStudentId} onChange={(e) => setInvoiceStudentId(e.target.value)}>
                            <option value="">Select a student</option>
                            {students.map((student) => <option key={student.id} value={student.id}>{student.first_name} {student.last_name || ""} · {student.admission_no}</option>)}
                          </select>
                        </label>
                        <label>Invoice number<input required maxLength={50} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="e.g. RHS-2026-002" /></label>
                        <label>Description<input required maxLength={300} value={invoiceDescription} onChange={(e) => setInvoiceDescription(e.target.value)} placeholder="e.g. Term 2 tuition fee" /></label>
                        <label>Amount due (₹)<input required type="number" min="0.01" step="0.01" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} /></label>
                        <label>Due date<input required type="date" value={invoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)} /></label>
                        <button className="btn" disabled={feeSaving || students.length === 0}>{feeSaving ? "Creating…" : "Create invoice"}</button>
                      </form>
                    )}
                    <div className="grid">
                      <article className="stat"><span className="muted">Invoices</span><h2>{feeBalances.length}</h2></article>
                      <article className="stat"><span className="muted">Total invoiced</span><h2>₹{feeBalances.reduce((sum, item) => sum + Number(item.amount_due || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2></article>
                      <article className="stat"><span className="muted">Outstanding</span><h2>₹{feeBalances.reduce((sum, item) => sum + Number(item.outstanding_amount || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2></article>
                    </div>
                    {feeBalances.length === 0 ? <p className="muted">No fee balances are available for this account.</p> : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead><tr><th style={{ padding: 10 }}>Invoice</th><th style={{ padding: 10 }}>Due date</th><th style={{ padding: 10 }}>Amount due</th><th style={{ padding: 10 }}>Paid</th><th style={{ padding: 10 }}>Outstanding</th><th style={{ padding: 10 }}>Status</th>{isAdmin && <th style={{ padding: 10 }}>Actions</th>}</tr></thead>
                          <tbody>{feeBalances.map((item) => {
                            const payable = Number(item.outstanding_amount) > 0 && !["draft", "cancelled"].includes(item.status);
                            const draft = paymentDrafts[item.invoice_id] || { amount: "", method: "upi" as const, reference: "" };
                            return <tr key={item.invoice_id} style={{ borderTop: "1px solid #e2eaed" }}>
                              <td style={{ padding: 10 }}>{item.invoice_number}</td><td style={{ padding: 10 }}>{item.due_date}</td><td style={{ padding: 10 }}>₹{Number(item.amount_due).toLocaleString("en-IN")}</td><td style={{ padding: 10 }}>₹{Number(item.amount_paid).toLocaleString("en-IN")}</td><td style={{ padding: 10 }}>₹{Number(item.outstanding_amount).toLocaleString("en-IN")}</td><td style={{ padding: 10, textTransform: "capitalize" }}>{item.status.replaceAll("_", " ")}</td>
                              {isAdmin && <td style={{ padding: 10, minWidth: 260 }}>
                                {payable ? <form onSubmit={(event) => void recordFeePayment(event, item.invoice_id)} className="field">
                                  <label>Payment amount (₹)<input required type="number" min="0.01" max={Number(item.outstanding_amount)} step="0.01" value={draft.amount} onChange={(e) => setPaymentDrafts((previous) => ({ ...previous, [item.invoice_id]: { ...draft, amount: e.target.value } }))} /></label>
                                  <label>Method<select value={draft.method} onChange={(e) => setPaymentDrafts((previous) => ({ ...previous, [item.invoice_id]: { ...draft, method: e.target.value as typeof draft.method } }))}><option value="upi">UPI</option><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="card">Card</option><option value="other">Other</option></select></label>
                                  <label>Reference (optional)<input maxLength={100} value={draft.reference} onChange={(e) => setPaymentDrafts((previous) => ({ ...previous, [item.invoice_id]: { ...draft, reference: e.target.value } }))} /></label>
                                  <button className="btn secondary" disabled={paymentSavingId === item.invoice_id}>{paymentSavingId === item.invoice_id ? "Recording…" : "Record payment"}</button>
                                </form> : <span className="muted">No payment due</span>}
                                <button type="button" className="btn secondary" style={{ marginTop: 8 }} onClick={() => void togglePaymentHistory(item.invoice_id)}>{expandedPayments[item.invoice_id] ? "Hide history" : "Payment history"}</button>
                                {expandedPayments[item.invoice_id] && <div style={{ marginTop: 8 }}>
                                  {paymentHistoryLoading[item.invoice_id] ? <span className="muted">Loading history…</span> : (paymentHistory[item.invoice_id] || []).length === 0 ? <span className="muted">No payments recorded.</span> : (paymentHistory[item.invoice_id] || []).map((payment) => <p key={payment.id} className="muted" style={{ margin: "6px 0" }}>₹{Number(payment.amount).toLocaleString("en-IN")} · {payment.payment_method.replaceAll("_", " ")} · {new Date(payment.paid_at).toLocaleDateString("en-IN")}{payment.reference_number ? ` · ${payment.reference_number}` : ""}</p>)}
                                </div>}
                              </td>}
                            </tr>;
                          })}</tbody>
                        </table>
                      </div>
                    )}
                    {!isAdmin && <p className="muted">You can view fee balances and payment records. Invoice creation and payment recording are restricted to school administrators.</p>}
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
                          <thead><tr><th style={{ padding: 10 }}>Admission no.</th><th style={{ padding: 10 }}>Student</th><th style={{ padding: 10 }}>Date of birth</th><th style={{ padding: 10 }}>Status</th>{isAdmin && <th style={{ padding: 10 }}>Enroll in class</th>}</tr></thead>
                          <tbody>{students.map((student) => (
                            <tr key={student.id} style={{ borderTop: "1px solid #e2eaed" }}>
                              <td style={{ padding: 10 }}>{student.admission_no}</td><td style={{ padding: 10 }}>{student.first_name} {student.last_name || ""}</td><td style={{ padding: 10 }}>{student.date_of_birth || "—"}</td><td style={{ padding: 10, textTransform: "capitalize" }}>{student.status}</td>
                              {isAdmin && <td style={{ padding: 10 }}>
                                <div className="row" style={{ gap: 6 }}>
                                  <select
                                    aria-label={`Class for ${student.first_name}`}
                                    value={enrollmentClassByStudent[student.id] || classes[0]?.id || ""}
                                    onChange={(event) => setEnrollmentClassByStudent((previous) => ({ ...previous, [student.id]: event.target.value }))}
                                    disabled={classes.length === 0}
                                  >
                                    {classes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.academic_year}</option>)}
                                  </select>
                                  <button className="btn secondary" onClick={() => void enrollStudent(student.id)} disabled={enrollingStudentId === student.id || classes.length === 0}>
                                    {enrollingStudentId === student.id ? "Enrolling…" : "Enroll"}
                                  </button>
                                </div>
                              </td>}
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
