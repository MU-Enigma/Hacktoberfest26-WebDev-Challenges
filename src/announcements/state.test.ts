import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { AnnouncementStateRepository } from './state-repository';
import { emptyState, isSnoozed, optimisticUpdate, validatePatch, type StateMap } from './state';
import { createDemoSession, readDemoSession } from './session';
const directories:string[]=[];
async function repository() { const dir=await mkdtemp(join(tmpdir(),'signal-state-'));directories.push(dir);return new AnnouncementStateRepository(dir); }
afterEach(async()=>{await Promise.all(directories.splice(0).map(dir=>rm(dir,{recursive:true,force:true})));});
it('persists state through a new repository and isolates users',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'signal-state-'));directories.push(dir);const r=new AnnouncementStateRepository(dir);
 await r.update('demo-student-a','ann-001',{saved:true,handled:true},0);
 expect((await new AnnouncementStateRepository(dir).list('demo-student-a'))['ann-001'].saved).toBe(true);
 expect(await r.list('demo-student-b')).toEqual({});
 await r.update('demo-student-a','ann-001',{handled:false},1);
 expect((await r.list('demo-student-a'))['ann-001']).toMatchObject({saved:true,handled:false,version:2});
});
it('serializes writes and detects stale updates without losing another item',async()=>{
 const r=await repository();await Promise.all([r.update('a','first',{saved:true},0),r.update('a','second',{handled:true},0)]);
 expect(Object.keys(await r.list('a'))).toHaveLength(2);
 await expect(r.update('a','first',{saved:false},0)).rejects.toThrow('VERSION_CONFLICT');
 await expect(r.update('../outside','first',{saved:false},0)).rejects.toThrow('INVALID_USER');
 await expect(r.update('a','__proto__',{saved:true},0)).rejects.toThrow('INVALID_UPDATE');
});
it('reappears exactly at snooze expiry and rejects invalid updates',()=>{
 const now=Date.parse('2026-11-06T10:00:00Z'), s={...emptyState,snoozedUntil:new Date(now+1000).toISOString()};
 expect(isSnoozed(s,now)).toBe(true);expect(isSnoozed(s,now+1000)).toBe(false);
 for(const patch of [{saved:'yes'},{userId:'b'},{snoozedUntil:'bad'},{snoozedUntil:new Date(now-1).toISOString()},{}]) expect(validatePatch(patch,now)).toBe(false);
 expect(validatePatch({snoozedUntil:s.snoozedUntil},now)).toBe(true);
});
it('updates optimistically and rolls back only the failed item',async()=>{
 let state:StateMap={};let fail!:(error:Error)=>void;
 const request=optimisticUpdate('first',{saved:true},()=>state,s=>{state=s;},()=>new Promise((_r,reject)=>{fail=reject;}));
 expect(state.first.saved).toBe(true);state={...state,second:{...emptyState,handled:true}};
 const assertion=expect(request).rejects.toThrow('offline');fail(new Error('offline'));await assertion;
 expect(state.first).toEqual(emptyState);expect(state.second.handled).toBe(true);
});
it('validates signed demo sessions and expiry',()=>{
 const token=createDemoSession('demo-student-a');expect(readDemoSession(token)).toBe('demo-student-a');
 expect(readDemoSession(token.replace('student-a','student-b'))).toBeNull();expect(readDemoSession(token,Date.now()+9*3600000)).toBeNull();
 expect(readDemoSession(undefined)).toBeNull();expect(()=>createDemoSession('other')).toThrow('INVALID_USER');
});
