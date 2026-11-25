'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { getCartToken } from '@/lib/cart-token';

type Row = { name: string; ok: boolean; detail: string };

export default function ApiTestPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function run(name: string, fn: () => Promise<unknown>): Promise<Row> {
    try {
      const data = await fn();
      return { name, ok: true, detail: JSON.stringify(data).slice(0, 220) };
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.status + ' ' + e.code + ': ' + e.message
          : String(e);
      return { name, ok: false, detail: msg };
    }
  }

  async function test() {
    setBusy(true);
    const out: Row[] = [];
    out.push(await run('GET /ping', () => api('ping')));
    out.push(await run('GET /currencies', () => api('currencies')));
    out.push(
      await run('GET /cart (custom headers)', () =>
        api('cart', { cartToken: getCartToken(), currency: 'USD' }),
      ),
    );
    setRows(out);
    setBusy(false);
  }

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>API connection test</h1>
      <button
        onClick={test}
        disabled={busy}
        style={{ padding: '8px 16px', border: '1px solid currentColor' }}
      >
        {busy ? 'Testing...' : 'Test backend connection'}
      </button>

      <ul style={{ marginTop: 20, listStyle: 'none', padding: 0 }}>
        {rows.map((r) => (
          <li key={r.name} style={{ marginBottom: 14 }}>
            <strong>{r.ok ? 'OK ' : 'FAIL '}</strong>
            {r.name}
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.8 }}>
              {r.detail}
            </pre>
          </li>
        ))}
      </ul>
    </main>
  );
}