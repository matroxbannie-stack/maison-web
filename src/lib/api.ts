export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

export class ApiError extends Error {
  status: number;
  code: string;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code = 'error',
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

// The access token lives in memory only (never localStorage).
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  currency?: string;
  cartToken?: string;
  idempotencyKey?: string;
  auth?: boolean;
  signal?: AbortSignal;
};

type ErrorBody = {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = new URL(
    API_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, ''),
  );

  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.currency) headers['X-Currency'] = opts.currency;
  if (opts.cartToken) headers['X-Cart-Token'] = opts.cartToken;
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;
  if (accessToken && opts.auth !== false) {
    headers['Authorization'] = 'Bearer ' + accessToken;
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: 'no-store',
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const e = (json ?? {}) as ErrorBody;
    throw new ApiError(
      e.message ?? res.statusText,
      res.status,
      e.code ?? 'error',
      e.errors,
    );
  }

  return json as T;
}