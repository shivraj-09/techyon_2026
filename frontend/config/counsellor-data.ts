/*
 * ============================================================================
 * EduSync — Counsellor, Student Voice & Wellbeing Mock Data & API Contracts
 * ============================================================================
 *
 * CRITICAL PREVIEW & PRIVACY BOUNDARY:
 * - Frontend-only mock dataset. Do NOT issue live network calls yet.
 * - Future API Base URL: http://127.0.0.1:8000/api/v1 (Bearer JWT + UUID IDs)
 * - Private case notes, sensitive Student Voice messages, and controlled
 *   revealed student identities MUST NEVER be persisted to localStorage or
 *   sessionStorage, and must NEVER be logged to console.
 *
 * Documented Future Backend Endpoints (Not called in Frontend Preview Mode):
 *
 * Teacher Referrals:
 * - POST  /api/v1/schools/{school_id}/counsellor/referrals
 * - GET   /api/v1/schools/{school_id}/counsellor/referrals
 * - PATCH /api/v1/schools/{school_id}/counsellor/referrals/{referral_id}
 *
 * Counselling Cases:
 * - POST  /api/v1/schools/{school_id}/counselling/cases
 * - GET   /api/v1/schools/{school_id}/counselling/cases
 * - PATCH /api/v1/schools/{school_id}/counselling/cases/{case_id}
 * - GET   /api/v1/schools/{school_id}/counselling/cases/{case_id}/notes
 * - POST  /api/v1/schools/{school_id}/counselling/cases/{case_id}/notes
 *
 * Sessions & Notices:
 * - POST  /api/v1/schools/{school_id}/counselling/sessions
 * - GET   /api/v1/schools/{school_id}/counselling/sessions
 * - POST  /api/v1/schools/{school_id}/counselling/notices
 * - GET   /api/v1/schools/{school_id}/counselling/notices
 *
 * Student Voice & Controlled Identity Reveal:
 * - POST  /api/v1/schools/{school_id}/student-voice/links
 * - POST  /api/v1/schools/{school_id}/student-voice/conversations
 * - GET   /api/v1/schools/{school_id}/student-voice/conversations/mine
 * - GET   /api/v1/schools/{school_id}/student-voice/conversations/inbox
 * - GET   /api/v1/schools/{school_id}/student-voice/conversations/{conversation_id}/messages
 * - POST  /api/v1/schools/{school_id}/student-voice/conversations/{conversation_id}/messages
 * - POST  /api/v1/schools/{school_id}/student-voice/conversations/{conversation_id}/meeting-requests
 * - GET   /api/v1/schools/{school_id}/student-voice/meeting-requests
 * - GET   /api/v1/schools/{school_id}/student-voice/meeting-requests/mine
 * - PATCH /api/v1/schools/{school_id}/student-voice/meeting-requests/{request_id}
 * - GET   /api/v1/schools/{school_id}/student-voice/meeting-requests/{request_id}/student-identity
 * ============================================================================
 */

export type ReferralStatus =
  | "Submitted"
  | "Under Review"
  | "Accepted"
  | "Declined";

export type ReferralPriority = "Low" | "Medium" | "High" | "Urgent";

export type ReferralCategory =
  | "Academic Difficulty"
  | "Behavioural Concern"
  | "Social or Peer Difficulties"
  | "Emotional Wellbeing Concern"
  | "Attendance-Related Concern"
  | "Other";

export const REFERRAL_CATEGORIES: ReferralCategory[] = [
  "Academic Difficulty",
  "Behavioural Concern",
  "Social or Peer Difficulties",
  "Emotional Wellbeing Concern",
  "Attendance-Related Concern",
  "Other",
];

export const REFERRAL_PRIORITIES: ReferralPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

export interface ReferralTimelineItem {
  id: string;
  label: string;
  timestamp: string;
  actorRole: string;
  note?: string;
}

export interface StudentReferralRecord {
  id: string;
  referralRef: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  submittedByTeacherId: string;
  submittedByTeacherName: string;
  category: ReferralCategory;
  priority: ReferralPriority;
  observedDate: string;
  submittedDate: string;
  description: string;
  observations: string;
  actionsTaken?: string;
  additionalContext?: string;
  status: ReferralStatus;
  /** Limited non-confidential feedback safe for the referring teacher */
  teacherFeedbackNote?: string;
  declineReason?: string;
  linkedCaseId?: string;
  timeline: ReferralTimelineItem[];
}

export type CaseStatus =
  | "Open"
  | "In Progress"
  | "On Hold"
  | "Resolved"
  | "Closed";

export const CASE_STATUSES: CaseStatus[] = [
  "Open",
  "In Progress",
  "On Hold",
  "Resolved",
  "Closed",
];

