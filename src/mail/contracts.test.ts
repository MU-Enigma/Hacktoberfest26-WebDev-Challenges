import { describe, expect, it } from 'vitest';
import { mockMail } from '../data/mock-data';
import { attachmentFixtures } from '../data/attachment-fixtures';
import { isMailMessage, type MailMessage } from './contracts';
export const messages: MailMessage[] = mockMail.map(m => ({ ...m, body: m.preview, headers: {}, attachments: attachmentFixtures }));
describe('mail boundary', () => {
  it('accepts normalized synthetic fixtures', () => messages.forEach(m => expect(isMailMessage(m)).toBe(true)));
  it('rejects malformed provider data', () => {
    for (const value of [null, {}, { ...messages[0], receivedAt: 'bad' }, { ...messages[0], headers: [] }, { ...messages[0], attachments: [{id:'x',filename:'x',mimeType:'x',sizeBytes:-1}] }]) expect(isMailMessage(value)).toBe(false);
  });
});
