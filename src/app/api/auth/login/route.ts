import { NextResponse } from 'next/server';
import { REFRESH_COOKIE, callApi, refreshCookieOptions } from '@/lib/auth-server';

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json(
      { message: 'Email and password are required.', code: 'invalid_request' },
      { status: 422 },
    );
  }

  try {
    const r = await callApi('/auth/login', {
      method: 'POST',
      body: { email: body.email, password: body.password },
    });

    if (!r.ok || !r.data?.access_token || !r.data.refresh_token) {
      return NextResponse.json(
        {
          message: r.data?.message ?? 'Login failed.',
          code: r.data?.code ?? 'login_failed',
        },
        { status: r.ok ? 502 : r.status },
      );
    }

    const res = NextResponse.json({
      access_token: r.data.access_token,
      expires_in: r.data.expires_in ?? 900,
      user: r.data.user ?? null,
    });
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