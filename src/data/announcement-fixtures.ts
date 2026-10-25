import type { ActionItem, Announcement, MailMessage } from "../mail/contracts";
import { attachmentFixtures } from "./attachment-fixtures";

/**
 * Raw mock mailbox messages containing BOTH official announcement-style mail
 * AND unrelated student-to-student conversations.
 * Demonstrates that SIG-103 feed filters out unrelated conversations.
 */
export const rawMockMessages: readonly MailMessage[] = [
  // --- Official Announcements ---
  {
    id: "ann-001",
    from: "registrar@example.edu",
    subject: "EMERGENCY: Campus water line repair affecting hostels tonight",
    receivedAt: "2026-10-10T14:30:00.000Z",
    preview: "Water supply will be suspended between 10:00 PM and 4:00 AM for emergency pipeline maintenance.",
    body: "Dear Students,\n\nPlease note that water supply across Hostels A, B, and C will be temporarily suspended tonight between 10:00 PM and 4:00 AM due to an emergency repair on the main pipeline.\n\nPlease store adequate drinking water in advance. We apologize for the inconvenience.\n\nRegards,\nCampus Operations & Registrar",
    headers: {
      "Precedence": "bulk",
      "List-ID": "<announcements.campus.example.edu>",
      "X-Campus-Category": "operations",
    },
    attachments: [attachmentFixtures[0]], // syllabus / repair notice pdf
  },
  {
    id: "ann-002",
    from: "student.affairs@example.edu",
    subject: "Course registration closes Friday at 5:00 PM",
    receivedAt: "2026-10-09T09:15:00.000Z",
    preview: "Complete registration before 5:00 PM on Friday. Late submissions will incur a fee.",
    body: "All undergraduate and postgraduate students are reminded that online portal registration for the Spring semester closes strictly at 5:00 PM on Friday, 12 October.\n\nEnsure all prerequisite requirements are verified by your faculty advisor prior to the deadline.",
    headers: {
      "Precedence": "list",
      "List-ID": "<academic.notices.example.edu>",
    },
    attachments: [],
  },
  {
    id: "ann-003",
    from: "warden.office@example.edu",
    subject: "ACTION REQUIRED: Mandatory hostel room inventory inspection form",
    receivedAt: "2026-10-08T11:00:00.000Z",
    preview: "Submit your signed room inventory verification form to the hostel block warden.",
    body: "Dear Residents,\n\nAll residents must submit their signed room inventory verification by Thursday evening. Failure to submit may result in a maintenance deposit hold.\n\nPlease download and print the attached checklist.",
    headers: {
      "Precedence": "list",
      "List-ID": "<hostel.notices.example.edu>",
    },
    attachments: [attachmentFixtures[1]],
  },
  {
    id: "ann-004",
    from: "library@example.edu",
    subject: "Library hours during the mid-semester break",
    receivedAt: "2026-10-07T12:00:00.000Z",
    preview: "The central library will operate on reduced hours (09:00 - 18:00) during break week.",
    body: "Please be advised that the Central Library will operate under revised timings during the mid-semester recess from 15 October to 20 October. Regular 24-hour reading rooms remain open with valid student ID.",
    headers: {
      "Precedence": "bulk",
      "List-ID": "<library.alerts.example.edu>",
    },
    attachments: [],
  },
  {
    id: "ann-005",
    from: "clubs@example.edu",
    subject: "Reminder: robotics orientation room updated",
    receivedAt: "2026-10-06T16:45:00.000Z",
    preview: "The annual robotics orientation has been relocated to Seminar Hall B due to high attendance.",
    body: "The orientation session today will now be hosted in Seminar Hall B instead of Audi 1. All freshmen and returning members welcome.",
    headers: {
      "List-ID": "<clubs.studentlife.example.edu>",
    },
    attachments: [],
  },
  {
    id: "ann-006",
    from: "health.center@example.edu",
    subject: "Upcoming annual flu vaccination drive on campus",
    receivedAt: "2026-10-05T08:00:00.000Z",
    preview: "Walk-in flu vaccinations available at Student Health Center next Tuesday and Wednesday.",
    body: "The campus health clinic is providing complimentary seasonal influenza vaccinations for all enrolled students and staff.",
    headers: {
      "Precedence": "bulk",
    },
    attachments: [],
  },

  // --- Unrelated Mock Conversations (Must be excluded by the announcement feed) ---
  {
    id: "chat-001",
    from: "alex.kumar@student.example.edu",
    subject: "Lunch at food court?",
    receivedAt: "2026-10-10T12:05:00.000Z",
    preview: "Hey are you going to the food court after the algorithms lecture?",
    body: "Hey, let me know if you want to grab lunch together around 12:45.",
    headers: {},
    attachments: [],
  },
  {
    id: "chat-002",
    from: "priya.sharma@student.example.edu",
    subject: "Did you solve question 4 on the assignment?",
    receivedAt: "2026-10-09T18:20:00.000Z",
    preview: "I am stuck on the dynamic programming problem, want to compare notes?",
    body: "Hey, are you free this evening? Question 4 on the problem set is really tricky.",
    headers: {},
    attachments: [],
  },
  {
    id: "chat-003",
    from: "rahul.gupta@student.example.edu",
    subject: "Lost blue umbrella near sports complex",
    receivedAt: "2026-10-08T15:10:00.000Z",
    preview: "Left my blue umbrella by the badminton court yesterday, did anyone see it?",
    body: "If anyone picked up a dark blue umbrella near Court 2, please ping me!",
    headers: {},
    attachments: [],
  },
] as const;

