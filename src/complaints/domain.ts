/** Shared operational categories. Sensitive reports must use official channels. */
export const complaintCategories = {
  wifi: 'Wi-Fi', water: 'Water', electricity: 'Electricity', washrooms: 'Washrooms',
  laundry: 'Laundry', cleanliness: 'Cleanliness', broken_facility: 'Broken facility',
  hostel_maintenance: 'Hostel maintenance', queues: 'Queues',
} as const;
export type ComplaintCategory = keyof typeof complaintCategories;
export const complaintStatuses = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'closed'] as const;
export type ComplaintStatus = typeof complaintStatuses[number];

export type DomainErrorCode = 'INVALID_INPUT' | 'INVALID_CATEGORY' | 'INVALID_STATUS'
  | 'INVALID_TRANSITION' | 'PUBLIC_UPDATE_REQUIRED' | 'CLOSURE_REASON_REQUIRED' | 'INVALID_TIMESTAMP';
export type Result<T> = { ok: true; value: T } | { ok: false; code: DomainErrorCode };
export type SourceStatusEvent = {
  status: ComplaintStatus;
  at: string;
  publicUpdate: string;
  moderatorId?: string;
  internalNote?: string;
};
export interface Complaint {
  id: string;
  category: ComplaintCategory;
  location: string;
  title: string;
  description: string;
  reporterId: string;
  publicAnonymous: boolean;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  history: readonly SourceStatusEvent[];
}
export interface PublicComplaint {
  id: string;
  category: ComplaintCategory;
  location: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  history: { status: ComplaintStatus; at: string; publicUpdate: string }[];
}
export interface ModeratorComplaint extends PublicComplaint {
  reporterId: string;
  publicAnonymous: boolean;
  history: SourceStatusEvent[];
}
export type SubmissionResult = Result<Complaint> | {
  ok: false;
  code: 'OFFICIAL_CHANNEL_REQUIRED';
  channel: 'official_university_service';
  message: string;
};
const sensitiveCategories = new Set([
  'harassment', 'assault', 'medical', 'disciplinary', 'named_person',
  'sexual_harassment', 'sexual_assault', 'medical_emergency', 'named_person_complaint',
]);
const transitions: Record<ComplaintStatus, readonly ComplaintStatus[]> = {
  submitted: ['acknowledged', 'closed'],
  acknowledged: ['in_progress', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: ['closed'],
  closed: [],
};
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function isComplaintCategory(value: unknown): value is ComplaintCategory {
  return typeof value === 'string' && Object.hasOwn(complaintCategories, value);
}
export function isComplaintStatus(value: unknown): value is ComplaintStatus {
  return typeof value === 'string' && complaintStatuses.some(status => status === value);
}
function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function timestamp(value: string): boolean {
  // Require an explicit timezone and reject rolled-over calendar dates.
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [, year, month, day, hour, minute, second] = match.map(Number);
  return year >= 100 && month >= 1 && month <= 12 && day >= 1
    && day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
    && hour <= 23 && minute <= 59 && second <= 59;
}
/** Pass identity, ID and clock from trusted server context; this function does no storage. */
export function createComplaint(input: unknown, context: { id: string; reporterId: string; now: string }): SubmissionResult {
  if (!object(input)) return { ok: false, code: 'INVALID_INPUT' };
  // Return no title, description or identity for sensitive category responses.
  const category = typeof input.category === 'string'
    ? input.category.trim().toLowerCase().replace(/[\s-]+/g, '_') : input.category;
  if (typeof category === 'string' && sensitiveCategories.has(category)) {
    return { ok: false, code: 'OFFICIAL_CHANNEL_REQUIRED', channel: 'official_university_service',
      message: 'Please contact the appropriate official university service. This report has not been stored.' };
  }
  if (!isComplaintCategory(category)) return { ok: false, code: 'INVALID_CATEGORY' };
  if (!text(input.location, 200) || !text(input.title, 160) || !text(input.description, 4000)
    || typeof input.publicAnonymous !== 'boolean' || !text(context.id, 200) || !text(context.reporterId, 200)) {
    return { ok: false, code: 'INVALID_INPUT' };
  }
  if (!timestamp(context.now)) return { ok: false, code: 'INVALID_TIMESTAMP' };
  return { ok: true, value: {
    id: context.id, reporterId: context.reporterId, category,
    location: input.location.trim(), title: input.title.trim(), description: input.description.trim(),
    publicAnonymous: input.publicAnonymous, status: 'submitted', createdAt: context.now, updatedAt: context.now,
    history: [{ status: 'submitted', at: context.now, publicUpdate: 'Report submitted.' }],
  } };
}
/** Application layer authorizes moderators and persists with optimistic concurrency. */
export function transitionComplaint(complaint: Complaint, input: unknown, context: { moderatorId: string; now: string }): Result<Complaint> {
  if (!isComplaintStatus(complaint.status)) return { ok: false, code: 'INVALID_STATUS' };
  if (!object(input)) return { ok: false, code: 'INVALID_INPUT' };
  if (!isComplaintStatus(input.status)) return { ok: false, code: 'INVALID_STATUS' };
  if (!transitions[complaint.status].includes(input.status)) return { ok: false, code: 'INVALID_TRANSITION' };
  if (!text(input.publicUpdate, 2000)) return { ok: false, code: 'PUBLIC_UPDATE_REQUIRED' };
  if (input.status === 'closed' && complaint.status !== 'resolved' && !text(input.closureReason, 2000)) {
    return { ok: false, code: 'CLOSURE_REASON_REQUIRED' };
  }
  if (!text(context.moderatorId, 200) || (input.internalNote !== undefined && !text(input.internalNote, 4000))) {
    return { ok: false, code: 'INVALID_INPUT' };
  }
  if (!timestamp(context.now) || !timestamp(complaint.updatedAt)
    || Date.parse(context.now) < Date.parse(complaint.updatedAt)) return { ok: false, code: 'INVALID_TIMESTAMP' };
  const publicUpdate = input.status === 'closed' && complaint.status !== 'resolved'
    ? `${input.publicUpdate.trim()} Reason: ${(input.closureReason as string).trim()}` : input.publicUpdate.trim();
  return { ok: true, value: { ...complaint, status: input.status, updatedAt: context.now,
    history: [...complaint.history, { status: input.status, at: context.now, publicUpdate,
      moderatorId: context.moderatorId, ...(input.internalNote === undefined ? {} : { internalNote: input.internalNote.trim() }) }],
  } };
}
/** Explicit allowlist: reporter identifiers and internal notes never enter public responses. */
export function toPublicComplaint(complaint: Complaint): PublicComplaint {
  return {
    id: complaint.id, category: complaint.category, location: complaint.location,
    title: complaint.title, description: complaint.description, status: complaint.status,
    createdAt: complaint.createdAt, updatedAt: complaint.updatedAt,
    history: complaint.history.map(event => ({ status: event.status, at: event.at, publicUpdate: event.publicUpdate })),
  };
}
/** Call only after authorization; return detached data so consumers cannot mutate domain history. */
export function toModeratorComplaint(complaint: Complaint): ModeratorComplaint {
  return { ...toPublicComplaint(complaint), reporterId: complaint.reporterId, publicAnonymous: complaint.publicAnonymous,
    history: complaint.history.map(event => ({ status: event.status, at: event.at, publicUpdate: event.publicUpdate,
      ...(event.moderatorId === undefined ? {} : { moderatorId: event.moderatorId }),
      ...(event.internalNote === undefined ? {} : { internalNote: event.internalNote }),
    })),
  };
}
