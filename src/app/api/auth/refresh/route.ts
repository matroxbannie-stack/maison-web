import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE, callApi, refreshCookieOptions } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { message: 'No active session.', code: 'no_session' },
      { status: 401 },
    );
  }

  try {
    const r = await callApi('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    });

    if (!r.ok || !r.data?.access_token || !r.data.refresh_token) {
      // Remove the cookie only when the API clearly rejected the token.
      const rejected = r.status === 401 || r.status === 403 || r.status === 422;
      const res = NextResponse.json(
        {
          message: r.data?.message ?? 'Session expired.',
          code: r.data?.code ?? 'session_expired',
        },
        { status: rejected ? 401 : r.ok ? 502 : r.status },
      );
      if (rejected) res.cookies.set(REFRESH_COOKIE, '', refreshCookieOptions(0));
      return res;
    }

    const res = NextResponse.json({
      access_token: r.data.access_token,
      expires_in: r.data.expires_in ?? 900,
      user: r.data.user ?? null,
    });
    // The refresh token rotates: always store the new one.
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