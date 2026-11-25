import { API_BASE, ApiError } from '@/lib/api';

export type AdminUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  role: string;
  preferred_currency?: string;
  preferred_locale?: string;
};

type SessionPayload = {
  access_token: string;
  expires_in: number;
  user: AdminUser | null;
};

// In memory only: never localStorage, never a readable cookie.
let accessToken: string | null = null;
let expiresAt = 0;
let refreshing: Promise<SessionPayload | null> | null = null;

function store(p: SessionPayload) {
  accessToken = p.access_token;
  expiresAt = Date.now() + p.expires_in * 1000;
}

function clearToken() {
  accessToken = null;
  expiresAt = 0;
}

async function post(path: string, body?: unknown, token?: string): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = 'Bearer ' + token;
  return fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
    credentials: 'same-origin',
  });
}

// One refresh at a time. The refresh token rotates, so two parallel
// refreshes with the same cookie must never happen.
function doRefresh(): Promise<SessionPayload | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await post('/api/auth/refresh');
        if (!res.ok) {
          clearToken();
          return null;
        }
        const data = (await res.json()) as SessionPayload;
        store(data);
        return data;
      } catch {
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function fetchMe(token: string): Promise<AdminUser | null> {
  const res = await fetch(API_BASE + '/auth/me', {
    headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const j = await res.json();
  return (j?.data ?? j?.user ?? j) as AdminUser;
}

export async function restoreSession(): Promise<AdminUser | null> {
  const s = await doRefresh();
  if (!s) return null;
  return s.user ?? (await fetchMe(s.access_token));
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const res = await post('/api/auth/login', { email, password });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new ApiError(
      data?.message ?? 'Login failed.',
      res.status,
      String(data?.code ?? 'login_failed'),
    );
  }
  store(data as SessionPayload);
  const user = (data.user as AdminUser | null) ?? (await fetchMe(data.access_token));
  if (!user) throw new ApiError('Could not load your profile.', 500, 'profile_failed');
  return user;
}

async function getToken(): Promise<string> {
  if (accessToken && Date.now() < expiresAt - 30_000) return accessToken;
  const s = await doRefresh();
  if (!s) throw new ApiError('Session expired. Please sign in again.', 401, 'session_expired');
  return s.access_token;
}

export async function logout(): Promise<void> {
  try {
    await getToken();
  } catch {
    // ignore: we are signing out anyway
  }
  const token = accessToken;
  try {
    await post('/api/auth/logout', {}, token ?? undefined);
  } catch {
    // ignore
  }
  clearToken();
}

type FetchInit = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
};

export async function adminFetch<T = unknown>(path: string, init: FetchInit = {}): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(init.query ?? {})) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const url = API_BASE + path + (qs.toString() ? '?' + qs.toString() : '');

  const run = (token: string) =>
    fetch(url, {
      method: init.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
      signal: init.signal,
    });

  let res = await run(await getToken());
  if (res.status === 401) {
    clearToken();
    const s = await doRefresh();
    if (!s) throw new ApiError('Session expired. Please sign in again.', 401, 'session_expired');
    res = await run(s.access_token);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      data?.message ?? 'Request failed.',
      res.status,
      String(data?.code ?? 'request_failed'),
    );
  }
  return data as T;
}