import type { Announcement } from '../mail/contracts';
import { APP_TIME_ZONE } from '../config/application';
import type { StateMap } from './state';
export interface AnnouncementFilters { q:string; sender:string; from:string; to:string; category:string; priority:string; attachment:string; handled:string }
export const filterKeys = ['q','sender','from','to','category','priority','attachment','handled'] as const;
export const noFilters:AnnouncementFilters = {q:'',sender:'',from:'',to:'',category:'',priority:'',attachment:'',handled:''};
function validDate(s:string) {return /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;}
export function parseFilters(params:URLSearchParams):AnnouncementFilters {
 const f={...noFilters};for(const key of filterKeys)f[key]=(params.get(key)??'').slice(0,200);
 if(!validDate(f.from))f.from='';if(!validDate(f.to))f.to='';
 if(!['','urgent','action_required','upcoming','informational'].includes(f.priority))f.priority='';
 if(!['','yes','no'].includes(f.attachment))f.attachment='';if(!['','yes','no'].includes(f.handled))f.handled='';
 return f;
}
export function filterURL(url:string,filters:AnnouncementFilters):string {
 const next=new URL(url);for(const key of filterKeys){if(filters[key])next.searchParams.set(key,filters[key]);else next.searchParams.delete(key);}
 next.searchParams.delete('id');return next.toString();
}
function dayInZone(instant:string) {
 if(!Number.isFinite(Date.parse(instant)))return '';
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:APP_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(instant));
 return ['year','month','day'].map(k=>parts.find(p=>p.type===k)?.value).join('-');
}
export function filterAnnouncements(items:readonly Announcement[],f:AnnouncementFilters,states:StateMap):Announcement[] {
 if(f.from&&f.to&&f.from>f.to)return [];
 const lower=(s:string)=>s.toLocaleLowerCase('en-GB');
 return items.filter(item=>{
  const date=dayInZone(item.receivedAt), handled=states[item.id]?.handled??false;
  return (!f.q || lower([item.subject,item.preview,item.body??''].join(' ')).includes(lower(f.q.trim())))
   && (!f.sender || lower(item.from).includes(lower(f.sender.trim())))
   && (!f.from || (!!date&&date>=f.from)) && (!f.to || (!!date&&date<=f.to))
   && (!f.category || lower(item.category??'')===lower(f.category))
   && (!f.priority || (item.priority??'informational')===f.priority)
   && (!f.attachment || (f.attachment==='yes')===!!item.attachments?.length)
   && (!f.handled || (f.handled==='yes')===handled);
 });
}
export function activeFilters(filters:AnnouncementFilters):string[] {
 return filterKeys.filter(key=>!!filters[key]).map(key=>`${key}: ${filters[key]}`);
}
