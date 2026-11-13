/*
 * ============================================================================
 * EduSync — Stage 6: Announcements Mock Data, Helpers & API Contracts
 * ============================================================================
 *
 * Future Backend API Reference Contracts (Not called in Frontend Preview Mode):
 *
 * - POST /schools/{school_id}/announcements
 * - GET  /schools/{school_id}/announcements
 *
 * Notes:
 * - Logically separate from Notifications data (`@/config/notifications-data`).
 * - Supports Published, Scheduled, and Draft lifecycles plus multi-audience
 *   targeting and class-specific announcements.
 * ============================================================================
 */

import type { IconName } from "@/components/ui/Icon";

export type AnnouncementStatus = "Published" | "Scheduled" | "Draft";

export type AnnouncementPriority = "Normal" | "Important" | "Urgent";

export type AudienceTarget =
  | "Entire School"
  | "Students"
  | "Parents"
  | "Teachers"
  | "Specific Class";

export const AUDIENCE_OPTIONS: AudienceTarget[] = [
  "Entire School",
  "Students",
  "Parents",
  "Teachers",
  "Specific Class",
];

export const PRIORITY_OPTIONS: AnnouncementPriority[] = [
  "Normal",
  "Important",
  "Urgent",
];

export const ANNOUNCEMENT_STATUS_OPTIONS: AnnouncementStatus[] = [
  "Published",
  "Scheduled",
  "Draft",
];

export const ANNOUNCEMENT_ICONS: Record<
  "default" | "published" | "scheduled" | "draft" | "audience" | "attachment",
  IconName
> = {
  default: "megaphone",
  published: "check-circle",
  scheduled: "clock",
  draft: "file-text",
  audience: "users",
  attachment: "file-text",
};

export interface AnnouncementRecord {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  audiences: AudienceTarget[];
  specificClass?: string;
  createdBy: string;
  createdByRole: string;
  publishedDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  attachmentName?: string;
}

export interface AnnouncementStatsSummary {
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
}

/**
 * Base offsets represent historical archived school announcements so initial
 * dashboard totals reflect 24 Total, 18 Published, 3 Scheduled, and 3 Drafts
 * alongside the 10 active records in INITIAL_ANNOUNCEMENTS (6 Published,
 * 2 Scheduled, 2 Drafts), and update live as records change.
 */
export const ANNOUNCEMENT_BASE_COUNTS = {
  totalOffset: 14,
  publishedOffset: 12,
  scheduledOffset: 1,
  draftsOffset: 1,
};

