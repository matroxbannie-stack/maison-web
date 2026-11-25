import { NextResponse } from 'next/server';
import { REFRESH_COOKIE, callApi, refreshCookieOptions } from '@/lib/auth-server';

const FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'password',
  'password_confirmation',
] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === 'object') body = parsed as Record<string, unknown>;
  } catch {
    body = {};
  }

  const payload: Record<string, string> = {};
  for (const f of FIELDS) {
    const v = body[f];
    if (typeof v === 'string' && v !== '') payload[f] = v;
  }

  try {
    const r = await callApi('/auth/register', { method: 'POST', body: payload });

    if (!r.ok || !r.data?.access_token || !r.data.refresh_token) {
      return NextResponse.json(
        {
          message: r.data?.message ?? 'Registration failed.',
          code: r.data?.code ?? 'register_failed',
          errors: r.data?.errors ?? null,
        },
        { status: r.ok ? 502 : r.status },
      );
    }

    const res = NextResponse.json({ user: r.data.user ?? null }, { status: 201 });
    res.cookies.set(
      REFRESH_COOKIE,
      r.data.refresh_token,
      refreshCookieOptions(r.data.refresh_expires_in ?? 2592000),
    );
    return res;
  } catch {
    return NextResponse.json(
      { message: 'Server is not reachable. Please try again.', code: 'api_unreachable' },
      { status: 502 },
    );
  }
}