export interface CaseTimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  detail: string;
}

export interface CounsellingCaseRecord {
  id: string;
  caseRef: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  sourceReferralId: string;
  sourceReferralRef: string;
  assignedCounsellor: string;
  status: CaseStatus;
  createdDate: string;
  updatedDate: string;
  focusArea: string;
  timeline: CaseTimelineEvent[];
}

export type PrivateNoteType =
  | "Session Observation"
  | "Follow-up Plan"
  | "Parent Consultation"
  | "General Case Note";

export const PRIVATE_NOTE_TYPES: PrivateNoteType[] = [
  "Session Observation",
  "Follow-up Plan",
  "Parent Consultation",
  "General Case Note",
];

/**
 * STRICTLY IN-MEMORY ONLY. Never persist to browser storage or expose outside
 * authorised counsellor case views.
 */
export interface PrivateCaseNoteRecord {
  id: string;
  caseId: string;
  authorName: string;
  createdAt: string;
  noteType: PrivateNoteType;
  content: string;
}

export type SessionType =
  | "Individual Counselling"
  | "Follow-up"
  | "Group Session"
  | "Parent/Guardian Meeting";

export type SessionMode = "In Person" | "Online";
export type SessionStatus = "Scheduled" | "Completed" | "Cancelled";

export const SESSION_TYPES: SessionType[] = [
  "Individual Counselling",
  "Follow-up",
  "Group Session",
  "Parent/Guardian Meeting",
];

export const SESSION_MODES: SessionMode[] = ["In Person", "Online"];
export const SESSION_STATUSES: SessionStatus[] = [
  "Scheduled",
  "Completed",
  "Cancelled",
];

export interface CounsellingSessionRecord {
  id: string;
  sessionRef: string;
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
  status: SessionStatus;
  schedulingNotes?: string;
}

export type NoticeAudience =
  | "Students"
  | "Teachers"
  | "Parents/Guardians"
  | "All permitted users";

export type NoticeCategory =
  | "Wellbeing"
  | "Support Resources"
  | "Workshops"
  | "Counselling Availability"
  | "General Notice";

export type NoticeStatus = "Draft" | "Published";

export const NOTICE_AUDIENCES: NoticeAudience[] = [
  "Students",
  "Teachers",
  "Parents/Guardians",
  "All permitted users",
];

export const NOTICE_CATEGORIES: NoticeCategory[] = [
  "Wellbeing",
  "Support Resources",
  "Workshops",
  "Counselling Availability",
  "General Notice",
];

export interface CounsellingNoticeRecord {
  id: string;
  title: string;
  category: NoticeCategory;
  audience: NoticeAudience;
  summary: string;
  content: string;
  publishedDate: string;
  expiryDate?: string;
  status: NoticeStatus;
  createdBy: string;
}

export type StudentVoiceCategory =
  | "Academic Stress"
  | "Peer or Social Issues"
  | "Personal Wellbeing"
  | "School Environment"
  | "General Support"
  | "Prefer Not to Say";

export const STUDENT_VOICE_CATEGORIES: StudentVoiceCategory[] = [
  "Academic Stress",
  "Peer or Social Issues",
  "Personal Wellbeing",
  "School Environment",
  "General Support",
  "Prefer Not to Say",
];

export type ConversationStatus = "Open" | "Awaiting Reply" | "Resolved";

export interface StudentVoiceConversation {
  id: string;
  conversationRef: string;
  studentPseudonymRef: string;
  /** Strictly matches mock logged-in student owner in preview mode; NEVER shown to counsellor */
  ownerAccountKey: string;
  subject: string;
  category: StudentVoiceCategory;
  status: ConversationStatus;
  createdAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadByCounsellor: number;
  unreadByStudent: number;
}

export interface StudentVoiceMessage {
  id: string;
  conversationId: string;
  senderRole: "student" | "counsellor";
  senderLabel: string;
  body: string;
  timestamp: string;
}

export type MeetingRequestStatus =
  | "Pending"
  | "Approved"
  | "Declined"
  | "Cancelled";

export interface MeetingRequestRecord {
  id: string;
  requestRef: string;
  conversationId: string;
  conversationRef: string;
  studentPseudonymRef: string;
  ownerAccountKey: string;
  preferredAvailability: string;
  studentMessage?: string;
  submittedDate: string;
  status: MeetingRequestStatus;
  counsellorResponse?: string;
  confirmedSlot?: string;
  confirmedLocation?: string;
}

export interface RevealedStudentIdentity {
  studentId: string;
  studentCode: string;
  fullName: string;
  className: string;
  linkedAccountRef: string;
  guardianName: string;
  guardianContact: string;
}

