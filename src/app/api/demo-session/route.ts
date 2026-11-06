import { NextRequest, NextResponse } from 'next/server';
import { createDemoSession, demoUsers, readDemoSession } from '../../../announcements/session';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ user: null, demo: false });
  return NextResponse.json({ user: readDemoSession(request.cookies.get('signal-demo-session')?.value), demo: true }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'DEMO_DISABLED' }, { status: 403 });
  if (request.headers.get('origin') !== `${request.nextUrl.protocol}//${request.headers.get('host')}`) return NextResponse.json({ error: 'INVALID_ORIGIN' }, { status: 403 });
  let user: unknown;
  try { ({ user } = await request.json()); } catch { return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 }); }
  if (typeof user !== 'string' || !(demoUsers as readonly string[]).includes(user)) return NextResponse.json({ error: 'INVALID_USER' }, { status: 400 });
  const response = NextResponse.json({ user, demo: true });
  response.cookies.set('signal-demo-session', createDemoSession(user), { httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:', path: '/', maxAge: 8 * 3600 });
  return response;
}
