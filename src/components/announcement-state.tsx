'use client';
import { useEffect, useRef, useState } from 'react';
import { emptyState, isSnoozed, optimisticUpdate, type StateMap, type StatePatch } from '../announcements/state';
export function useAnnouncementState() {
  const [session, setSession] = useState<{user:string | null;demo:boolean}>({user:null,demo:false});
  const [states, setStates] = useState<StateMap>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(0);
  const current = useRef(states); const busy = useRef(new Set<string>());
  const publish = (next:StateMap) => { current.current=next;setStates(next); };
  useEffect(() => {
    let active=true;
    (async()=>{
      try {
        const response=await fetch('/api/demo-session',{cache:'no-store'}); if(!response.ok) throw new Error();
        const identity=await response.json();
        if(!active)return;setSession(identity);
        if(identity.user) {
          const r=await fetch('/api/announcement-state',{cache:'no-store'});if(!r.ok)throw new Error();
          const data=await r.json();if(active){current.current=data;setStates(data);}
        }
        if(active)setReady(true);
      } catch {if(active)setError('Could not load your announcement state. Reload to retry.');}
    })();
    const tick=()=>setNow(Date.now());tick();const timer=setInterval(tick,1000);
    return()=>{active=false;clearInterval(timer);};
  },[]);
  async function signIn(user:string) {
    try {
      const r=await fetch('/api/demo-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user})});
      if(!r.ok)throw new Error();window.location.reload();
    } catch {setError('Could not switch demo profiles. Please retry.');}
  }
  async function update(id:string,patch:StatePatch) {
    if(busy.current.has(id)||!session.user||!ready)return;
    busy.current.add(id);setPending(new Set(busy.current));setError('');
    try {
      await optimisticUpdate(id,patch,()=>current.current,publish,async version=>{
        const r=await fetch('/api/announcement-state',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,patch,version})});
        if(!r.ok)throw new Error();return r.json();
      });
    } catch {setError('Change was not saved and has been undone. Reload if this announcement was updated in another tab.');}
    finally{busy.current.delete(id);setPending(new Set(busy.current));}
  }
  return {session,states,ready,error,pending,now,signIn,update};
}
export type AnnouncementStateController = ReturnType<typeof useAnnouncementState>;
export function AnnouncementStateSession({controller:c}:{controller:AnnouncementStateController}) {
  return <section className="announcement-profile" aria-label="Announcement profile">
    {c.session.demo ? <label>Local demo profile <select aria-label="Local demo profile" value={c.session.user??''} onChange={e=>void c.signIn(e.target.value)} disabled={c.pending.size>0}>
      <option value="" disabled>Choose a demo student</option><option value="demo-student-a">Demo student A</option><option value="demo-student-b">Demo student B</option>
    </select></label> : <p>Sign in through your campus account when account connection is available.</p>}
    {!c.ready&&!c.error&&<p role="status">Loading announcement preferences…</p>}
    {c.error&&<p role="alert">{c.error}</p>}
  </section>;
}
export function AnnouncementStateControls({id,controller:c}:{id:string;controller:AnnouncementStateController}) {
  const s=c.states[id]??emptyState, disabled=!c.ready||!c.session.user||c.pending.has(id);
  return <div className="announcement-state-controls" aria-label="Manage announcement">
    <button type="button" className="classic-button" aria-pressed={s.saved} disabled={disabled} onClick={()=>void c.update(id,{saved:!s.saved})}>{s.saved?'Unsave':'Save'}</button>
    <button type="button" className="classic-button" aria-pressed={s.handled} disabled={disabled} onClick={()=>void c.update(id,{handled:!s.handled})}>{s.handled?'Undo handled':'Mark handled'}</button>
    <button type="button" className="classic-button" disabled={disabled} onClick={()=>void c.update(id,{snoozedUntil:new Date(Date.now()+3600000).toISOString()})}>Snooze 1 hour</button>
    {isSnoozed(s,c.now)&&<button type="button" className="classic-button" disabled={disabled} onClick={()=>void c.update(id,{snoozedUntil:null})}>Unsnooze</button>}
    <span role="status">{s.saved?'Saved · ':''}{s.handled?'Handled':'Not handled'}{isSnoozed(s,c.now)?' · Snoozed':''}{c.pending.has(id)?' · Saving…':''}</span>
  </div>;
}
export function SnoozedAnnouncements({items,controller:c}:{items:readonly {id:string;subject:string}[];controller:AnnouncementStateController}) {
  const snoozed=items.filter(item=>isSnoozed(c.states[item.id],c.now));
  if(!snoozed.length)return null;
  return <details className="snoozed-announcements"><summary>Snoozed announcements ({snoozed.length})</summary>
    <ul>{snoozed.map(item=><li key={item.id}>{item.subject}<button className="classic-button" disabled={c.pending.has(item.id)} onClick={()=>void c.update(item.id,{snoozedUntil:null})}>Unsnooze</button></li>)}</ul>
  </details>;
}
