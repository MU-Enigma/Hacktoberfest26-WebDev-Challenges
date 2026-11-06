'use client';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { activeFilters, filterURL, noFilters, parseFilters, type AnnouncementFilters } from '../announcements/filters';
function subscribe(listener:()=>void) {
 window.addEventListener('popstate',listener);window.addEventListener('signal-filters',listener);
 return()=>{window.removeEventListener('popstate',listener);window.removeEventListener('signal-filters',listener);};
}
const snapshot=()=>window.location.search;
export function useAnnouncementFilters() {
 const query=useSyncExternalStore(subscribe,snapshot,()=>''), filters=useMemo(()=>parseFilters(new URLSearchParams(query)),[query]);
 const setFilters=useCallback((value:AnnouncementFilters)=>{
   const url=filterURL(window.location.href,value);
   if(url!==window.location.href){window.history.pushState({},'',url);window.dispatchEvent(new Event('signal-filters'));}
 },[]);
 return {filters,setFilters,clear:()=>setFilters({...noFilters})};
}
export function AnnouncementFilterControls({filters:f,onChange,clear,categories}:{filters:AnnouncementFilters;onChange:(f:AnnouncementFilters)=>void;clear:()=>void;categories:readonly string[]}) {
 const [draft,setDraft]=useState<string|null>(null);
 useEffect(()=>{if(draft===null)return;const timer=setTimeout(()=>{onChange({...f,q:draft});setDraft(null);},300);return()=>clearTimeout(timer);},[draft,f,onChange]);
 useEffect(()=>{const back=()=>setDraft(null);window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 const update=(key:keyof AnnouncementFilters,value:string)=>{setDraft(null);onChange({...f,q:draft??f.q,[key]:value});};
 return <fieldset className="announcement-filter-panel"><legend>Search and filters</legend>
   <div className="announcement-filter-grid">
    <label>Search announcements<input type="search" value={draft??f.q} onChange={e=>setDraft(e.target.value)} /></label>
    <label>Sender contains<input value={f.sender} onChange={e=>update('sender',e.target.value)} /></label>
    <label>Received from<input type="date" value={f.from} onChange={e=>update('from',e.target.value)} /></label>
    <label>Received through<input type="date" value={f.to} onChange={e=>update('to',e.target.value)} /></label>
    <label>Category<select value={f.category} onChange={e=>update('category',e.target.value)}><option value="">All categories</option>{[...new Set([...categories,...(f.category?[f.category]:[])])].map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Priority<select value={f.priority} onChange={e=>update('priority',e.target.value)}><option value="">All priorities</option><option value="urgent">Urgent</option><option value="action_required">Action required</option><option value="upcoming">Upcoming</option><option value="informational">Informational</option></select></label>
    <label>Attachments<select value={f.attachment} onChange={e=>update('attachment',e.target.value)}><option value="">With or without attachments</option><option value="yes">Has attachments</option><option value="no">No attachments</option></select></label>
    <label>Handled state<select value={f.handled} onChange={e=>update('handled',e.target.value)}><option value="">All announcements</option><option value="yes">Handled</option><option value="no">Not handled</option></select></label>
   </div>
   <p>Date range uses the application timezone. {f.from&&f.to&&f.from>f.to?'The start date must be on or before the end date.':''}</p>
   <button type="button" className="classic-button" onClick={()=>{setDraft(null);clear();}}>Clear all filters</button>
   {activeFilters(f).length>0&&<p>Active filters: {activeFilters(f).join(' · ')}</p>}
 </fieldset>;
}
export function NoAnnouncementResults({filters,clear}:{filters:AnnouncementFilters;clear:()=>void}) {
 return <section className="feed-state-box" aria-label="No matching announcements"><h2>No matching announcements</h2>
  <p>{activeFilters(filters).length?`Active filters: ${activeFilters(filters).join(' · ')}`:'No announcements are currently visible.'}</p>
  <button type="button" className="classic-button" onClick={clear}>Clear all filters</button></section>;
}
