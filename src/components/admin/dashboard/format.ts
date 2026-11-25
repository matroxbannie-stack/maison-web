const ZERO_DECIMAL = new Set(['PKR', 'JPY']);

export function decimalsFor(currency: string): number {
  return ZERO_DECIMAL.has(currency) ? 0 : 2;
}

export function toMajor(minor: number, currency: string): number {
  return minor / Math.pow(10, decimalsFor(currency));
}

export function formatMoney(minor: number, currency: string): string {
  const d = decimalsFor(currency);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }).format(minor / Math.pow(10, d));
  } catch {
    return currency + ' ' + (minor / Math.pow(10, d)).toFixed(d);
  }
}

const NUMBER = new Intl.NumberFormat('en-US');
export function formatNumber(n: number): string {
  return NUMBER.format(n);
}

const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
export function formatCompact(n: number): string {
  return COMPACT.format(n);
}

export function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