export interface StudentVoiceLinkRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  status: "Linked" | "Unlinked";
  linkedAccountId?: string;
  linkedAccountRef?: string;
  lastUpdated: string;
}

export interface SampleAuthAccount {
  id: string;
  accountRef: string;
  email: string;
  verifiedAt: string;
}

export interface MockReferralStudentOption {
  id: string;
  studentCode: string;
  name: string;
  className: string;
}

export const CURRENT_TEACHER_ACTOR = {
  id: "tea-priya",
  name: "Priya Nair",
};

export const CURRENT_COUNSELLOR_ACTOR = {
  id: "cns-meenakshi",
  name: "Dr. Meenakshi Kulkarni",
};

export const CURRENT_STUDENT_VOICE_OWNER = {
  ownerAccountKey: "auth-acc-sv-2041",
  defaultPseudonymRef: "SV-2041",
};

export const MOCK_STUDENTS_FOR_REFERRAL: MockReferralStudentOption[] = [
  { id: "stu-101", studentCode: "STU-2026-001", name: "Aarav Sharma", className: "Class 7-B" },
  { id: "stu-102", studentCode: "STU-2026-002", name: "Ananya Verma", className: "Class 8-B" },
  { id: "stu-103", studentCode: "STU-2026-003", name: "Karan Joshi", className: "Class 9-B" },
  { id: "stu-104", studentCode: "STU-2026-004", name: "Devansh Kulkarni", className: "Class 8-A" },
  { id: "stu-105", studentCode: "STU-2026-005", name: "Meera Sawant", className: "Class 8-A" },
  { id: "stu-106", studentCode: "STU-2026-006", name: "Rohan Deshpande", className: "Class 8-B" },
  { id: "stu-107", studentCode: "STU-2026-007", name: "Tanvi Kamat", className: "Class 7-B" },
  { id: "stu-108", studentCode: "STU-2026-008", name: "Siddharth Parab", className: "Class 9-A" },
  { id: "stu-1024", studentCode: "STU-1024", name: "Aarav Naik", className: "Class 8-A" },
  { id: "stu-1082", studentCode: "STU-1082", name: "Ananya Naik", className: "Class 5-B" },
];

