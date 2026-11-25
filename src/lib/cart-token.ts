const KEY = 'maison_cart_token';

/** Guest cart token (a UUID). Call only in the browser. */
export function getCartToken(): string {
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;
    const token = crypto.randomUUID();
    window.localStorage.setItem(KEY, token);
    return token;
  } catch {
    return crypto.randomUUID();
  }
}