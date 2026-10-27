import { expect, it } from 'vitest';
import { mockMessages } from './mock-provider';
import { extractMailActions, extractedDeadlineInfo } from './extraction';
const mail=(body:string, receivedAt='2026-10-23T20:00:00Z')=>({...mockMessages[0],subject:'Notice',body,receivedAt});
it.each([
 ['Submit by 24 October 2026 at 5 PM.','2026-10-24T11:30:00.000Z'],
 ['Submit by 24/10/2026 at 17:00.','2026-10-24T11:30:00.000Z'],
 ['Submit by 2026-10-24 at 17:00 UTC.','2026-10-24T17:00:00.000Z'],
 ['Submit tomorrow at 9 AM.','2026-10-25T03:30:00.000Z'],
 ['Submit today at 9 AM.','2026-10-24T03:30:00.000Z'],
 ['Submit in 2 days at 09:00.','2026-10-26T03:30:00.000Z'],
])('extracts %s', (body,instant)=>{
 const input=mail(body),before=structuredClone(input),r=extractMailActions(input);
 expect(r.deadlines).toHaveLength(1);expect(r.actions[0].deadline).toBe(instant);expect(r.deadlines[0].needsConfirmation).toBe(false);
 for(const d of r.deadlines)expect(input[d.source.field].slice(d.source.start,d.source.end)).toBe(d.source.text);
 expect(input).toEqual(before);
});
it.each(['Submit by 05/06/2026 at 9 AM.','Submit by 24 October at 5 PM.','Submit by Friday at 5 PM.','Submit by 24 October 2026.','Submit by 31 February 2026 at 9 AM.','Submit by 24 October 2026 at 13 PM.'])('flags ambiguity or invalid dates: %s',body=>{
 const r=extractMailActions(mail(body));expect(r.deadlines[0].needsConfirmation).toBe(true);expect(r.actions[0].deadline).toBeUndefined();
});
it('handles missing years, year rollover, and leap days',()=>{
 expect(extractMailActions(mail('Submit tomorrow at 9 AM.','2026-12-31T10:00:00Z')).actions[0].deadline).toBe('2027-01-01T03:30:00.000Z');
 expect(extractMailActions(mail('Submit by 29 February 2028 at 9 AM.')).actions[0].deadline).toBe('2028-02-29T03:30:00.000Z');
});
it('keeps multiple dates unassociated and preserves action-only notices',()=>{
 const r=extractMailActions(mail('Submit between 24 October 2026 at 9 AM and 25 October 2026 at 5 PM.'));
 expect(r.deadlines).toHaveLength(2);expect(r.actions[0].needsConfirmation).toBe(true);expect(r.actions[0].deadline).toBeUndefined();
 expect(extractMailActions(mail('Please upload the form.')).actions).toHaveLength(1);
 expect(extractMailActions(mail('We met on 24 October 2026 at 9 AM.')).deadlines).toEqual([]);
});
it('extracts subject deadlines and keeps source offsets valid with Unicode',()=>{
 const input={...mail('🎓 Please register by 24 October 2026 at 9 AM.'),subject:'Deadline: 24 October 2026 at 5 PM'};
 const r=extractMailActions(input);expect(r.deadlines).toHaveLength(2);
 for(const a of [...r.actions,...r.deadlines])expect(input[a.source.field].slice(a.source.start,a.source.end)).toBe(a.source.text);
});
it('returns warnings for invalid references without breaking message display',()=>{
 expect(extractMailActions(mail('Submit tomorrow.','bad')).warnings).toEqual(['INVALID_RECEIVED_TIME']);
 expect(extractMailActions(mail('Submit tomorrow.'),{timeZone:'bad'}).warnings).toEqual(['INVALID_TIME_ZONE']);
});
it('rejects repeated and nonexistent DST wall-clock deadlines',()=>{
 for(const body of ['Submit by 1 November 2026 at 1:30 AM.','Submit by 8 March 2026 at 2:30 AM.']) {
 const r=extractMailActions(mail(body),{timeZone:'America/New_York'});expect(r.deadlines[0].needsConfirmation).toBe(true);
 }
});
it('uses SIG-003 exact deadline states',()=>{
 const d=extractMailActions(mail('Submit by 24 October 2026 at 9 AM.')).deadlines[0];
 expect(extractedDeadlineInfo(d,'2026-10-24T03:30:00Z')?.state).toBe('today');
 expect(extractedDeadlineInfo(d,'2026-10-24T03:30:00.001Z')?.state).toBe('overdue');
});