export const INITIAL_REFERRALS: StudentReferralRecord[] = [
  {
    id: "ref-101",
    referralRef: "REF-2026-101",
    studentId: "stu-104",
    studentCode: "STU-2026-004",
    studentName: "Devansh Kulkarni",
    className: "Class 8-A",
    submittedByTeacherId: "tea-priya",
    submittedByTeacherName: "Priya Nair",
    category: "Attendance-Related Concern",
    priority: "High",
    observedDate: "2026-11-10",
    submittedDate: "2026-11-11",
    description:
      "Student missed multiple morning Mathematics periods over the past two weeks and appeared fatigued during Monday problem-solving sessions.",
    observations:
      "Missed 4 of the last 8 morning blocks; submitted incomplete classwork on Tuesday and Thursday without prior notice.",
    actionsTaken:
      "Offered extra practice worksheet after period 2 and confirmed homework submission deadlines.",
    additionalContext: "Homeroom register shows Monday arrival gaps.",
    status: "Accepted",
    teacherFeedbackNote:
      "Referral accepted by Counselling Desk. Routine support check-in has been initiated.",
    linkedCaseId: "case-301",
    timeline: [
      {
        id: "tl-1",
        label: "Referral Submitted",
        timestamp: "11 Nov 2026, 10:15 AM",
        actorRole: "Teacher (Priya Nair)",
      },
      {
        id: "tl-2",
        label: "Marked Under Review",
        timestamp: "11 Nov 2026, 02:30 PM",
        actorRole: "Counsellor (Dr. Meenakshi Kulkarni)",
      },
      {
        id: "tl-3",
        label: "Referral Accepted",
        timestamp: "12 Nov 2026, 09:40 AM",
        actorRole: "Counsellor (Dr. Meenakshi Kulkarni)",
        note: "Accepted for confidential case support.",
      },
    ],
  },
  {
    id: "ref-102",
    referralRef: "REF-2026-102",
    studentId: "stu-108",
    studentCode: "STU-2026-008",
    studentName: "Siddharth Parab",
    className: "Class 9-A",
    submittedByTeacherId: "tea-priya",
    submittedByTeacherName: "Priya Nair",
    category: "Academic Difficulty",
    priority: "Medium",
    observedDate: "2026-11-11",
    submittedDate: "2026-11-12",
    description:
      "Noticeable hesitation during timed group exercises and frequent requests to leave worksheets unfinished ahead of upcoming Term II tests.",
    observations:
      "Usually strong in class discussions, though visibly overwhelmed during timed board quizzes on 11 Nov.",
    actionsTaken:
      "Spoke briefly after class and reassured student about upcoming revision sessions.",
    status: "Under Review",
    teacherFeedbackNote:
      "Currently under review by counselling team; teacher check-in scheduled if additional classroom context is needed.",
    timeline: [
      {
        id: "tl-201",
        label: "Referral Submitted",
        timestamp: "12 Nov 2026, 11:45 AM",
        actorRole: "Teacher (Priya Nair)",
      },
      {
        id: "tl-202",
        label: "Marked Under Review",
        timestamp: "12 Nov 2026, 04:10 PM",
        actorRole: "Counsellor (Dr. Meenakshi Kulkarni)",
      },
    ],
  },
  {
    id: "ref-103",
    referralRef: "REF-2026-103",
    studentId: "stu-107",
    studentCode: "STU-2026-007",
    studentName: "Tanvi Kamat",
    className: "Class 7-B",
    submittedByTeacherId: "tea-priya",
    submittedByTeacherName: "Priya Nair",
    category: "Social or Peer Difficulties",
    priority: "High",
    observedDate: "2026-11-12",
    submittedDate: "2026-11-13",
    description:
      "Observed withdrawing from paired laboratory seating and sitting alone during morning break transitions over three consecutive days.",
    observations:
      "Quiet during collaborative tasks; declined team activity invitation on 12 Nov.",
    actionsTaken: "Assigned flexible seating partner for lab sessions.",
    status: "Submitted",
    timeline: [
      {
        id: "tl-301",
        label: "Referral Submitted",
        timestamp: "13 Nov 2026, 09:20 AM",
        actorRole: "Teacher (Priya Nair)",
      },
    ],
  },
  {
    id: "ref-104",
    referralRef: "REF-2026-104",
    studentId: "stu-105",
    studentCode: "STU-2026-005",
    studentName: "Meera Sawant",
    className: "Class 8-A",
    submittedByTeacherId: "tea-arvind",
    submittedByTeacherName: "Arvind Bhat",
    category: "Emotional Wellbeing Concern",
    priority: "Urgent",
    observedDate: "2026-11-12",
    submittedDate: "2026-11-13",
    description:
      "Science faculty noted sudden tearfulness following routine lab feedback and asked for supportive check-in from student wellbeing.",
    observations:
      "Stepped out to drink water twice during period 4 and declined lunchroom entry.",
    status: "Submitted",
    timeline: [
      {
        id: "tl-401",
        label: "Referral Submitted",
        timestamp: "13 Nov 2026, 12:15 PM",
        actorRole: "Teacher (Arvind Bhat)",
      },
    ],
  },
  {
    id: "ref-105",
    referralRef: "REF-2026-105",
    studentId: "stu-101",
    studentCode: "STU-2026-001",
    studentName: "Aarav Sharma",
    className: "Class 7-B",
    submittedByTeacherId: "tea-priya",
    submittedByTeacherName: "Priya Nair",
    category: "Other",
    priority: "Low",
    observedDate: "2026-11-02",
    submittedDate: "2026-11-04",
    description:
      "Brief concern regarding missed stationery organisation on two mornings.",
    observations: "Resolved independently within two days after parent planner note.",
    status: "Declined",
    declineReason:
      "Standard classroom routine check recommended first; no ongoing counselling intervention required at this time.",
    teacherFeedbackNote:
      "Declined — standard homeroom organisation checklist advised first; please resubmit if new patterns emerge.",
    timeline: [
      {
        id: "tl-501",
        label: "Referral Submitted",
        timestamp: "04 Nov 2026, 08:50 AM",
        actorRole: "Teacher (Priya Nair)",
      },
      {
        id: "tl-502",
        label: "Referral Declined",
        timestamp: "05 Nov 2026, 11:10 AM",
        actorRole: "Counsellor (Dr. Meenakshi Kulkarni)",
        note: "Classroom routine support sufficient.",
      },
    ],
  },
];

