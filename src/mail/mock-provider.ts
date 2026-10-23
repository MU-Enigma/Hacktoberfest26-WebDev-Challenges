import { mockMail } from '../data/mock-data';
import { attachmentFixtures } from '../data/attachment-fixtures';
import { isMailMessage, type MailMessage, type MailPage, type MailProvider } from './contracts';
export const mockMessages: readonly MailMessage[] = [
  ...mockMail.map(m => ({ ...m, body: m.preview, headers: {}, attachments: [] })),
  { id: 'chat', from: 'friend@example.edu', subject: 'Lunch?', receivedAt: '2026-10-07T12:00:00Z', preview: 'Meet at noon?', body: 'Meet at noon?', headers: {}, attachments: [] },
  { id: 'attachment', from: 'office@example.edu', subject: 'Notice: campus map', receivedAt: '2026-10-07T13:00:00Z', preview: 'Updated map attached.', body: 'Updated map attached.', headers: {'list-id':'campus'}, attachments: attachmentFixtures.slice(0, 2) },
];
const revision: MailMessage = { ...mockMessages[0], id: 'revision', subject: 'Re: Course registration closes Friday', body: 'Updated: submit registration by 12 October.', headers: {'in-reply-to': 'mail-001'} };
/** Deterministic in-memory provider. Each instance owns its reset/failure state. */
export class MockMailProvider implements MailProvider {
  private revision = 0;
  private failures = 0;
  constructor(private readonly pageSize = 2) {
    if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new Error('INVALID_PAGE_SIZE');
  }
  reset() { this.revision = 0; this.failures = 0; }
  advance() { this.revision = 1; }
  failNext() { this.failures++; }
  async sync(request: {cursor?: string; syncToken?: string} = {}): Promise<MailPage> {
    if (this.failures) { this.failures--; throw new Error('MOCK_UNAVAILABLE'); }
    if (request.cursor && request.syncToken) throw new Error('INVALID_REQUEST');
    let start = 0, since = -1, version = this.revision;
    if (request.cursor) {
      const match = /^mock-page:(-1|0|1):(0|1):(\d+)$/.exec(request.cursor);
      if (!match) throw new Error('INVALID_CURSOR');
      since = Number(match[1]); version = Number(match[2]); start = Number(match[3]);
    } else if (request.syncToken) {
      if (!/^mock-sync:[01]$/.test(request.syncToken)) throw new Error('INVALID_SYNC_TOKEN');
      since = Number(request.syncToken.split(':')[1]);
    }
    if (since > version || version > this.revision) throw new Error('STALE_CURSOR');
    const snapshot = version ? [...mockMessages.filter(m => m.id !== 'chat'), revision] : [...mockMessages];
    const changes = since === version ? [] : since < 0 ? snapshot : [revision];
    if (!Number.isSafeInteger(start) || start > changes.length) throw new Error('INVALID_CURSOR');
    const end = Math.min(start + this.pageSize, changes.length);
    return structuredClone({messages: changes.slice(start, end), deletedIds: since === 0 && version === 1 && start === 0 ? ['chat'] : [],
      ...(end < changes.length ? {nextCursor: `mock-page:${since}:${version}:${end}`} : {syncToken: `mock-sync:${version}`})});
  }
}
/** Raw malformed fixture used to exercise boundary rejection. */
export const malformedMockMessage: unknown = { ...mockMessages[0], receivedAt: 'invalid', attachments: 'bad' };
export function normalizeMockInput(records: readonly unknown[]): MailMessage[] {
  const seen = new Set<string>();
  return records.filter(isMailMessage).filter(m => !seen.has(m.id) && !!seen.add(m.id)).map(m => structuredClone(m));
}