/**
 * Deterministic filter identifying whether a mail message is a broadcast/campus announcement
 * or an unrelated 1-on-1 personal conversation.
 */
export function isAnnouncementMail(msg: {
  from: string;
  subject: string;
  headers?: Readonly<Record<string, string>>;
}): boolean {
  const from = msg.from.toLowerCase();
  const subject = msg.subject.toLowerCase();
  const headers = msg.headers || {};

  // 1. Mailing list or bulk broadcast headers
  if (headers["List-ID"] || headers["list-id"] || headers["Precedence"] === "bulk" || headers["Precedence"] === "list") {
    return true;
  }

  // 2. Official broadcast / administrative senders
  const officialSenders = [
    "student.affairs@",
    "registrar@",
    "library@",
    "clubs@",
    "warden.office@",
    "admin.operations@",
    "health.center@",
    "notices@",
    "announcements@",
    "campus@",
  ];
  if (officialSenders.some((prefix) => from.includes(prefix))) {
    return true;
  }

  // 3. Announcement-style subject prefixes or keywords
  const broadcastKeywords = [
    "announcement",
    "notice:",
    "reminder:",
    "emergency:",
    "action required:",
    "mandatory",
    "registration closes",
    "operating hours",
    "vaccination drive",
  ];
  if (broadcastKeywords.some((keyword) => subject.includes(keyword))) {
    return true;
  }

  // Otherwise, it is an unrelated individual conversation
  return false;
}

/**
 * Converts a MailMessage to an Announcement entity with extracted priority and actions.
 */
export function normalizeMailToAnnouncement(msg: MailMessage): Announcement {
  const subject = msg.subject;
  const lowerSub = subject.toLowerCase();

  let priority: Announcement["priority"] = "informational";
  if (lowerSub.includes("emergency") || lowerSub.includes("urgent") || lowerSub.includes("immediate")) {
    priority = "urgent";
  } else if (lowerSub.includes("action required") || lowerSub.includes("registration closes") || lowerSub.includes("mandatory")) {
    priority = "action_required";
  } else if (lowerSub.includes("upcoming") || lowerSub.includes("schedule") || lowerSub.includes("drive")) {
    priority = "upcoming";
  }

  const actions: ActionItem[] = [];
  if (priority === "action_required" || priority === "urgent") {
    actions.push({
      id: `act-${msg.id}`,
      text: msg.preview,
      source: {
        field: "subject",
        start: 0,
        end: msg.subject.length,
        text: msg.subject,
      },
      needsConfirmation: false,
    });
  }

  return {
    id: msg.id,
    from: msg.from,
    subject: msg.subject,
    receivedAt: msg.receivedAt,
    preview: msg.preview,
    priority,
    category: msg.headers["X-Campus-Category"] || "General",
    actions: actions.length > 0 ? actions : undefined,
    body: msg.body,
    attachments: msg.attachments,
  };
}

/**
 * Filtered, normalized announcement fixtures for testing and development.
 */
export const mockAnnouncementsFixture: readonly Announcement[] = rawMockMessages
  .filter(isAnnouncementMail)
  .map(normalizeMailToAnnouncement);
