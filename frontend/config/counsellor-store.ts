/*
 * ============================================================================
 * EduSync — Shared In-Memory Counsellor & Student Voice State Store
 * ============================================================================
 *
 * SECURITY & PRIVACY RULE:
 * - Stored strictly in-memory for the active client session using
 *   useSyncExternalStore.
 * - Private case notes, sensitive Student Voice conversations, and revealed
 *   identities are NEVER saved to localStorage or sessionStorage.
 * - Future API integration will replace these in-memory mutations with service
 *   calls to http://127.0.0.1:8000/api/v1/... endpoints.
 * ============================================================================
 */

"use client";

import { useSyncExternalStore } from "react";
import {
  CURRENT_COUNSELLOR_ACTOR,
  CURRENT_STUDENT_VOICE_OWNER,
  CURRENT_TEACHER_ACTOR,
  INITIAL_CASES,
  INITIAL_MEETING_REQUESTS,
  INITIAL_NOTICES,
  INITIAL_PRIVATE_NOTES,
  INITIAL_REFERRALS,
  INITIAL_SESSIONS,
  INITIAL_SV_CONVERSATIONS,
  INITIAL_SV_LINK_RECORDS,
  INITIAL_SV_MESSAGES,
  MOCK_PROTECTED_IDENTITY_MAP,
  type CaseStatus,
  type ConversationStatus,
  type CounsellingCaseRecord,
  type CounsellingNoticeRecord,
  type CounsellingSessionRecord,
  type MeetingRequestRecord,
  type MeetingRequestStatus,
  type NoticeAudience,
  type NoticeCategory,
  type NoticeStatus,
  type PrivateCaseNoteRecord,
  type PrivateNoteType,
  type ReferralCategory,
  type ReferralPriority,
  type ReferralStatus,
  type RevealedStudentIdentity,
  type SessionMode,
  type SessionStatus,
  type SessionType,
  type StudentReferralRecord,
  type StudentVoiceCategory,
  type StudentVoiceConversation,
  type StudentVoiceLinkRecord,
  type StudentVoiceMessage,
} from "@/config/counsellor-data";

export interface CounsellorModuleState {
  referrals: StudentReferralRecord[];
  cases: CounsellingCaseRecord[];
  privateNotes: PrivateCaseNoteRecord[];
  sessions: CounsellingSessionRecord[];
  notices: CounsellingNoticeRecord[];
  conversations: StudentVoiceConversation[];
  messages: StudentVoiceMessage[];
  meetingRequests: MeetingRequestRecord[];
  studentLinks: StudentVoiceLinkRecord[];
  readNoticeIds: string[];
}

function createInitialState(): CounsellorModuleState {
  return {
    referrals: INITIAL_REFERRALS,
    cases: INITIAL_CASES,
    privateNotes: INITIAL_PRIVATE_NOTES,
    sessions: INITIAL_SESSIONS,
    notices: INITIAL_NOTICES,
    conversations: INITIAL_SV_CONVERSATIONS,
    messages: INITIAL_SV_MESSAGES,
    meetingRequests: INITIAL_MEETING_REQUESTS,
    studentLinks: INITIAL_SV_LINK_RECORDS,
    readNoticeIds: [],
  };
}

type Listener = () => void;

interface StoreSingleton {
  state: CounsellorModuleState;
  listeners: Set<Listener>;
}

const globalWithStore = globalThis as typeof globalThis & {
  __EDUSYNC_COUNSELLOR_MEM_STORE__?: StoreSingleton;
};

const store: StoreSingleton =
  globalWithStore.__EDUSYNC_COUNSELLOR_MEM_STORE__ ??
  (() => {
    const created: StoreSingleton = {
      state: createInitialState(),
      listeners: new Set<Listener>(),
    };
    globalWithStore.__EDUSYNC_COUNSELLOR_MEM_STORE__ = created;
    return created;
  })();

