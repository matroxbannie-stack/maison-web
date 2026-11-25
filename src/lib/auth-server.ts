export const REFRESH_COOKIE = 'maison_rt';

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'
).replace(/\/$/, '');

export type AuthPayload = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_expires_in?: number;
  user?: unknown;
  message?: string;
  code?: string;
  errors?: unknown;
};

export type ApiResult = {
  ok: boolean;
  status: number;
  data: AuthPayload | null;
};

// The refresh token lives only in this httpOnly cookie. JavaScript in the browser can never read it.
export function refreshCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: maxAgeSeconds,
  };
}

export async function callApi(
  path: string,
  init: { method?: string; body?: unknown; token?: string } = {},
): Promise<ApiResult> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (init.token) headers.Authorization = 'Bearer ' + init.token;

  const res = await fetch(API_URL + path, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });

  let data: AuthPayload | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}