import type { MailMessage } from "../mail/contracts";
import { extractMailActions } from "../mail/extraction";
export interface RevisionGroup {
  id: string;
  messages: readonly MailMessage[];
  latest: MailMessage;
}
export interface RevisionSuggestion {
  key: string;
  older: MailMessage;
  newer: MailMessage;
}
export interface RevisionChange {
  field: "Deadline" | "Venue" | "Action";
  before: string;
  after: string;
}
export function normalizedSubject(subject: string): string {
  return subject
    .replace(/^(?:(?:re|fw|fwd):\s*)+/gi, "")
    .replace(/^\[(?:updated|correction)\]\s*/i, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
function header(mail: MailMessage, name: string) {
  return (
    Object.entries(mail.headers).find(
      ([key]) => key.toLowerCase() === name,
    )?.[1] ?? ""
  );
}
function references(mail: MailMessage): string[] {
  return `${header(mail, "in-reply-to")} ${header(mail, "references")}`
    .split(/\s+/)
    .filter(Boolean);
}
export function revisionKey(a: string, b: string): string {
  return JSON.stringify([a, b].sort());
}
/** Strong metadata plus matching sender/subject may group; subject alone only suggests. */
export function groupRevisions(
  messages: readonly MailMessage[],
  confirmed: ReadonlySet<string> = new Set(),
): { groups: RevisionGroup[]; suggestions: RevisionSuggestion[] } {
  const ordered = [...messages].sort(
    (a, b) =>
      Date.parse(a.receivedAt) - Date.parse(b.receivedAt) ||
      a.id.localeCompare(b.id),
  );
  const aliases = new Map<string, number>();
  for (const mail of ordered)
    for (const id of new Set(
      [mail.id, header(mail, "message-id")].filter(Boolean),
    ))
      aliases.set(id, (aliases.get(id) ?? 0) + 1);
  const parent = ordered.map((_m, i) => i);
  const root = (index: number): number => {
    while (parent[index] !== index) index = parent[index];
    return index;
  };
  const possible: RevisionSuggestion[] = [];
  for (let i = 0; i < ordered.length; i++)
    for (let j = i + 1; j < ordered.length; j++) {
      const a = ordered[i],
        b = ordered[j],
        subject = normalizedSubject(a.subject);
      if (
        !subject ||
        subject !== normalizedSubject(b.subject) ||
        a.from.trim().toLowerCase() !== b.from.trim().toLowerCase() ||
        !Number.isFinite(Date.parse(a.receivedAt)) ||
        !Number.isFinite(Date.parse(b.receivedAt))
      )
        continue;
      const uniqueIds = (m: MailMessage) =>
        [m.id, header(m, "message-id")]
          .filter(Boolean)
          .filter((id) => aliases.get(id) === 1);
      const thread =
        references(b).some((ref) => uniqueIds(a).includes(ref)) ||
        references(a).some((ref) => uniqueIds(b).includes(ref));
      const key = revisionKey(a.id, b.id),
        candidate =
          Math.abs(Date.parse(b.receivedAt) - Date.parse(a.receivedAt)) <=
            7 * 86400000 && a.body !== b.body;
      if (thread || (candidate && confirmed.has(key)))
        parent[root(j)] = root(i);
      else if (candidate) possible.push({ key, older: a, newer: b });
    }
  const buckets = new Map<number, MailMessage[]>();
  ordered.forEach((m, i) => {
    const key = root(i);
    buckets.set(key, [...(buckets.get(key) ?? []), m]);
  });
  const groups = [...buckets.values()].map((messages) => ({
    id: messages[0].id,
    messages,
    latest: messages[messages.length - 1],
  }));
  const groupedPairs = new Set<string>();
  for (const group of groups)
    for (const a of group.messages)
      for (const b of group.messages) groupedPairs.add(revisionKey(a.id, b.id));
  return {
    groups: groups.sort(
      (a, b) =>
        Date.parse(b.latest.receivedAt) - Date.parse(a.latest.receivedAt),
    ),
    suggestions: possible.filter((p) => !groupedPairs.has(p.key)),
  };
}
function instructionFields(mail: MailMessage) {
  const extraction = extractMailActions(mail);
  const venue =
    /(?:\b(?:venue|room|location)\s*:\s*)([^\n.!?]+)/i
      .exec(`${mail.subject}\n${mail.body}`)?.[1]
      ?.trim() ?? "";
  return {
    Deadline: extraction.deadlines.map((d) => d.source.text).join(" · "),
    Venue: venue,
    Action: extraction.actions.map((a) => a.text).join(" · "),
  };
}
export function revisionChanges(
  before: MailMessage,
  after: MailMessage,
): RevisionChange[] {
  const a = instructionFields(before),
    b = instructionFields(after);
  return (["Deadline", "Venue", "Action"] as const)
    .filter((field) => a[field] !== b[field])
    .map((field) => ({
      field,
      before: a[field] || "Not stated",
      after: b[field] || "Not stated",
    }));
}
