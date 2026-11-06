import { NextRequest } from 'next/server';
import { afterEach, expect, it, vi } from 'vitest';
import { createDemoSession } from './session';
import { GET, PATCH } from '../app/api/announcement-state/route';
import { POST as signIn } from '../app/api/demo-session/route';
const repository=vi.hoisted(()=>({list:vi.fn(),update:vi.fn()}));
vi.mock('./state-repository',()=>({stateRepository:repository}));
afterEach(()=>{vi.restoreAllMocks();vi.clearAllMocks();vi.unstubAllEnvs();});
function request(method='GET',body?:unknown,user='demo-student-a',origin='http://localhost:3000') {
 return new NextRequest('http://localhost:3000/api/announcement-state?user=someone-else',{method,headers:{host:'localhost:3000',cookie:`signal-demo-session=${createDemoSession(user)}`,origin,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
}
it('requires a valid server session and ignores client-supplied user identity',async()=>{
 expect((await GET(new NextRequest('http://localhost:3000/api/announcement-state'))).status).toBe(401);
 repository.list.mockResolvedValue({});expect((await GET(request())).status).toBe(200);expect(repository.list).toHaveBeenCalledWith('demo-student-a');
 repository.update.mockResolvedValue({saved:true,handled:false,snoozedUntil:null,version:1});
 expect((await PATCH(request('PATCH',{id:'ann-001',patch:{saved:true},version:0,user:'other'}))).status).toBe(200);
 expect(repository.update).toHaveBeenCalledWith('demo-student-a','ann-001',{saved:true},0);
});
it('rejects cross-origin writes, stale versions, and malformed patches',async()=>{
 expect((await PATCH(request('PATCH',{id:'a',patch:{saved:true},version:0},'demo-student-a','https://other.example'))).status).toBe(403);
 expect((await PATCH(request('PATCH',{id:'a',patch:{saved:'bad'},version:0}))).status).toBe(400);
 repository.update.mockRejectedValue(new Error('VERSION_CONFLICT'));expect((await PATCH(request('PATCH',{id:'a',patch:{saved:true},version:0}))).status).toBe(409);
});
it('disables synthetic sign-in/state in production and returns safe storage errors',async()=>{
 repository.list.mockRejectedValue(new Error('private filesystem path'));const r=await GET(request());expect(r.status).toBe(503);expect(await r.text()).not.toContain('private');
 vi.stubEnv('NODE_ENV','production');expect((await GET(request())).status).toBe(401);expect((await signIn(request('POST',{user:'demo-student-a'}))).status).toBe(403);
});
it('issues an HttpOnly session for a known demo profile only',async()=>{
 const r=await signIn(request('POST',{user:'demo-student-b'}));expect(r.status).toBe(200);
 const cookie=r.headers.get('set-cookie');expect(cookie).toContain('HttpOnly');expect(cookie).toContain('SameSite=strict');
 expect((await signIn(request('POST',{user:'someone-else'}))).status).toBe(400);
});
