import { NextRequest, NextResponse } from 'next/server';

const WAITLIST_URL =
  process.env.WAITLIST_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/waitlist';

/**
 * Server-side proxy to the agent service's waitlist endpoint. The browser
 * never talks to the Railway domain directly — this avoids CORS entirely
 * and keeps the write path server-mediated (same discipline as the GET
 * fetches in lib/signalFeed.ts / lib/trackRecord.ts: hard timeout, never
 * throws a raw error back to the client).
 */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const email = typeof body?.email === 'string' ? body.email : '';
  const note = typeof body?.note === 'string' ? body.note : '';

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