export const INITIAL_CASES: CounsellingCaseRecord[] = [
  {
    id: "case-301",
    caseRef: "CASE-2026-301",
    studentId: "stu-104",
    studentCode: "STU-2026-004",
    studentName: "Devansh Kulkarni",
    className: "Class 8-A",
    sourceReferralId: "ref-101",
    sourceReferralRef: "REF-2026-101",
    assignedCounsellor: "Dr. Meenakshi Kulkarni",
    status: "In Progress",
    createdDate: "2026-11-12",
    updatedDate: "2026-11-13",
    focusArea: "Morning Transition & Attendance Consistency Support",
    timeline: [
      {
        id: "ctl-1",
        title: "Source referral accepted",
        timestamp: "12 Nov 2026, 09:40 AM",
        detail: "Referral REF-2026-101 accepted from Priya Nair.",
      },
      {
        id: "ctl-2",
        title: "Counselling case opened",
        timestamp: "12 Nov 2026, 09:45 AM",
        detail: "Assigned to Dr. Meenakshi Kulkarni.",
      },
      {
        id: "ctl-3",
        title: "Case status changed to In Progress",
        timestamp: "12 Nov 2026, 03:20 PM",
        detail: "Initial check-in completed and follow-up scheduled.",
      },
    ],
  },
  {
    id: "case-302",
    caseRef: "CASE-2026-302",
    studentId: "stu-103",
    studentCode: "STU-2026-003",
    studentName: "Karan Joshi",
    className: "Class 9-B",
    sourceReferralId: "ref-098",
    sourceReferralRef: "REF-2026-098",
    assignedCounsellor: "Dr. Meenakshi Kulkarni",
    status: "Open",
    createdDate: "2026-11-08",
    updatedDate: "2026-11-12",
    focusArea: "Exam Preparation Pacing & Peer Integration",
    timeline: [
      {
        id: "ctl-201",
        title: "Counselling case opened",
        timestamp: "08 Nov 2026, 11:00 AM",
        detail: "Created from accepted faculty referral REF-2026-098.",
      },
    ],
  },
];

export const INITIAL_PRIVATE_NOTES: PrivateCaseNoteRecord[] = [
  {
    id: "note-1",
    caseId: "case-301",
    authorName: "Dr. Meenakshi Kulkarni",
    createdAt: "12 Nov 2026, 03:35 PM",
    noteType: "Session Observation",
    content:
      "Initial 20-minute intake focused on daily morning commute routines and weekly planner habits. Student was cooperative and agreed to try a simplified Sunday evening preparation checklist.",
  },
  {
    id: "note-2",
    caseId: "case-302",
    authorName: "Dr. Meenakshi Kulkarni",
    createdAt: "09 Nov 2026, 02:15 PM",
    noteType: "Follow-up Plan",
    content:
      "Discussed breaking Term II revision blocks into 25-minute goals. Scheduled follow-up check-in before mid-term practical week.",
  },
];

export const INITIAL_SESSIONS: CounsellingSessionRecord[] = [
  {
    id: "ses-401",
    sessionRef: "SES-2026-401",
    caseId: "case-301",
    caseRef: "CASE-2026-301",
    studentName: "Devansh Kulkarni",
    className: "Class 8-A",
    date: "2026-11-15",
    startTime: "10:30",
    endTime: "11:10",
    sessionType: "Follow-up",
    mode: "In Person",
    locationOrLink: "Counselling Room A (Block 2)",
    assignedCounsellor: "Dr. Meenakshi Kulkarni",
    status: "Scheduled",
    schedulingNotes: "Review first week planner routine.",
  },
  {
    id: "ses-402",
    sessionRef: "SES-2026-402",
    caseId: "case-302",
    caseRef: "CASE-2026-302",
    studentName: "Karan Joshi",
    className: "Class 9-B",
    date: "2026-11-16",
    startTime: "14:00",
    endTime: "14:40",
    sessionType: "Individual Counselling",
    mode: "In Person",
    locationOrLink: "Counselling Room A (Block 2)",
    assignedCounsellor: "Dr. Meenakshi Kulkarni",
    status: "Scheduled",
    schedulingNotes: "Pre-assessment confidence check-in.",
  },
  {
    id: "ses-403",
    sessionRef: "SES-2026-403",
    caseId: "case-301",
    caseRef: "CASE-2026-301",
    studentName: "Devansh Kulkarni",
    className: "Class 8-A",
    date: "2026-11-12",
    startTime: "15:00",
    endTime: "15:30",
    sessionType: "Individual Counselling",
    mode: "In Person",
    locationOrLink: "Counselling Room A (Block 2)",
    assignedCounsellor: "Dr. Meenakshi Kulkarni",
    status: "Completed",
    schedulingNotes: "Initial intake conversation completed.",
  },
  {
    id: "ses-404",
    sessionRef: "SES-2026-404",
    studentName: "Ananya Verma",
    className: "Class 8-B",
    date: "2026-11-10",
    startTime: "11:30",
    endTime: "12:00",
    sessionType: "Parent/Guardian Meeting",
    mode: "Online",
    locationOrLink: "Google Meet · Verified Guardian Invite",
    assignedCounsellor: "Dr. Meenakshi Kulkarni",
    status: "Cancelled",
    schedulingNotes: "Rescheduled by guardian for next week.",
  },
];

