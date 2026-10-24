/** Provider IDs and cursors are opaque: consumers must never parse them. */
export interface MailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
}
export interface MailMessage {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  preview: string;
  body: string;
  headers: Readonly<Record<string, string>>;
  attachments: readonly MailAttachment[];
}
export type AnnouncementPriority = 'urgent' | 'action_required' | 'upcoming' | 'informational';
export interface ActionItem {
  id: string;
  text: string;
  source: { field: 'subject' | 'body'; start: number; end: number; text: string };
  deadline?: string;
  needsConfirmation: boolean;
}
/** Derived product data; never a raw Outlook or Gmail response. */
export interface Announcement {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  preview: string;
  priority?: AnnouncementPriority;
  category?: string;
  actions?: readonly ActionItem[];
}
export interface MailPage {
  messages: readonly MailMessage[];
  deletedIds: readonly string[];
  nextCursor?: string;
  /** Present only on the last page; persist after successfully applying all pages. */
  syncToken?: string;
}
export interface MailProvider {
  sync(request?: { cursor?: string; syncToken?: string }): Promise<MailPage>;
}
/** Validate unknown input before it crosses the provider boundary. */
export function isMailMessage(value: unknown): value is MailMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return ['id', 'from', 'subject', 'receivedAt', 'preview', 'body'].every(k => typeof m[k] === 'string')
    && Boolean(m.id) && Number.isFinite(Date.parse(m.receivedAt as string))
    && !!m.headers && typeof m.headers === 'object' && !Array.isArray(m.headers)
    && Object.values(m.headers).every(v => typeof v === 'string')
    && Array.isArray(m.attachments) && m.attachments.every(a => a && typeof a === 'object'
      && ['id', 'filename', 'mimeType'].every(k => typeof a[k] === 'string')
      && Number.isSafeInteger(a.sizeBytes) && a.sizeBytes >= 0
      && (a.url === undefined || typeof a.url === 'string'));
}