function emitChange() {
  store.listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function getSnapshot(): CounsellorModuleState {
  return store.state;
}

export function useCounsellorStore(): CounsellorModuleState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function formatNowShort(): string {
  const now = new Date();
  return `${now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatIsoToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* -------------------------------------------------------------------------- */
/*  Teacher & Counsellor Referral Actions                                     */
/* -------------------------------------------------------------------------- */

export interface CreateReferralInput {
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  category: ReferralCategory;
  priority: ReferralPriority;
  observedDate: string;
  description: string;
  observations: string;
  actionsTaken?: string;
  additionalContext?: string;
}

export function createTeacherReferral(
  input: CreateReferralInput,
): StudentReferralRecord {
  const nextNum = 106 + store.state.referrals.length;
  const newReferral: StudentReferralRecord = {
    id: `ref-${Date.now()}`,
    referralRef: `REF-2026-${nextNum}`,
    studentId: input.studentId,
    studentCode: input.studentCode,
    studentName: input.studentName,
    className: input.className,
    submittedByTeacherId: CURRENT_TEACHER_ACTOR.id,
    submittedByTeacherName: CURRENT_TEACHER_ACTOR.name,
    category: input.category,
    priority: input.priority,
    observedDate: input.observedDate,
    submittedDate: formatIsoToday(),
    description: input.description.trim(),
    observations: input.observations.trim(),
    actionsTaken: input.actionsTaken?.trim() || undefined,
    additionalContext: input.additionalContext?.trim() || undefined,
    status: "Submitted",
    timeline: [
      {
        id: `tl-${Date.now()}`,
        label: "Referral Submitted",
        timestamp: formatNowShort(),
        actorRole: `Teacher (${CURRENT_TEACHER_ACTOR.name})`,
      },
    ],
  };

  store.state = {
    ...store.state,
    referrals: [newReferral, ...store.state.referrals],
  };
  emitChange();
  return newReferral;
}

export function updateReferralStatusByCounsellor(
  referralId: string,
  nextStatus: ReferralStatus,
  options?: { teacherFeedbackNote?: string; declineReason?: string },
): void {
  const timestamp = formatNowShort();
  const labelMap: Record<ReferralStatus, string> = {
    Submitted: "Returned to Submitted",
    "Under Review": "Marked Under Review",
    Accepted: "Referral Accepted",
    Declined: "Referral Declined",
  };

  store.state = {
    ...store.state,
    referrals: store.state.referrals.map((ref) => {
      if (ref.id !== referralId) return ref;
      return {
        ...ref,
        status: nextStatus,
        teacherFeedbackNote:
          options?.teacherFeedbackNote !== undefined
            ? options.teacherFeedbackNote.trim() || ref.teacherFeedbackNote
            : ref.teacherFeedbackNote,
        declineReason:
          nextStatus === "Declined"
            ? options?.declineReason?.trim() || ref.declineReason
            : ref.declineReason,
        timeline: [
          ...ref.timeline,
          {
            id: `tl-${Date.now()}`,
            label: labelMap[nextStatus],
            timestamp,
            actorRole: `Counsellor (${CURRENT_COUNSELLOR_ACTOR.name})`,
            note:
              options?.teacherFeedbackNote?.trim() ||
              options?.declineReason?.trim() ||
              undefined,
          },
        ],
      };
    }),
  };
  emitChange();
}

export function addReferralNonConfidentialUpdate(
  referralId: string,
  message: string,
): void {
  const clean = message.trim();
  if (!clean) return;
  const timestamp = formatNowShort();

  store.state = {
    ...store.state,
    referrals: store.state.referrals.map((ref) => {
      if (ref.id !== referralId) return ref;
      return {
        ...ref,
        teacherFeedbackNote: clean,
        timeline: [
          ...ref.timeline,
          {
            id: `tl-${Date.now()}`,
            label: "Status Update Added",
            timestamp,
            actorRole: `Counsellor (${CURRENT_COUNSELLOR_ACTOR.name})`,
            note: clean,
          },
        ],
      };
    }),
  };
  emitChange();
}

/* -------------------------------------------------------------------------- */
/*  Confidential Counselling Cases & Private Notes                            */
/* -------------------------------------------------------------------------- */

export function createCaseFromAcceptedReferral(
  referralId: string,
): { ok: boolean; caseRecord?: CounsellingCaseRecord; error?: string } {
  const ref = store.state.referrals.find((r) => r.id === referralId);
  if (!ref) {
    return { ok: false, error: "Referral record could not be found." };
  }
  if (ref.status !== "Accepted") {
    return {
      ok: false,
      error: "Only accepted referrals can be converted into a counselling case.",
    };
  }
  if (ref.linkedCaseId) {
    const existing = store.state.cases.find((c) => c.id === ref.linkedCaseId);
    if (existing) return { ok: true, caseRecord: existing };
  }

  const nextNum = 303 + store.state.cases.length;
  const today = formatIsoToday();
  const timestamp = formatNowShort();

  const newCase: CounsellingCaseRecord = {
    id: `case-${Date.now()}`,
    caseRef: `CASE-2026-${nextNum}`,
    studentId: ref.studentId,
    studentCode: ref.studentCode,
    studentName: ref.studentName,
    className: ref.className,
    sourceReferralId: ref.id,
    sourceReferralRef: ref.referralRef,
    assignedCounsellor: CURRENT_COUNSELLOR_ACTOR.name,
    status: "Open",
    createdDate: today,
    updatedDate: today,
    focusArea: ref.category,
    timeline: [
      {
        id: `ctl-${Date.now()}-1`,
        title: "Source referral accepted",
        timestamp,
        detail: `Referral ${ref.referralRef} accepted from ${ref.submittedByTeacherName}.`,
      },
      {
        id: `ctl-${Date.now()}-2`,
        title: "Counselling case opened",
        timestamp,
        detail: `Assigned to ${CURRENT_COUNSELLOR_ACTOR.name}.`,
      },
    ],
  };

  store.state = {
    ...store.state,
    cases: [newCase, ...store.state.cases],
    referrals: store.state.referrals.map((r) =>
      r.id === referralId ? { ...r, linkedCaseId: newCase.id } : r,
    ),
  };
  emitChange();
  return { ok: true, caseRecord: newCase };
}

export function updateCounsellingCaseStatus(
  caseId: string,
  nextStatus: CaseStatus,
): void {
  const today = formatIsoToday();
  const timestamp = formatNowShort();

  store.state = {
    ...store.state,
    cases: store.state.cases.map((c) => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        status: nextStatus,
        updatedDate: today,
        timeline: [
          ...c.timeline,
          {
            id: `ctl-${Date.now()}`,
            title: `Case status changed to ${nextStatus}`,
            timestamp,
            detail: `Updated by ${CURRENT_COUNSELLOR_ACTOR.name}.`,
          },
        ],
      };
    }),
  };
  emitChange();
}

export function addPrivateCaseNote(
  caseId: string,
  content: string,
  noteType: PrivateNoteType,
): void {
  const trimmed = content.trim();
  if (!trimmed) return;
  const timestamp = formatNowShort();
  const today = formatIsoToday();

  const newNote: PrivateCaseNoteRecord = {
    id: `note-${Date.now()}`,
    caseId,
    authorName: CURRENT_COUNSELLOR_ACTOR.name,
    createdAt: timestamp,
    noteType,
    content: trimmed,
  };

  store.state = {
    ...store.state,
    privateNotes: [newNote, ...store.state.privateNotes],
    cases: store.state.cases.map((c) => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        updatedDate: today,
        timeline: [
          ...c.timeline,
          {
            id: `ctl-${Date.now()}`,
            title: "Private note added",
            timestamp,
            detail: `${noteType} logged by ${CURRENT_COUNSELLOR_ACTOR.name} (restricted content hidden).`,
          },
        ],
      };
    }),
  };
  emitChange();
}

/* -------------------------------------------------------------------------- */
/*  Counselling Sessions                                                      */
/* -------------------------------------------------------------------------- */

export interface CreateSessionInput {
  caseId?: string;
  caseRef?: string;
  studentName: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  mode: SessionMode;
  locationOrLink: string;
  assignedCounsellor: string;
  schedulingNotes?: string;
}

export function createCounsellingSession(
  input: CreateSessionInput,
): CounsellingSessionRecord {
  const nextNum = 405 + store.state.sessions.length;
  const timestamp = formatNowShort();
  const newSession: CounsellingSessionRecord = {
    id: `ses-${Date.now()}`,
    sessionRef: `SES-2026-${nextNum}`,
    caseId: input.caseId,
    caseRef: input.caseRef,
    studentName: input.studentName,
    className: input.className,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    sessionType: input.sessionType,
    mode: input.mode,
    locationOrLink: input.locationOrLink.trim(),
    assignedCounsellor: input.assignedCounsellor,
    status: "Scheduled",
    schedulingNotes: input.schedulingNotes?.trim() || undefined,
  };

  const updatedCases = input.caseId
    ? store.state.cases.map((c) =>
        c.id === input.caseId
          ? {
              ...c,
              updatedDate: formatIsoToday(),
              timeline: [
                ...c.timeline,
                {
                  id: `ctl-${Date.now()}`,
                  title: `Session scheduled (${newSession.sessionRef})`,
                  timestamp,
                  detail: `${input.sessionType} · ${input.date} (${input.startTime}–${input.endTime}) · ${input.mode}`,
                },
              ],
            }
          : c,
      )
    : store.state.cases;

  store.state = {
    ...store.state,
    sessions: [newSession, ...store.state.sessions],
    cases: updatedCases,
  };
  emitChange();
  return newSession;
}

export function updateCounsellingSessionStatus(
  sessionId: string,
  nextStatus: SessionStatus,
): void {
  const target = store.state.sessions.find((s) => s.id === sessionId);
  if (!target) return;
  const timestamp = formatNowShort();

  const updatedCases = target.caseId
    ? store.state.cases.map((c) =>
        c.id === target.caseId
          ? {
              ...c,
              updatedDate: formatIsoToday(),
              timeline: [
                ...c.timeline,
                {
                  id: `ctl-${Date.now()}`,
                  title: `Session ${target.sessionRef} marked ${nextStatus}`,
                  timestamp,
                  detail: `${target.sessionType} (${target.date}) updated by ${CURRENT_COUNSELLOR_ACTOR.name}.`,
                },
              ],
            }
          : c,
      )
    : store.state.cases;

  store.state = {
    ...store.state,
    sessions: store.state.sessions.map((s) =>
      s.id === sessionId ? { ...s, status: nextStatus } : s,
    ),
    cases: updatedCases,
  };
  emitChange();
}

/* -------------------------------------------------------------------------- */
/*  Counselling Notices                                                       */
/* -------------------------------------------------------------------------- */

export interface SaveNoticeInput {
  id?: string;
  title: string;
  category: NoticeCategory;
  audience: NoticeAudience;
  summary: string;
  content: string;
  publishedDate: string;
  expiryDate?: string;
  status: NoticeStatus;
}

export function saveCounsellingNotice(
  input: SaveNoticeInput,
): CounsellingNoticeRecord {
  if (input.id) {
    let updatedRecord: CounsellingNoticeRecord | undefined;
    store.state = {
      ...store.state,
      notices: store.state.notices.map((n) => {
        if (n.id !== input.id) return n;
        updatedRecord = {
          ...n,
          title: input.title.trim(),
          category: input.category,
          audience: input.audience,
          summary: input.summary.trim(),
          content: input.content.trim(),
          publishedDate: input.publishedDate,
          expiryDate: input.expiryDate?.trim() || undefined,
          status: input.status,
        };
        return updatedRecord;
      }),
    };
    emitChange();
    return updatedRecord!;
  }

  const created: CounsellingNoticeRecord = {
    id: `cnot-${Date.now()}`,
    title: input.title.trim(),
    category: input.category,
    audience: input.audience,
    summary: input.summary.trim(),
    content: input.content.trim(),
    publishedDate: input.publishedDate || formatIsoToday(),
    expiryDate: input.expiryDate?.trim() || undefined,
    status: input.status,
    createdBy: CURRENT_COUNSELLOR_ACTOR.name,
  };

  store.state = {
    ...store.state,
    notices: [created, ...store.state.notices],
  };
  emitChange();
  return created;
}

export function markStudentNoticeRead(noticeId: string): void {
  if (store.state.readNoticeIds.includes(noticeId)) return;
  store.state = {
    ...store.state,
    readNoticeIds: [...store.state.readNoticeIds, noticeId],
  };
  emitChange();
}

/* -------------------------------------------------------------------------- */
/*  Student Voice — Pseudonymous Chat & Controlled Meeting Requests           */
/* -------------------------------------------------------------------------- */

export interface CreateConversationInput {
  subject?: string;
  category: StudentVoiceCategory;
  initialMessage: string;
}

export function createStudentVoiceConversation(
  input: CreateConversationInput,
): StudentVoiceConversation {
  const nextConvNum = 1045 + store.state.conversations.length;
  const pseudoNum = 2120 + store.state.conversations.length * 7;
  const studentRef = `SV-${pseudoNum}`;
  const nowLabel = formatNowShort();
  const convId = `sv-conv-${Date.now()}`;
  const cleanBody = input.initialMessage.trim();

  const newConv: StudentVoiceConversation = {
    id: convId,
    conversationRef: `CONV-${nextConvNum}`,
    studentPseudonymRef: studentRef,
    ownerAccountKey: CURRENT_STUDENT_VOICE_OWNER.ownerAccountKey,
    subject: input.subject?.trim() || `${input.category} Check-in`,
    category: input.category,
    status: "Open",
    createdAt: nowLabel,
    lastMessageAt: nowLabel,
    lastMessagePreview:
      cleanBody.length > 90 ? `${cleanBody.slice(0, 90)}...` : cleanBody,
    unreadByCounsellor: 1,
    unreadByStudent: 0,
  };

  const firstMsg: StudentVoiceMessage = {
    id: `svm-${Date.now()}`,
    conversationId: convId,
    senderRole: "student",
    senderLabel: studentRef,
    body: cleanBody,
    timestamp: nowLabel,
  };

  store.state = {
    ...store.state,
    conversations: [newConv, ...store.state.conversations],
    messages: [...store.state.messages, firstMsg],
  };
  emitChange();
  return newConv;
}

export function sendStudentVoiceMessage(
  conversationId: string,
  senderRole: "student" | "counsellor",
  body: string,
): void {
  const trimmed = body.trim();
  if (!trimmed) return;
  const conv = store.state.conversations.find((c) => c.id === conversationId);
  if (!conv) return;

  const timestamp = formatNowShort();
  const msg: StudentVoiceMessage = {
    id: `svm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    conversationId,
    senderRole,
    senderLabel:
      senderRole === "student" ? conv.studentPseudonymRef : "School Counsellor",
    body: trimmed,
    timestamp,
  };

  store.state = {
    ...store.state,
    messages: [...store.state.messages, msg],
    conversations: store.state.conversations.map((c) => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        status: senderRole === "counsellor" ? "Awaiting Reply" : "Open",
        lastMessageAt: timestamp,
        lastMessagePreview:
          trimmed.length > 90 ? `${trimmed.slice(0, 90)}...` : trimmed,
        unreadByCounsellor:
          senderRole === "student" ? c.unreadByCounsellor + 1 : 0,
        unreadByStudent:
          senderRole === "counsellor" ? c.unreadByStudent + 1 : 0,
      };
    }),
  };
  emitChange();
}