export const INITIAL_NOTICES: CounsellingNoticeRecord[] = [
  {
    id: "cnot-101",
    title: "Exam Stress & Study Pacing Drop-In Hours",
    category: "Counselling Availability",
    audience: "Students",
    summary:
      "Open student wellbeing drop-in slots available Monday to Friday between 1:00 PM and 2:30 PM in Block 2.",
    content:
      "Ahead of Term II assessments, the School Counselling Desk is hosting open 20-minute study planning and stress-management drop-in hours every weekday from 1:00 PM to 2:30 PM in Room B-204.\n\nNo formal appointment is required for brief check-ins, or you may reach out anytime via Student Voice.",
    publishedDate: "2026-11-12",
    expiryDate: "2026-12-18",
    status: "Published",
    createdBy: "Dr. Meenakshi Kulkarni",
  },
  {
    id: "cnot-102",
    title: "Balanced Screen Habits & Sleep Hygiene Workshop",
    category: "Workshops",
    audience: "Students",
    summary:
      "Interactive 40-minute peer wellbeing workshop for Grades 7–10 this Friday in the AV Hall.",
    content:
      "Join our Student Wellbeing team this Friday at 2:45 PM in the AV Hall for practical strategies on balancing study schedules, reducing late-night screen fatigue, and maintaining restful sleep ahead of exams.",
    publishedDate: "2026-11-10",
    expiryDate: "2026-11-22",
    status: "Published",
    createdBy: "Dr. Meenakshi Kulkarni",
  },
  {
    id: "cnot-103",
    title: "Student Support Resources Directory (Term II)",
    category: "Support Resources",
    audience: "All permitted users",
    summary:
      "Guide to campus counselling timings, peer study rooms, and parent consultation contacts.",
    content:
      "The Term II Support Directory outlines available in-school mentoring desks, study skill guides, and parent consultation hours. Note that school counselling channels are dedicated school support resources and are not a 24/7 emergency response service.",
    publishedDate: "2026-11-08",
    status: "Published",
    createdBy: "Dr. Meenakshi Kulkarni",
  },
  {
    id: "cnot-104",
    title: "Faculty Guidelines: Factual Referral Observations",
    category: "General Notice",
    audience: "Teachers",
    summary:
      "Reminder for teaching staff on documenting objective attendance and classroom observations when submitting referrals.",
    content:
      "When submitting a student referral via My Referrals, please describe observable dates, participation changes, and classroom adjustments already attempted rather than diagnostic conclusions.",
    publishedDate: "2026-11-13",
    status: "Draft",
    createdBy: "Dr. Meenakshi Kulkarni",
  },
];

export const INITIAL_SV_CONVERSATIONS: StudentVoiceConversation[] = [
  {
    id: "sv-conv-101",
    conversationRef: "CONV-1041",
    studentPseudonymRef: "SV-2041",
    ownerAccountKey: "auth-acc-sv-2041",
    subject: "Feeling overwhelmed with upcoming Maths & Science revision",
    category: "Academic Stress",
    status: "Open",
    createdAt: "11 Nov 2026, 04:15 PM",
    lastMessageAt: "13 Nov 2026, 11:20 AM",
    lastMessagePreview:
      "Thank you, breaking the chapters down into smaller blocks sounds manageable.",
    unreadByCounsellor: 1,
    unreadByStudent: 0,
  },
  {
    id: "sv-conv-102",
    conversationRef: "CONV-1042",
    studentPseudonymRef: "SV-2041",
    ownerAccountKey: "auth-acc-sv-2041",
    subject: "Navigating group project disagreements politely",
    category: "Peer or Social Issues",
    status: "Awaiting Reply",
    createdAt: "06 Nov 2026, 01:10 PM",
    lastMessageAt: "08 Nov 2026, 03:45 PM",
    lastMessagePreview:
      "Feel free to share how tomorrow's group check-in goes whenever you are ready.",
    unreadByCounsellor: 0,
    unreadByStudent: 1,
  },
  {
    id: "sv-conv-103",
    conversationRef: "CONV-1043",
    studentPseudonymRef: "SV-2078",
    ownerAccountKey: "auth-acc-sv-2078",
    subject: "Quiet study space availability during lunch hours",
    category: "School Environment",
    status: "Open",
    createdAt: "12 Nov 2026, 12:30 PM",
    lastMessageAt: "13 Nov 2026, 09:05 AM",
    lastMessagePreview:
      "Could we check whether the upper reading room is open after 1:15 PM?",
    unreadByCounsellor: 1,
    unreadByStudent: 0,
  },
  {
    id: "sv-conv-104",
    conversationRef: "CONV-1044",
    studentPseudonymRef: "SV-2115",
    ownerAccountKey: "auth-acc-sv-2115",
    subject: "Difficulty concentrating after sports practice",
    category: "Personal Wellbeing",
    status: "Resolved",
    createdAt: "01 Nov 2026, 05:00 PM",
    lastMessageAt: "05 Nov 2026, 02:15 PM",
    lastMessagePreview:
      "Glad the hydration and 20-minute evening rest routine has been helping!",
    unreadByCounsellor: 0,
    unreadByStudent: 0,
  },
];

