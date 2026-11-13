"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Icon,
  Input,
  Select,
  Toast,
} from "@/components/ui";
import {
  MOCK_STUDENTS_FOR_REFERRAL,
  REFERRAL_CATEGORIES,
  REFERRAL_PRIORITIES,
  type ReferralCategory,
  type ReferralPriority,
} from "@/config/counsellor-data";
import { createTeacherReferral } from "@/config/counsellor-store";

export default function NewTeacherReferralPage() {
  const router = useRouter();

  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(
    MOCK_STUDENTS_FOR_REFERRAL[0].id,
  );
  const [category, setCategory] = useState<ReferralCategory>(
    "Academic Difficulty",
  );
  const [priority, setPriority] = useState<ReferralPriority>("Medium");
  const [observedDate, setObservedDate] = useState("2026-11-14");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const matchingStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return MOCK_STUDENTS_FOR_REFERRAL;
    return MOCK_STUDENTS_FOR_REFERRAL.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q),
    );
  }, [studentQuery]);

  const selectedStudent = useMemo(
    () =>
      MOCK_STUDENTS_FOR_REFERRAL.find((s) => s.id === selectedStudentId) ??
      matchingStudents[0] ??
      MOCK_STUDENTS_FOR_REFERRAL[0],
    [selectedStudentId, matchingStudents],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Please select a student from your school roster.");
      return;
    }
    if (!observedDate) {
      setError("Please specify the date the pattern or concern was observed.");
      return;
    }
    if (description.trim().length < 8) {
      setError("Please provide a brief summary (at least 8 characters).");
      return;
    }
    if (observations.trim().length < 20) {
      setError(
        "Please share specific, factual classroom observations (at least 20 characters).",
      );
      return;
    }

    setError("");
    setSubmitting(true);

    setTimeout(() => {
      const created = createTeacherReferral({
        studentId: selectedStudent.id,
        studentCode: selectedStudent.studentCode,
        studentName: selectedStudent.name,
        className: selectedStudent.className,
        category,
        priority,
        observedDate,
        description: description.trim(),
        observations: observations.trim(),
        actionsTaken: actionsTaken.trim() || undefined,
        additionalContext: additionalContext.trim() || undefined,
      });
      setSubmitting(false);
      setToastMsg(
        `Referral ${created.referralRef} submitted to the School Counsellor.`,
      );
      setTimeout(() => {
        router.push(`/teacher/referrals/${created.id}`);
      }, 450);
    }, 220);
  }

  return (
    <AppLayout defaultRole="teacher">
      <div className="es-stack">
        <PageHeader
          title="Refer a Student"
          subtitle="Submit a factual wellbeing or learning-support referral for review by the School Counsellor."
          actions={
            <Link href="/teacher/referrals">
              <Button variant="secondary" leftIcon={<Icon name="arrow-left" size={15} />}>
                Back to My Referrals
              </Button>
            </Link>
          }
        />

        {toastMsg && (
          <Toast
            variant="success"
            title="Referral Submitted"
            description={toastMsg}
            onDismiss={() => setToastMsg(null)}
          />
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          <Card style={{ gridColumn: "span 1" }}>
            <CardHeader>
              <CardTitle>Referral Submission Form</CardTitle>
            </CardHeader>
            <CardBody>
              <form
                onSubmit={handleSubmit}
                className="es-stack"
                style={{ gap: "1rem" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <Input
                    id="ref-student-search"
                    label="Filter Student Roster"
                    leftIcon={<Icon name="search" size={15} />}
                    placeholder="Type student name, class, or ID..."
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                  />
                  <Select
                    id="ref-student-select"
                    label="Select Student"
                    value={selectedStudent?.id ?? ""}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    options={
                      matchingStudents.length > 0
                        ? matchingStudents.map((s) => ({
                            value: s.id,
                            label: `${s.name} — ${s.className} (${s.studentCode})`,
                          }))
                        : [
                            {
                              value: "",
                              label: "No matching students — clear search",
                            },
                          ]
                    }
                  />
                </div>

                {selectedStudent && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--es-radius-md)",
                      backgroundColor: "var(--es-surface-subtle)",
                      border: "1px solid var(--es-border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div>
                      <strong>{selectedStudent.name}</strong> ·{" "}
                      {selectedStudent.className}
                    </div>
                    <Badge variant="neutral">{selectedStudent.studentCode}</Badge>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <Select
                    id="ref-category"
                    label="Concern Category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ReferralCategory)
                    }
                    options={REFERRAL_CATEGORIES.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                  />
                  <Select
                    id="ref-priority"
                    label="Urgency Level"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as ReferralPriority)
                    }
                    options={REFERRAL_PRIORITIES.map((p) => ({
                      value: p,
                      label: p,
                    }))}
                  />
                  <Input
                    id="ref-observed-date"
                    label="Date Observed"
                    type="date"
                    value={observedDate}
                    onChange={(e) => setObservedDate(e.target.value)}
                    required
                  />
                </div>

                <Input
                  id="ref-description"
                  label="Concise Concern Summary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sudden drop in class engagement and missed homework over 2 weeks"
                  required
                />

                <label className="es-field" htmlFor="ref-observations">
                  <span className="es-label">
                    Factual Classroom Observations *
                  </span>
                  <textarea
                    id="ref-observations"
                    className="es-input"
                    rows={4}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Describe specific dates, behaviours, attendance patterns, or academic shifts observed in class without speculative labels..."
                    style={{
                      height: "auto",
                      padding: "0.625rem 0.75rem",
                      resize: "vertical",
                    }}
                    required
                  />
                </label>

                <label className="es-field" htmlFor="ref-actions-taken">
                  <span className="es-label">
                    Classroom Support Already Attempted (Optional)
                  </span>
                  <textarea
                    id="ref-actions-taken"
                    className="es-input"
                    rows={3}
                    value={actionsTaken}
                    onChange={(e) => setActionsTaken(e.target.value)}
                    placeholder="e.g. Adjusted seating, extended assignment timeline, brief check-in after class..."
                    style={{
                      height: "auto",
                      padding: "0.625rem 0.75rem",
                      resize: "vertical",
                    }}
                  />
                </label>

                <label className="es-field" htmlFor="ref-additional-context">
                  <span className="es-label">
                    Additional Context (Optional)
                  </span>
                  <textarea
                    id="ref-additional-context"
                    className="es-input"
                    rows={2}
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Any helpful non-clinical scheduling or peer context..."
                    style={{
                      height: "auto",
                      padding: "0.625rem 0.75rem",
                      resize: "vertical",
                    }}
                  />
                </label>

                {error && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8125rem",
                      color: "var(--es-danger-text)",
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Link href="/teacher/referrals">
                    <Button variant="secondary" disabled={submitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={submitting}
                    leftIcon={<Icon name="send" size={15} />}
                  >
                    {submitting ? "Submitting Referral..." : "Submit Referral"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <div className="es-stack" style={{ gap: "1rem" }}>
            <Card>
              <CardHeader>
                <CardTitle>Observation & Privacy Guidance</CardTitle>
              </CardHeader>
              <CardBody className="es-stack" style={{ gap: "0.75rem" }}>
                <div
                  style={{
                    padding: "0.875rem",
                    borderRadius: "var(--es-radius-md)",
                    backgroundColor: "var(--es-primary-subtle)",
                    fontSize: "0.8125rem",
                    lineHeight: 1.55,
                    color: "var(--es-text-secondary)",
                  }}
                >
                  <strong>Keep observations factual:</strong> Focus on what you
                  directly noticed (participation changes, peer friction,
                  submission gaps, or verbalized fatigue) rather than diagnostic
                  assumptions.
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.125rem",
                    fontSize: "0.8125rem",
                    lineHeight: 1.6,
                    color: "var(--es-text-secondary)",
                  }}
                >
                  <li>
                    Once submitted, the School Counsellor reviews and updates the
                    referral status.
                  </li>
                  <li>
                    You will see status progress and any classroom-safe support
                    recommendations on <strong>My Referrals</strong>.
                  </li>
                  <li>
                    If the Counsellor opens a confidential counselling case,
                    private case notes remain strictly restricted to the
                    Counsellor.
                  </li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
