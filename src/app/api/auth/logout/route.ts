import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE, callApi, refreshCookieOptions } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (token) {
    try {
      await callApi('/auth/logout', {
        method: 'POST',
        token,
        body: refreshToken ? { refresh_token: refreshToken } : {},
      });
    } catch {
      // Even if the API call fails, the cookie is still removed below.
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(REFRESH_COOKIE, '', refreshCookieOptions(0));
  return res;
}