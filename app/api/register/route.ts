import { NextRequest, NextResponse } from 'next/server';

const REGISTER_URL =
  process.env.REGISTER_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/register';

// Same server-mediated-proxy discipline as /api/waitlist: the browser
// never talks to the Railway domain directly, hard timeout, never
// throws a raw error back to the client.
export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({ ok: false, error: 'bad response' }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'registration service unreachable, try again shortly' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