export const INITIAL_SV_MESSAGES: StudentVoiceMessage[] = [
  {
    id: "svm-1",
    conversationId: "sv-conv-101",
    senderRole: "student",
    senderLabel: "SV-2041",
    body: "Hi, I have been finding it hard to catch up on three chapters before Term II assessments and feel stuck every time I open my revision list.",
    timestamp: "11 Nov 2026, 04:15 PM",
  },
  {
    id: "svm-2",
    conversationId: "sv-conv-101",
    senderRole: "counsellor",
    senderLabel: "School Counsellor",
    body: "Thank you for reaching out. Having three chapters queued at once can feel heavy. A helpful first step is picking just one topic for a 20-minute focus block without worrying about finishing the full syllabus today.",
    timestamp: "12 Nov 2026, 10:05 AM",
  },
  {
    id: "svm-3",
    conversationId: "sv-conv-101",
    senderRole: "student",
    senderLabel: "SV-2041",
    body: "Thank you, breaking the chapters down into smaller blocks sounds manageable.",
    timestamp: "13 Nov 2026, 11:20 AM",
  },
  {
    id: "svm-4",
    conversationId: "sv-conv-102",
    senderRole: "student",
    senderLabel: "SV-2041",
    body: "Our science team cannot agree on who presents the slides and I feel uncomfortable speaking up.",
    timestamp: "06 Nov 2026, 01:10 PM",
  },
  {
    id: "svm-5",
    conversationId: "sv-conv-102",
    senderRole: "counsellor",
    senderLabel: "School Counsellor",
    body: "Feel free to share how tomorrow's group check-in goes whenever you are ready. Splitting the script into clear 2-minute parts often keeps everyone comfortable.",
    timestamp: "08 Nov 2026, 03:45 PM",
  },
  {
    id: "svm-6",
    conversationId: "sv-conv-103",
    senderRole: "student",
    senderLabel: "SV-2078",
    body: "Could we check whether the upper reading room is open after 1:15 PM? The main corridor gets very noisy during lunch.",
    timestamp: "13 Nov 2026, 09:05 AM",
  },
  {
    id: "svm-7",
    conversationId: "sv-conv-104",
    senderRole: "student",
    senderLabel: "SV-2115",
    body: "Thanks for suggesting the 20-minute break after evening practice.",
    timestamp: "04 Nov 2026, 04:40 PM",
  },
  {
    id: "svm-8",
    conversationId: "sv-conv-104",
    senderRole: "counsellor",
    senderLabel: "School Counsellor",
    body: "Glad the hydration and 20-minute evening rest routine has been helping!",
    timestamp: "05 Nov 2026, 02:15 PM",
  },
];

export const INITIAL_MEETING_REQUESTS: MeetingRequestRecord[] = [
  {
    id: "mreq-101",
    requestRef: "MR-2026-101",
    conversationId: "sv-conv-101",
    conversationRef: "CONV-1041",
    studentPseudonymRef: "SV-2041",
    ownerAccountKey: "auth-acc-sv-2041",
    preferredAvailability: "Monday or Wednesday · 01:15 PM – 02:00 PM",
    studentMessage:
      "Would appreciate a brief in-person study planning chat before revision week.",
    submittedDate: "12 Nov 2026",
    status: "Approved",
    counsellorResponse:
      "Confirmed for Wednesday during the lunch break support slot.",
    confirmedSlot: "Wednesday, 18 Nov 2026 · 01:20 PM – 01:45 PM",
    confirmedLocation: "Counselling Room A (Block 2)",
  },
  {
    id: "mreq-102",
    requestRef: "MR-2026-102",
    conversationId: "sv-conv-103",
    conversationRef: "CONV-1043",
    studentPseudonymRef: "SV-2078",
    ownerAccountKey: "auth-acc-sv-2078",
    preferredAvailability: "Friday afternoon · After 02:30 PM",
    studentMessage:
      "Hoping to discuss quiet study passes in person.",
    submittedDate: "13 Nov 2026",
    status: "Pending",
  },
];

/**
 * STRICTLY FOR CONTROLLED POST-APPROVAL REVEAL MOCK DEMONSTRATION.
 * Never exposed in normal Student Voice lists, chat threads, or browser storage.
 */
export const MOCK_PROTECTED_IDENTITY_MAP: Record<
  string,
  RevealedStudentIdentity
