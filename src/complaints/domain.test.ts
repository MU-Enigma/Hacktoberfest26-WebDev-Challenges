import { describe, expect, it } from 'vitest';
import {
  complaintCategories, complaintStatuses, createComplaint, isComplaintCategory,
  isComplaintStatus, toModeratorComplaint, toPublicComplaint, transitionComplaint,
  type Complaint, type ComplaintStatus,
} from './domain';
const input = { category: 'wifi', location: 'Hostel A common area', title: 'Intermittent Wi-Fi',
  description: 'Connection drops in the shared common area.', publicAnonymous: true };
const context = { id: 'complaint-demo', reporterId: 'student-demo', now: '2026-10-27T09:00:00Z' };
const moderator = { moderatorId: 'moderator-demo', now: '2026-10-27T10:00:00Z' };
function complaint(): Complaint {
  const result = createComplaint(input, context);
  if (!result.ok) throw new Error('Fixture was rejected');
  return result.value;
}
describe('complaint submission domain', () => {
  it.each(Object.keys(complaintCategories))('accepts approved category %s', category => {
    const result = createComplaint({ ...input, category }, context);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.category).toBe(category);
      expect(result.value.status).toBe('submitted');
      expect(result.value.history).toEqual([{ status: 'submitted', at: context.now, publicUpdate: 'Report submitted.' }]);
    }
  });
  it.each(['harassment', 'assault', 'medical', 'disciplinary', 'named_person', 'Sexual Assault', 'named-person-complaint'])(
    'routes sensitive category %s without returning report details', category => {
      const result = createComplaint({ ...input, category, description: 'PRIVATE-REPORT-CONTENT' }, context);
      expect(result).toMatchObject({ ok: false, code: 'OFFICIAL_CHANNEL_REQUIRED', channel: 'official_university_service' });
      expect(result).not.toHaveProperty('value');
      expect(JSON.stringify(result)).not.toMatch(/PRIVATE-REPORT-CONTENT|student-demo/);
    },
  );
  it.each(['__proto__', 'constructor', 'toString', 'placement', '', null, 42])('rejects unapproved category %s', category => {
    expect(createComplaint({ ...input, category }, context)).toEqual({ ok: false, code: 'INVALID_CATEGORY' });
    expect(isComplaintCategory(category)).toBe(false);
  });
  it.each(['location', 'title', 'description', 'publicAnonymous'])('rejects invalid field %s', field => {
    expect(createComplaint({ ...input, [field]: '' }, context)).toEqual({ ok: false, code: 'INVALID_INPUT' });
  });
  it('rejects non-objects, oversized text, and invalid server context', () => {
    for (const value of [null, [], 42]) expect(createComplaint(value, context)).toEqual({ ok: false, code: 'INVALID_INPUT' });
    for (const [field, max] of [['title', 160], ['location', 200], ['description', 4000]] as const) {
      expect(createComplaint({ ...input, [field]: 'a'.repeat(max + 1) }, context)).toEqual({ ok: false, code: 'INVALID_INPUT' });
    }
    expect(createComplaint(input, { ...context, reporterId: '' })).toEqual({ ok: false, code: 'INVALID_INPUT' });
    for (const now of ['bad', '2026-02-30T09:00:00Z', '2026-10-27T09:00:00']) {
      expect(createComplaint(input, { ...context, now })).toEqual({ ok: false, code: 'INVALID_TIMESTAMP' });
    }
  });
  it('uses server-owned identity/status and ignores extra request fields', () => {
    const result = createComplaint({ ...input, id: 'injected', reporterId: 'attacker', status: 'closed', history: [] }, context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toMatchObject({ id: context.id, reporterId: context.reporterId, status: 'submitted' });
  });
});
describe('status transitions', () => {
  const allowed = new Set(['submitted:acknowledged', 'submitted:closed', 'acknowledged:in_progress',
    'acknowledged:closed', 'in_progress:resolved', 'in_progress:closed', 'resolved:closed']);
  for (const from of complaintStatuses) for (const to of complaintStatuses) {
    it(`${from} -> ${to}`, () => {
      const before = { ...complaint(), status: from };
      const result = transitionComplaint(before, { status: to, publicUpdate: 'Maintenance update', closureReason: 'Duplicate report' }, moderator);
      expect(result.ok).toBe(allowed.has(`${from}:${to}`));
      if (!result.ok) expect(result.code).toBe('INVALID_TRANSITION');
      else expect(result.value.history.at(-1)).toMatchObject({ status: to, moderatorId: moderator.moderatorId });
    });
  }
  it('requires a public update and a reason for unresolved closure', () => {
    expect(transitionComplaint(complaint(), { status: 'acknowledged', publicUpdate: ' ' }, moderator)).toEqual({ ok: false, code: 'PUBLIC_UPDATE_REQUIRED' });
    expect(transitionComplaint(complaint(), { status: 'closed', publicUpdate: 'Closing' }, moderator)).toEqual({ ok: false, code: 'CLOSURE_REASON_REQUIRED' });
    const result = transitionComplaint(complaint(), { status: 'closed', publicUpdate: 'Closing', closureReason: 'Duplicate of demo-2' }, moderator);
    if (!result.ok) throw new Error('Expected closure');
    expect(toPublicComplaint(result.value).history.at(-1)?.publicUpdate).toContain('Duplicate of demo-2');
  });
  it('rejects legacy/unknown states and backdated events with stable errors', () => {
    expect(isComplaintStatus('in_review')).toBe(false);
    expect(transitionComplaint(complaint(), { status: 'in_review' }, moderator)).toEqual({ ok: false, code: 'INVALID_STATUS' });
    expect(transitionComplaint({ ...complaint(), status: 'in_review' as ComplaintStatus }, { status: 'closed' }, moderator)).toEqual({ ok: false, code: 'INVALID_STATUS' });
    expect(transitionComplaint(complaint(), { status: 'acknowledged', publicUpdate: 'Received' }, { ...moderator, now: '2026-01-01T10:00:00Z' })).toEqual({ ok: false, code: 'INVALID_TIMESTAMP' });
  });
});
describe('public/moderator boundary', () => {
  it.each([true, false])('keeps identity and private notes out of public fields (anonymous=%s)', publicAnonymous => {
    const before = { ...complaint(), publicAnonymous };
    const snapshot = structuredClone(before);
    const result = transitionComplaint(before, { status: 'acknowledged', publicUpdate: 'Maintenance notified.', internalNote: 'PRIVATE-MODERATOR-NOTE' }, moderator);
    if (!result.ok) throw new Error('Expected valid transition');
    const withUnexpectedFields = { ...result.value, privateEmail: 'private@example.edu' };
    const publicView = toPublicComplaint(withUnexpectedFields);
    expect(Object.keys(publicView).sort()).toEqual(['id','category','location','title','description','status','createdAt','updatedAt','history'].sort());
    expect(Object.keys(publicView.history[1]).sort()).toEqual(['status','at','publicUpdate'].sort());
    expect(JSON.stringify(publicView)).not.toMatch(/student-demo|moderator-demo|PRIVATE-MODERATOR-NOTE|private@example.edu|reporterId|internalNote/);
    const privateView = toModeratorComplaint(withUnexpectedFields);
    expect(privateView.reporterId).toBe(context.reporterId);
    expect(privateView.history[1].internalNote).toBe('PRIVATE-MODERATOR-NOTE');
    expect(privateView).not.toHaveProperty('privateEmail');
    publicView.history[0].publicUpdate = 'mutated'; privateView.history[1].internalNote = 'mutated';
    expect(result.value.history[0].publicUpdate).toBe('Report submitted.');
    expect(result.value.history[1].internalNote).toBe('PRIVATE-MODERATOR-NOTE');
    expect(before).toEqual(snapshot);
  });
});