export function markStudentVoiceConversationRead(
  conversationId: string,
  viewerRole: "student" | "counsellor",
): void {
  store.state = {
    ...store.state,
    conversations: store.state.conversations.map((c) => {
      if (c.id !== conversationId) return c;
      if (viewerRole === "student" && c.unreadByStudent === 0) return c;
      if (viewerRole === "counsellor" && c.unreadByCounsellor === 0) return c;
      return {
        ...c,
        unreadByStudent: viewerRole === "student" ? 0 : c.unreadByStudent,
        unreadByCounsellor:
          viewerRole === "counsellor" ? 0 : c.unreadByCounsellor,
      };
    }),
  };
  emitChange();
}

export function updateStudentVoiceConversationStatus(
  conversationId: string,
  status: ConversationStatus,
): void {
  store.state = {
    ...store.state,
    conversations: store.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, status } : c,
    ),
  };
  emitChange();
}

export interface CreateMeetingRequestInput {
  conversationId: string;
  preferredAvailability: string;
  studentMessage?: string;
}

export function createMeetingRequest(
  input: CreateMeetingRequestInput,
): { ok: boolean; request?: MeetingRequestRecord; error?: string } {
  const conv = store.state.conversations.find(
    (c) => c.id === input.conversationId,
  );
  if (!conv) {
    return { ok: false, error: "Selected conversation not found." };
  }
  const nextNum = 103 + store.state.meetingRequests.length;
  const created: MeetingRequestRecord = {
    id: `mreq-${Date.now()}`,
    requestRef: `MR-2026-${nextNum}`,
    conversationId: conv.id,
    conversationRef: conv.conversationRef,
    studentPseudonymRef: conv.studentPseudonymRef,
    ownerAccountKey: conv.ownerAccountKey,
    preferredAvailability: input.preferredAvailability.trim(),
    studentMessage: input.studentMessage?.trim() || undefined,
    submittedDate: formatIsoToday(),
    status: "Pending",
  };

  store.state = {
    ...store.state,
    meetingRequests: [created, ...store.state.meetingRequests],
  };
  emitChange();
  return { ok: true, request: created };
}

