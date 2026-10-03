export const mockMail = [
  {
    id: "mail-001",
    from: "student.affairs@example.edu",
    subject: "Course registration closes Friday",
    receivedAt: "2026-10-05T09:30:00.000Z",
    preview: "Complete registration before 5:00 PM on 9 October.",
  },
  {
    id: "mail-002",
    from: "library@example.edu",
    subject: "Library hours during the mid-semester break",
    receivedAt: "2026-10-06T12:15:00.000Z",
    preview: "The library will use revised opening hours next week.",
  },
  {
    id: "mail-003",
    from: "clubs@example.edu",
    subject: "Reminder: robotics orientation room updated",
    receivedAt: "2026-10-07T06:45:00.000Z",
    preview: "The orientation has moved to Seminar Hall B.",
  },
] as const;

export const mockComplaints = [
  {
    id: "complaint-001",
    category: "wifi",
    title: "Intermittent connection on hostel floor 3",
    location: "Hostel A, floor 3 common area",
    status: "submitted",
  },
  {
    id: "complaint-002",
    category: "water",
    title: "Drinking-water cooler is not dispensing",
    location: "Academic block, east wing",
    status: "in_review",
  },
  {
    id: "complaint-003",
    category: "broken_facility",
    title: "Loose desk hinge in seminar hall",
    location: "Seminar Hall B",
    status: "resolved",
  },
] as const;
