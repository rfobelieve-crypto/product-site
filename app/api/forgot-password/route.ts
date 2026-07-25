import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp, EMAIL_RE } from '@/lib/rateLimit';

// Backend endpoint is NOT live yet (see fixes/README.md). Until
// FORGOT_PASSWORD_URL is set, this returns 503 and the form points users
// at the contact address instead of lying about an email being sent.
const FORGOT_URL = process.env.FORGOT_PASSWORD_URL;

export async function POST(req: NextRequest) {
  if (!rateLimit(`forgot:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate limited' }, { status: 429 });
  }

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
  }

  if (!FORGOT_URL) {
    return NextResponse.json({ ok: false, error: 'not configured' }, { status: 503 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(FORGOT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });
  } catch {
    // fall through — response below is identical either way
  } finally {
    clearTimeout(timeout);
  }
  // Always "ok" once configured — never confirms whether an email exists.
  return NextResponse.json({ ok: true });
}