export function reviewMeetingRequestByCounsellor(
  requestId: string,
  decision: Extract<MeetingRequestStatus, "Approved" | "Declined">,
  details: {
    counsellorResponse?: string;
    confirmedSlot?: string;
    confirmedLocation?: string;
  },
): void {
  store.state = {
    ...store.state,
    meetingRequests: store.state.meetingRequests.map((req) => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: decision,
        counsellorResponse: details.counsellorResponse?.trim() || undefined,
        confirmedSlot:
          decision === "Approved"
            ? details.confirmedSlot?.trim() || req.preferredAvailability
            : undefined,
        confirmedLocation:
          decision === "Approved"
            ? details.confirmedLocation?.trim() || "Counselling Room A (Block 2)"
            : undefined,
      };
    }),
  };
  emitChange();
}

export function cancelMeetingRequestByStudent(requestId: string): void {
  store.state = {
    ...store.state,
    meetingRequests: store.state.meetingRequests.map((req) =>
      req.id === requestId && req.status === "Pending"
        ? { ...req, status: "Cancelled" }
        : req,
    ),
  };
  emitChange();
}

/**
 * Controlled Identity Reveal Guard (Mock Representation of Backend Policy):
 * GET /schools/{school_id}/student-voice/meeting-requests/{request_id}/student-identity
 * Strictly refuses to return identity unless the meeting request status === "Approved".
 */
