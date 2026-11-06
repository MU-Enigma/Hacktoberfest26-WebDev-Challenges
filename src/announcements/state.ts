export interface AnnouncementState { saved: boolean; handled: boolean; snoozedUntil: string | null; version: number }
export type StatePatch = Partial<Pick<AnnouncementState, 'saved' | 'handled' | 'snoozedUntil'>>;
export type StateMap = Record<string, AnnouncementState>;
export const emptyState: AnnouncementState = { saved: false, handled: false, snoozedUntil: null, version: 0 };
export function validatePatch(value: unknown, now = Date.now()): value is StatePatch {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(([key, v]) => {
    if (key === 'saved' || key === 'handled') return typeof v === 'boolean';
    if (key !== 'snoozedUntil') return false;
    return v === null || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v)
      && Number.isFinite(Date.parse(v)) && Date.parse(v) > now && Date.parse(v) <= now + 366 * 86400000);
  });
}
export function isSnoozed(state: AnnouncementState | undefined, now: number): boolean {
  return !!state?.snoozedUntil && Date.parse(state.snoozedUntil) > now;
}
/** Apply immediately, then roll back exactly this item if persistence fails. */
export async function optimisticUpdate(
  id: string, patch: StatePatch, get: () => StateMap, publish: (state: StateMap) => void,
  persist: (version: number) => Promise<AnnouncementState>,
): Promise<void> {
  const previous = get()[id] ?? emptyState;
  publish({ ...get(), [id]: { ...previous, ...patch } });
  try { const result = await persist(previous.version); publish({ ...get(), [id]: result }); }
  catch (error) { publish({ ...get(), [id]: previous }); throw error; }
}
