import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp, EMAIL_RE } from '@/lib/rateLimit';

const WAITLIST_URL =
  process.env.WAITLIST_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/waitlist';

export async function POST(req: NextRequest) {
  if (!rateLimit(`waitlist:${clientIp(req)}`, 8, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate limited' }, { status: 429 });
  }

  let body: { email?: unknown; note?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  // Honeypot: the visible form ships a hidden "website" field humans never
  // fill. A value here is a bot — pretend success, store nothing.
  if (typeof body?.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const note = typeof body?.note === 'string' ? body.note : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(WAITLIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, note }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({ ok: false, error: 'bad response' }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'signup service unreachable, try again shortly' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
