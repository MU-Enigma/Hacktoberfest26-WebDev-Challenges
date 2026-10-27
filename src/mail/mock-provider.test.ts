import { expect, it } from 'vitest';
import { MockMailProvider, mockMessages, malformedMockMessage, normalizeMockInput } from './mock-provider';
it('paginates a pinned snapshot, replays pages and reports incremental changes', async () => {
 const p = new MockMailProvider(2); const first = await p.sync(); p.advance();
 expect(await p.sync({cursor:first.nextCursor})).toEqual(await p.sync({cursor:first.nextCursor}));
 const second = await p.sync({cursor:first.nextCursor}); const last = await p.sync({cursor:second.nextCursor});
 expect([...first.messages,...second.messages,...last.messages]).toEqual(mockMessages);
 const delta = await p.sync({syncToken:last.syncToken}); expect(delta.messages[0].id).toBe('revision'); expect(delta.deletedIds).toEqual(['chat']);
 expect((await p.sync({syncToken:delta.syncToken})).messages).toEqual([]);
});
it('resets deterministically and isolates failures', async () => {
 const p = new MockMailProvider(); const first = await p.sync(); p.failNext(); await expect(p.sync()).rejects.toThrow('MOCK_UNAVAILABLE');
 expect(await p.sync()).toEqual(first); p.advance(); p.reset(); expect(await p.sync()).toEqual(first);
 expect(await new MockMailProvider().sync()).toEqual(first);
});
it('rejects invalid requests and deduplicates malformed input safely', async () => {
 const p = new MockMailProvider(); await expect(p.sync({cursor:'oops'})).rejects.toThrow(); await expect(p.sync({syncToken:'oops'})).rejects.toThrow();
 expect(normalizeMockInput([mockMessages[0], malformedMockMessage, mockMessages[0]])).toEqual([mockMessages[0]]);
});
