import { expect, it } from 'vitest';
import { mockAnnouncementsFixture as items } from '../data/announcement-fixtures';
import { filterAnnouncements, filterURL, noFilters, parseFilters } from './filters';
import { emptyState } from './state';
it('round-trips URL filters while preserving unrelated parameters and clearing selection',()=>{
 const f={...noFilters,q:'room & forms',sender:'office',handled:'no',from:'2026-10-01'};
 const url=filterURL('http://localhost/announcements?simulate=ready&id=ann-001#anchor',f);
 expect(parseFilters(new URL(url).searchParams)).toEqual(f);expect(url).toContain('simulate=ready');expect(url).not.toContain('id=');expect(url).toContain('#anchor');
 const cleared=filterURL(url,noFilters);expect(new URL(cleared).searchParams.toString()).toBe('simulate=ready');
});
it('sanitizes invalid dates/enums and applies AND filters',()=>{
 expect(parseFilters(new URLSearchParams('from=2026-02-30&priority=invalid&attachment=bad&handled=bad'))).toEqual(noFilters);
 const f={...noFilters,q:'room',sender:'warden',priority:'action_required',attachment:'yes',category:'general',handled:'yes'};
 expect(filterAnnouncements(items,f,{'ann-003':{...emptyState,handled:true}}).map(x=>x.id)).toEqual(['ann-003']);
 expect(filterAnnouncements(items,f,{})).toEqual([]);
});
it('filters inclusive calendar dates in the configured India timezone',()=>{
 const sample={...items[0],receivedAt:'2026-10-09T20:00:00Z'};
 expect(filterAnnouncements([sample],{...noFilters,from:'2026-10-10',to:'2026-10-10'},{})).toHaveLength(1);
 expect(filterAnnouncements([sample],{...noFilters,to:'2026-10-09'},{})).toHaveLength(0);
 expect(filterAnnouncements(items,{...noFilters,from:'2026-10-12',to:'2026-10-01'},{})).toEqual([]);
});
it('searches bodies case-insensitively and filters attachment absence',()=>{
 expect(filterAnnouncements(items,{...noFilters,q:'prerequisite requirements'},{}).map(x=>x.id)).toEqual(['ann-002']);
 expect(filterAnnouncements(items,{...noFilters,attachment:'no'},{}).every(x=>!x.attachments?.length)).toBe(true);
});
it('restores past URL snapshots and never mutates input data',()=>{
 const before=structuredClone(items);const initial=filterURL('http://localhost/announcements?simulate=ready',noFilters);
 const second=filterURL(initial,{...noFilters,q:'library'});
 expect(filterAnnouncements(items,parseFilters(new URL(second).searchParams),{})).toHaveLength(1);
 expect(filterAnnouncements(items,parseFilters(new URL(initial).searchParams),{})).toHaveLength(items.length);expect(items).toEqual(before);
});