> = {
  "sv-conv-101": {
    studentId: "stu-1024",
    studentCode: "STU-1024",
    fullName: "Aarav Naik",
    className: "Class 8-A",
    linkedAccountRef: "ACC-STU-2041",
    guardianName: "Rajesh Naik",
    guardianContact: "+91 98230 11223",
  },
  "sv-conv-103": {
    studentId: "stu-106",
    studentCode: "STU-2026-006",
    fullName: "Rohan Deshpande",
    className: "Class 8-B",
    linkedAccountRef: "ACC-STU-2078",
    guardianName: "Sunil Deshpande",
    guardianContact: "+91 98221 44510",
  },
};

export const INITIAL_SV_LINK_RECORDS: StudentVoiceLinkRecord[] = [
  {
    id: "svl-1",
    studentId: "stu-1024",
    studentCode: "STU-1024",
    studentName: "Aarav Naik",
    className: "Class 8-A",
    status: "Linked",
    linkedAccountId: "acc-101",
    linkedAccountRef: "ACC-STU-2041 (a.naik@student.edusync.in)",
    lastUpdated: "02 Nov 2026",
  },
  {
    id: "svl-2",
    studentId: "stu-106",
    studentCode: "STU-2026-006",
    studentName: "Rohan Deshpande",
    className: "Class 8-B",
    status: "Linked",
    linkedAccountId: "acc-102",
    linkedAccountRef: "ACC-STU-2078 (r.deshpande@student.edusync.in)",
    lastUpdated: "04 Nov 2026",
  },
  {
    id: "svl-3",
    studentId: "stu-104",
    studentCode: "STU-2026-004",
    studentName: "Devansh Kulkarni",
    className: "Class 8-A",
    status: "Unlinked",
    lastUpdated: "Pending Link",
  },
  {
    id: "svl-4",
    studentId: "stu-105",
    studentCode: "STU-2026-005",
    studentName: "Meera Sawant",
    className: "Class 8-A",
    status: "Unlinked",
    lastUpdated: "Pending Link",
  },
  {
    id: "svl-5",
    studentId: "stu-107",
    studentCode: "STU-2026-007",
    studentName: "Tanvi Kamat",
    className: "Class 7-B",
    status: "Unlinked",
    lastUpdated: "Pending Link",
  },
  {
    id: "svl-6",
    studentId: "stu-108",
    studentCode: "STU-2026-008",
    studentName: "Siddharth Parab",
    className: "Class 9-A",
    status: "Linked",
    linkedAccountId: "acc-103",
    linkedAccountRef: "ACC-STU-2115 (s.parab@student.edusync.in)",
    lastUpdated: "11 Nov 2026",
  },
  {
    id: "svl-7",
    studentId: "stu-101",
    studentCode: "STU-2026-001",
    studentName: "Aarav Sharma",
    className: "Class 7-B",
    status: "Unlinked",
    lastUpdated: "Pending Link",
  },
  {
    id: "svl-8",
    studentId: "stu-102",
    studentCode: "STU-2026-002",
    studentName: "Ananya Verma",
    className: "Class 8-B",
    status: "Unlinked",
    lastUpdated: "Pending Link",
  },
];

export const AVAILABLE_AUTH_ACCOUNTS: SampleAuthAccount[] = [
  {
    id: "acc-101",
    accountRef: "ACC-STU-2041",
    email: "a.naik@student.edusync.in",
    verifiedAt: "02 Nov 2026",
  },
  {
    id: "acc-102",
    accountRef: "ACC-STU-2078",
    email: "r.deshpande@student.edusync.in",
    verifiedAt: "04 Nov 2026",
  },
  {
    id: "acc-103",
    accountRef: "ACC-STU-2115",
    email: "s.parab@student.edusync.in",
    verifiedAt: "11 Nov 2026",
  },
  {
    id: "acc-104",
    accountRef: "ACC-STU-2142",
    email: "d.kulkarni@student.edusync.in",
    verifiedAt: "12 Nov 2026",
  },
  {
    id: "acc-105",
    accountRef: "ACC-STU-2156",
    email: "m.sawant@student.edusync.in",
    verifiedAt: "12 Nov 2026",
  },
  {
    id: "acc-106",
    accountRef: "ACC-STU-2169",
    email: "t.kamat@student.edusync.in",
    verifiedAt: "13 Nov 2026",
  },
  {
    id: "acc-107",
    accountRef: "ACC-STU-2180",
    email: "a.sharma@student.edusync.in",
    verifiedAt: "13 Nov 2026",
  },
  {
    id: "acc-108",
    accountRef: "ACC-STU-2194",
    email: "a.verma@student.edusync.in",
    verifiedAt: "13 Nov 2026",
  },
];

