import { NextRequest, NextResponse } from 'next/server';
import { readDemoSession } from '../../../announcements/session';
import { stateRepository } from '../../../announcements/state-repository';
import { validatePatch } from '../../../announcements/state';
export const runtime = 'nodejs';
function userOf(request: NextRequest) {
  return process.env.NODE_ENV === 'production' ? null : readDemoSession(request.cookies.get('signal-demo-session')?.value);
}
export async function GET(request: NextRequest) {
  const user = userOf(request);
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  try { return NextResponse.json(await stateRepository.list(user), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'STATE_UNAVAILABLE' }, { status: 503 }); }
}
export async function PATCH(request: NextRequest) {
  const user = userOf(request);
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  if (request.headers.get('origin') !== `${request.nextUrl.protocol}//${request.headers.get('host')}`) return NextResponse.json({ error: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const { id, patch, version } = await request.json();
    if (typeof id !== 'string' || !validatePatch(patch) || !Number.isSafeInteger(version)) return NextResponse.json({ error: 'INVALID_UPDATE' }, { status: 400 });
    return NextResponse.json(await stateRepository.update(user, id, patch, version));
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    const status = code === 'VERSION_CONFLICT' ? 409 : code === 'INVALID_UPDATE' ? 400 : 503;
    return NextResponse.json({ error: status === 503 ? 'STATE_UNAVAILABLE' : code }, { status });
  }
}
