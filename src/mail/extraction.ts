import { APP_TIME_ZONE } from '../config/application';
import { getDeadlineInfo, type DeadlineInfo } from '../utils/date-time';
import type { ActionItem, MailMessage } from './contracts';

type Source = ActionItem['source'];
export interface ExtractedDeadline {
  source: Source;
  instant?: string;
  needsConfirmation: boolean;
  reason?: string;
}
export interface ExtractionResult {
  deadlines: ExtractedDeadline[];
  actions: ActionItem[];
  warnings: string[];
}
const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
// Bounded vocabulary: unsupported expressions remain readable in the original mail.
const datePattern = /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/.-]\d{1,2}[/.-]\d{4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{4})?|today|tomorrow|in\s+\d{1,3}\s+days?|(?:(?:this|next)\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))\b(?:\s+(?:(?:at|by)\s+)?\d{1,2}(?::\d{2})?(?:\s*(?:a\.?m\.?|p\.?m\.?))?(?:\s+(?:IST|UTC|GMT))?)?/gi;
function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year:'numeric', month:'numeric', day:'numeric', hour:'numeric',minute:'numeric',second:'numeric',hourCycle:'h23' }).formatToParts(date);
  const read = (name: string) => Number(parts.find(p => p.type === name)?.value);
  return {year:read('year'),month:read('month'),day:read('day'),hour:read('hour'),minute:read('minute'),second:read('second')};
}
/** Resolve a wall-clock time conservatively; reject DST gaps and repeated times. */
function resolveLocal(year:number, month:number, day:number, hour:number, minute:number, zone:string): string | undefined {
  if (year < 100 || year > 9999 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year,month,0)).getUTCDate() || hour > 23 || minute > 59) return;
  const wall = Date.UTC(year,month-1,day,hour,minute);
  const matches = new Set<string>();
  for (const shift of [-24,-12,0,12,24]) {
    const sample = new Date(wall + shift*3600000), p = localParts(sample,zone);
    const offset = Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-sample.getTime();
    const candidate = new Date(wall-offset), c = localParts(candidate,zone);
    if (c.year===year && c.month===month && c.day===day && c.hour===hour && c.minute===minute) matches.add(candidate.toISOString());
  }
  return matches.size===1 ? [...matches][0] : undefined;
}
function parseDeadline(source: Source, received: Date, zone: string): ExtractedDeadline {
  const value=source.text;
  const time=/\s+(?:(?:at|by)\s+)?(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?(?:\s+(IST|UTC|GMT))?$/i.exec(value);
  const dateText=(time ? value.slice(0,time.index) : value).trim().toLowerCase();
  const reference=localParts(received,zone);
  let year=reference.year, month=reference.month, day=reference.day, reason: string | undefined;
  let match: RegExpExecArray | null;
  if ((match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText))) {
    [,year,month,day]=match.map(Number);
  } else if ((match=/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(dateText))) {
    day=Number(match[1]);month=Number(match[2]);year=Number(match[3]);
    if(day<=12 && month<=12 && day!==month) reason='Numeric date may use day/month or month/day order';
  } else if ((match=/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?$/.exec(dateText))) {
    day=Number(match[1]);month=months.indexOf(match[2].slice(0,3))+1;
    if(match[3]) year=Number(match[3]); else reason='Year omitted; confirm the year';
  } else {
    let delta=0;
    if(dateText==='tomorrow') delta=1;
    else if((match=/^in\s+(\d+)\s+days?$/.exec(dateText))) delta=Number(match[1]);
    else if(dateText!=='today') {
      const weekday=weekdays.findIndex(w=>dateText.endsWith(w));
      const referenceDay=new Date(Date.UTC(year,month-1,day)).getUTCDay();
      delta=(weekday-referenceDay+7)%7;
      if(dateText.startsWith('next ')) delta=delta||7;
      reason='Weekday reference requires confirmation';
    }
    const target=new Date(Date.UTC(year,month-1,day+delta));year=target.getUTCFullYear();month=target.getUTCMonth()+1;day=target.getUTCDate();
  }
  if(!time) return {source,needsConfirmation:true,reason:reason ?? 'Date has no explicit deadline time'};
  let hour=Number(time[1]);const minute=Number(time[2]??0), meridiem=time[3]?.replaceAll('.','').toLowerCase();
  if(meridiem && (hour<1 || hour>12)) return {source,needsConfirmation:true,reason:'Invalid 12-hour time'};
  if(meridiem) hour=hour%12+(meridiem==='pm'?12:0);
  if(reason?.startsWith('Numeric')) return {source,needsConfirmation:true,reason};
  const timeZone=time[4] ? (time[4].toUpperCase()==='IST'?'Asia/Kolkata':'UTC') : zone;
  const instant=resolveLocal(year,month,day,hour,minute,timeZone);
  return {source,instant,needsConfirmation:!!reason || !instant,reason:reason ?? (!instant?'Invalid or ambiguous local date/time':undefined)};
}
/** Stateless extraction; relative dates anchor to receipt time, never the machine clock. */
export function extractMailActions(mail: MailMessage, {timeZone=APP_TIME_ZONE}: {timeZone?:string} = {}): ExtractionResult {
  const result: ExtractionResult={deadlines:[],actions:[],warnings:[]};
  const received=new Date(mail.receivedAt);
  if(!Number.isFinite(received.getTime())) {result.warnings.push('INVALID_RECEIVED_TIME');return result;}
  try { localParts(received,timeZone); } catch {result.warnings.push('INVALID_TIME_ZONE');return result;}
  for(const field of ['subject','body'] as const) {
    const text=mail[field];
    for(const sentence of text.matchAll(/[^\n!?]+(?:[!?]|$)/g)) {
      // Split at sentence periods, preserving numeric dates and a.m./p.m. notation.
      const block=sentence[0];const offset=sentence.index!;
      for(const segment of block.matchAll(/.*?(?:\.(?=\s+[A-Z])|$)/g)) {
        if(!segment[0].trim()) continue;
        const content=segment[0], start=offset+segment.index!;
        const action=/\b(submit|register|complete|apply|pay|upload|attend|confirm|fill|send|respond)\b/i.test(content);
        const deadlineCue=/\b(deadline|due|closes?|before|by|last date)\b/i.test(content);
        const found: ExtractedDeadline[]=[];
        if(action || deadlineCue) {
          for(const match of content.matchAll(new RegExp(datePattern.source,datePattern.flags))) {
            const source:Source={field,start:start+match.index!,end:start+match.index!+match[0].length,text:match[0]};
            found.push(parseDeadline(source,received,timeZone));
          }
        }
        result.deadlines.push(...found);
        if(action) {
          const leading=content.length-content.trimStart().length, trimmed=content.trim();
          const source:Source={field,start:start+leading,end:start+leading+trimmed.length,text:trimmed};
          const only=found.length===1?found[0]:undefined;
          result.actions.push({id:`${mail.id}:${field}:${source.start}`,text:trimmed,source,
            deadline:only && !only.needsConfirmation ? only.instant : undefined,
            needsConfirmation:found.length>1 || !!only?.needsConfirmation});
        }
      }
    }
  }
  return result;
}
/** Use the merged SIG-003 utilities for display and exact deadline state. */
export function extractedDeadlineInfo(deadline: ExtractedDeadline, now: string, timeZone=APP_TIME_ZONE): DeadlineInfo | undefined {
  return deadline.needsConfirmation || !deadline.instant ? undefined : getDeadlineInfo(deadline.instant,{now,timeZone});
}