export const INITIAL_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: "ann-101",
    title: "Annual Sports Day",
    shortDescription:
      "Track and field events, house march-past, and prize distribution ceremony at the main sports complex on November 28.",
    content:
      "Dear Students and Parents,\n\nWe are pleased to announce that our Annual Sports Day for the 2026-2027 academic session will be held on Saturday, November 28, 2026, starting at 8:30 AM at the Main School Ground.\n\nAll participating students must report in their respective house uniforms by 7:45 AM. Parents and guardians are warmly invited to attend the opening march-past and cheer for the students.\n\nRefreshment counters will be arranged near the east pavilion, and regular school buses will operate on a special Saturday schedule.",
    status: "Published",
    priority: "Important",
    audiences: ["Students", "Parents"],
    createdBy: "Arjun Mehta",
    createdByRole: "School Admin",
    publishedDate: "2026-11-12",
    attachmentName: "Annual_Sports_Day_Schedule_2026.pdf",
  },
  {
    id: "ann-102",
    title: "Parent-Teacher Meeting",
    shortDescription:
      "Term 1 academic progress review and attendance feedback sessions scheduled for Classes 6 to 10 this Saturday.",
    content:
      "Dear Parents,\n\nThe Term 1 Parent-Teacher Meeting (PTM) for Classes 6 through 10 is scheduled for Saturday, November 21, 2026, from 9:00 AM to 1:30 PM in the respective homerooms.\n\nClass teachers and subject faculty will share mid-term assessment progress, classroom participation notes, and attendance summaries. Kindly adhere to the 15-minute slot allocated to your ward by the class teacher.\n\nStudents accompanying parents are requested to wear their regular school uniform.",
    status: "Published",
    priority: "Important",
    audiences: ["Parents"],
    createdBy: "Dr. Kavita Rao",
    createdByRole: "Principal",
    publishedDate: "2026-11-11",
    attachmentName: "PTM_Slot_Guidelines_Nov2026.pdf",
  },
  {
    id: "ann-103",
    title: "School Holiday Notice",
    shortDescription:
      "Campus will remain closed on November 15 for Guru Nanak Jayanti; regular classes resume on Monday.",
    content:
      "Notice to Entire School Community,\n\nPlease be informed that EduSync Public School will remain closed on Sunday, November 15, 2026, on account of Guru Nanak Jayanti. All administrative offices, library facilities, and co-curricular clubs will observe the holiday.\n\nRegular classes and transport routes will resume as per normal timetable on Monday, November 16, 2026.",
    status: "Published",
    priority: "Urgent",
    audiences: ["Entire School"],
    createdBy: "Arjun Mehta",
    createdByRole: "School Admin",
    publishedDate: "2026-11-10",
  },
  {
    id: "ann-104",
    title: "Examination Schedule",
    shortDescription:
      "Mid-term unit test timetable and subject-wise syllabus guidelines published for Classes 6 to 10.",
    content:
      "Dear Students and Parents,\n\nThe Unit Test II / Mid-Term Examination schedule for Classes 6 to 10 has been finalized and will commence on Monday, December 7, 2026.\n\nKey Guidelines:\n1. Morning reporting time during examination days is 8:15 AM.\n2. Students must carry their valid School ID card and transparent stationery pouch.\n3. Electronic gadgets and smartwatches are strictly prohibited inside examination halls.\n\nPlease download the attached timetable PDF for class-wise dates and subject codes.",
    status: "Published",
    priority: "Urgent",
    audiences: ["Students", "Parents"],
    createdBy: "Priya Nair",
    createdByRole: "Academic Coordinator",
    publishedDate: "2026-11-09",
    attachmentName: "MidTerm_Examination_Timetable_2026.pdf",
  },
  {
    id: "ann-105",
    title: "Science Exhibition Registration",
    shortDescription:
      "Student project teams from Classes 6 to 10 can submit STEM working model proposals before November 22.",
    content:
      "Attention Young Innovators,\n\nRegistrations are now open for the Annual Intra-School STEM & Science Exhibition 2026. Students may participate individually or in teams of up to three members.\n\nThemes for this year include Clean Energy Systems, Smart Agriculture, and AI in Everyday Education. Submit your project synopsis to your Science Coordinator or the Physics Lab desk by November 22, 2026.",
    status: "Published",
    priority: "Normal",
    audiences: ["Students"],
    createdBy: "Vikram Singh",
    createdByRole: "Science Department Head",
    publishedDate: "2026-11-08",
    attachmentName: "STEM_Exhibition_Registration_Form.pdf",
  },
  {
    id: "ann-106",
    title: "Teacher Training Session",
    shortDescription:
      "Mandatory faculty workshop on NEP competency-based assessments and digital attendance analytics.",
    content:
      "Dear Faculty Members,\n\nAn in-service professional development workshop on Competency-Based Assessment Design and Classroom Engagement Analytics is scheduled for Friday, November 20, 2026, from 2:30 PM to 4:30 PM in the Seminar Hall.\n\nAll homeroom and subject teachers are requested to bring their school laptops and review the pre-read handout prior to the session.",
    status: "Scheduled",
    priority: "Important",
    audiences: ["Teachers"],
    createdBy: "Dr. Kavita Rao",
    createdByRole: "Principal",
    publishedDate: "2026-11-18",
    scheduledDate: "2026-11-18",
    scheduledTime: "09:00",
    attachmentName: "NEP_Workshop_Agenda.pdf",
  },
  {
    id: "ann-107",
    title: "Fee Payment Reminder",
    shortDescription:
      "Draft reminder for Term 2 tuition and transport fee invoices due before the end of November.",
    content:
      "Dear Parents and Guardians,\n\nThis is a gentle reminder regarding Term 2 tuition and transportation fee invoices for the 2026-2027 academic session. Kindly verify your ward's fee balance and complete payment on or before November 30, 2026, to avoid late fee surcharges.\n\nPayments can be made via UPI, Bank Transfer, or at the school accounts counter between 9:00 AM and 2:00 PM on working days.",
    status: "Draft",
    priority: "Important",
    audiences: ["Parents"],
    createdBy: "Sneha Kulkarni",
    createdByRole: "Accounts Officer",
    publishedDate: "2026-11-14",
  },
  {
    id: "ann-108",
    title: "School Assembly Update",
    shortDescription:
      "Revised morning assembly rotation, house duty roster, and winter courtyard timing starting next week.",
    content:
      "Dear Students and Teachers,\n\nStarting Monday, November 23, 2026, the morning assembly will begin at 8:20 AM in the Central Courtyard. Class 8-A and Class 8-B will lead the weekly thought, news bulletin, and pledge duties.\n\nHomeroom teachers are requested to guide students to line up by 8:15 AM sharp.",
    status: "Draft",
    priority: "Normal",
    audiences: ["Students", "Teachers"],
    createdBy: "Priya Nair",
    createdByRole: "Academic Coordinator",
    publishedDate: "2026-11-14",
  },
  {
    id: "ann-109",
    title: "Inter-School Debate Trials — Class 9-A",
    shortDescription:
      "Shortlisted speakers from Class 9-A to attend orientation with the English literary faculty on Tuesday.",
    content:
      "Dear Class 9-A Students,\n\nStudents interested in representing the school at the District Inter-School Debate Championship should assemble in Room 204 during the 7th period on Tuesday, November 17, 2026.\n\nPreparation topics and rebuttal formats will be shared by Ms. Meera Krishnan during the briefing.",
    status: "Published",
    priority: "Normal",
    audiences: ["Specific Class"],
    specificClass: "Class 9-A",
    createdBy: "Meera Krishnan",
    createdByRole: "Senior English Teacher",
    publishedDate: "2026-11-06",
  },
  {
    id: "ann-110",
    title: "Winter Uniform Transition Advisory",
    shortDescription:
      "Scheduled campus notice announcing mandatory winter blazer and sweater guidelines effective December 1.",
    content:
      "Dear Parents and Students,\n\nIn view of the upcoming winter season, all students from Classes 6 to 10 are advised to transition to the official school winter uniform (navy blazer/sweater with school crest) starting December 1, 2026.\n\nPlease ensure all uniform items are clearly labeled with the student's name and class section.",
    status: "Scheduled",
    priority: "Normal",
    audiences: ["Entire School"],
    createdBy: "Arjun Mehta",
    createdByRole: "School Admin",
    publishedDate: "2026-11-24",
    scheduledDate: "2026-11-24",
    scheduledTime: "08:30",
  },
];

