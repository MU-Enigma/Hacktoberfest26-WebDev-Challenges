import type { AnnouncementPriority, MailMessage } from './contracts';
export interface Classification {
  isAnnouncement: boolean;
  category: string;
  priority: AnnouncementPriority;
  confidence: number;
  reasons: readonly string[];
  needsReview: boolean;
}
export interface ClassificationRules {
  senderPatterns: readonly RegExp[];
  announcementKeywords: readonly string[];
  actionKeywords: readonly string[];
  urgentKeywords: readonly string[];
}
export const defaultRules: ClassificationRules = {
  senderPatterns: [/^(student\.affairs|library|clubs|office)@example\.edu$/i],
  announcementKeywords: ['notice', 'announcement', 'registration', 'orientation', 'library hours'],
  actionKeywords: ['submit', 'register', 'complete registration'],
  urgentKeywords: ['urgent', 'cancelled', 'emergency'],
};
function contains(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return phrase.trim().length > 0 && new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}
/** Pure rule engine: confidence expresses rule strength, not calibrated probability. */
export function classifyMail(mail: MailMessage, rules: ClassificationRules = defaultRules): Classification {
  const text = `${mail.subject}\n${mail.body}`;
  const reasons: string[] = [];
  const sender = rules.senderPatterns.some(p => new RegExp(p.source, p.flags.replace(/[gy]/g, '')).test(mail.from));
  const keyword = rules.announcementKeywords.some(k => contains(text,k));
  const broadcast = Object.entries(mail.headers).some(([k,v]) => ['list-id','list-unsubscribe'].includes(k.toLowerCase()) && v.trim().length > 0);
  const action = rules.actionKeywords.some(k => contains(text,k));
  const urgent = rules.urgentKeywords.some(k => contains(text,k));
  if (sender) reasons.push('Configured sender pattern matched');
  if (keyword) reasons.push('Announcement keyword matched');
  if (broadcast) reasons.push('Mailing-list header present');
  if (action) reasons.push('Required-action phrase matched');
  if (urgent) reasons.push('Urgency phrase matched');
  const score = Number(sender) + Number(keyword) + Number(broadcast);
  const isAnnouncement = score >= 2;
  const confidence = score >= 2 ? 0.9 : score === 1 || action || urgent ? 0.5 : 0.85;
  if (!reasons.length) reasons.push('No announcement signals matched');
  return {isAnnouncement, category: /\b(club|orientation|robotics)\b/i.test(text) ? 'clubs' : /\blibrary\b/i.test(text) ? 'library' : 'general',
    priority: urgent ? 'urgent' : action ? 'action_required' : 'informational', confidence, reasons, needsReview: confidence < 0.7};
}
export type ClassificationOverride = Pick<Classification, 'isAnnouncement' | 'category' | 'priority'>;
/** Caller supplies an authenticated user ID. No mutation of email or base rules. */
export class ClassificationOverrides {
  private values = new Map<string, Map<string, ClassificationOverride>>();
  set(userId: string, messageId: string, value: ClassificationOverride) {
    if (!userId || !messageId) throw new Error('USER_AND_MESSAGE_REQUIRED');
    if (typeof value.isAnnouncement !== 'boolean' || !value.category.trim() || !['urgent','action_required','upcoming','informational'].includes(value.priority)) throw new Error('INVALID_OVERRIDE');
    const perUser = this.values.get(userId) ?? new Map(); perUser.set(messageId, {...value}); this.values.set(userId,perUser);
  }
  clear(userId: string, messageId: string) { this.values.get(userId)?.delete(messageId); }
  resolve(userId: string, mail: MailMessage, rules = defaultRules): Classification {
    const base = classifyMail(mail,rules), override = this.values.get(userId)?.get(mail.id);
    return override ? {...base,...override,confidence:1,needsReview:false,reasons:['User override']} : base;
  }
}