export function resolveAuthorizedIdentityForMeetingRequest(
  requestId: string,
): { ok: boolean; identity?: RevealedStudentIdentity; error?: string } {
  const req = store.state.meetingRequests.find((r) => r.id === requestId);
  if (!req) {
    return { ok: false, error: "Meeting request not found." };
  }
  if (req.status !== "Approved") {
    return {
      ok: false,
      error:
        "Identity reveal is strictly restricted to approved meeting requests.",
    };
  }

  const direct = MOCK_PROTECTED_IDENTITY_MAP[req.conversationId];
  if (direct) {
    return { ok: true, identity: direct };
  }

  // Fallback mock identity for newly created preview conversations after approval
  return {
    ok: true,
    identity: {
      studentId: "stu-1024",
      studentCode: "STU-1024",
      fullName: "Aarav Naik",
      className: "Class 8-A",
      linkedAccountRef: `Linked (${req.studentPseudonymRef})`,
      guardianName: "Rajesh Naik",
      guardianContact: "+91 98230 11223",
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Admin Student Voice Linking                                               */
/* -------------------------------------------------------------------------- */

export function linkStudentVoiceAccount(
  linkRecordId: string,
  accountId: string,
  accountLabel: string,
): { ok: boolean; error?: string } {
  const target = store.state.studentLinks.find((l) => l.id === linkRecordId);
  if (!target) {
    return { ok: false, error: "Student record not found." };
  }
  if (target.status === "Linked") {
    return {
      ok: false,
      error: "This student record is already linked to an authenticated account.",
    };
  }
  const accountInUse = store.state.studentLinks.find(
    (l) => l.linkedAccountId === accountId,
  );
  if (accountInUse) {
    return {
      ok: false,
      error: `Account ${accountLabel} is already linked to ${accountInUse.studentName}. Duplicate links are blocked.`,
    };
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  store.state = {
    ...store.state,
    studentLinks: store.state.studentLinks.map((l) =>
      l.id === linkRecordId
        ? {
            ...l,
            status: "Linked",
            linkedAccountId: accountId,
            linkedAccountRef: accountLabel,
            lastUpdated: todayLabel,
          }
        : l,
    ),
  };
  emitChange();
  return { ok: true };
}