const ANNOUNCEMENTS_STORAGE_KEY = "edusync_announcements_v1";

export function computeAnnouncementStats(
  announcements: AnnouncementRecord[],
): AnnouncementStatsSummary {
  const publishedCount = announcements.filter(
    (item) => item.status === "Published",
  ).length;
  const scheduledCount = announcements.filter(
    (item) => item.status === "Scheduled",
  ).length;
  const draftsCount = announcements.filter(
    (item) => item.status === "Draft",
  ).length;

  return {
    total: ANNOUNCEMENT_BASE_COUNTS.totalOffset + announcements.length,
    published: ANNOUNCEMENT_BASE_COUNTS.publishedOffset + publishedCount,
    scheduled: ANNOUNCEMENT_BASE_COUNTS.scheduledOffset + scheduledCount,
    drafts: ANNOUNCEMENT_BASE_COUNTS.draftsOffset + draftsCount,
  };
}

export function getStoredAnnouncements(): AnnouncementRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_ANNOUNCEMENTS;
  }
  try {
    const raw = window.sessionStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (!raw) return INITIAL_ANNOUNCEMENTS;
    const parsed = JSON.parse(raw) as AnnouncementRecord[];
    return Array.isArray(parsed) ? parsed : INITIAL_ANNOUNCEMENTS;
  } catch {
    return INITIAL_ANNOUNCEMENTS;
  }
}

export function saveStoredAnnouncements(items: AnnouncementRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      ANNOUNCEMENTS_STORAGE_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore storage quota errors in preview mode
  }
}
