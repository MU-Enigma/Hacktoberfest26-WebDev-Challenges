import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { emptyState, validatePatch, type AnnouncementState, type StateMap, type StatePatch } from './state';
/** Local mock persistence; use one instance per server. Stores state only, never mail. */
export class AnnouncementStateRepository {
  private tail: Promise<unknown> = Promise.resolve();
  constructor(private readonly directory: string) {}
  private file(user: string) {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(user)) throw new Error('INVALID_USER');
    return join(this.directory, `${user}.json`);
  }
  async list(user: string): Promise<StateMap> {
    const file = this.file(user);
    try { return JSON.parse(await readFile(file, 'utf8')) as StateMap; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}; throw error; }
  }
  update(user: string, id: string, patch: StatePatch, version: number, now = Date.now()): Promise<AnnouncementState> {
    const task = this.tail.then(async () => {
      if (!/^[a-zA-Z0-9_-]{1,120}$/.test(id) || ['__proto__','constructor','prototype'].includes(id)
        || !validatePatch(patch, now) || !Number.isSafeInteger(version) || version < 0) throw new Error('INVALID_UPDATE');
      const states = await this.list(user), before = states[id] ?? emptyState;
      if (before.version !== version) throw new Error('VERSION_CONFLICT');
      const next = { ...before, ...patch, version: version + 1 };
      await mkdir(this.directory, { recursive: true });
      const file = this.file(user), temporary = `${file}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify({ ...states, [id]: next }), { mode: 0o600 });
      await rename(temporary, file);
      return next;
    });
    this.tail = task.catch(() => undefined);
    return task;
  }
}
export const stateRepository = new AnnouncementStateRepository(join(process.cwd(), '.signal-mock', 'announcement-state'));
