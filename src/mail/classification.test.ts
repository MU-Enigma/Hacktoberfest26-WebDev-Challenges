import { expect, it } from 'vitest';
import { mockMessages } from './mock-provider';
import { classifyMail, defaultRules, ClassificationOverrides } from './classification';
const base = mockMessages[0];
const labeled = [
 {mail:base, expected:true},
 {mail:mockMessages[1], expected:true},
 {mail:mockMessages[2], expected:true},
 {mail:mockMessages[3], expected:false},
 {mail:mockMessages[4], expected:true},
 {mail:{...base,from:'friend@example.edu',subject:'Re: lunch',body:'See you at noon',headers:{}},expected:false},
];
it('evaluates synthetic labeled fixtures with precision and recall', () => {
 let tp=0,fp=0,fn=0;
 for(const row of labeled) {const p=classifyMail(row.mail); if(p.isAnnouncement && row.expected)tp++; if(p.isAnnouncement && !row.expected)fp++; if(!p.isAnnouncement && row.expected)fn++;}
 expect({precision:tp/(tp+fp),recall:tp/(tp+fn)}).toEqual({precision:1,recall:1});
});
it('keeps ambiguous results reviewable and uses bounded keywords', () => {
 expect(classifyMail({...base,from:'unknown@example.edu'}).needsReview).toBe(true);
 expect(classifyMail({...base,from:'unknown@example.edu',subject:'registration',body:'',headers:{'List-ID':'students'}}).isAnnouncement).toBe(true);
 expect(classifyMail({...base,subject:'unregistered',body:'',headers:{}},{...defaultRules,announcementKeywords:['registered']}).needsReview).toBe(true);
 expect(classifyMail({...base,subject:'Urgent registration',body:'Submit today'}).priority).toBe('urgent');
});
it('does not mutate email or stateful regex rules', () => {
 const before=structuredClone(base), rules={...defaultRules,senderPatterns:[/example.edu/g]};
 expect(classifyMail(base,rules)).toEqual(classifyMail(base,rules)); expect(base).toEqual(before);
});
it('isolates overrides per user and supports undo', () => {
 const store=new ClassificationOverrides(); const before=structuredClone(base);
 store.set('alice',base.id,{isAnnouncement:false,category:'personal',priority:'informational'});
 expect(store.resolve('alice',base).isAnnouncement).toBe(false); expect(store.resolve('bob',base)).toEqual(classifyMail(base));
 store.clear('alice',base.id); expect(store.resolve('alice',base)).toEqual(classifyMail(base)); expect(base).toEqual(before);
});
