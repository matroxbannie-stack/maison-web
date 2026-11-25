import { create } from 'zustand';
import { z } from 'zod';
import type { Money } from '@/stores/cart-store';

export type DeliveryOption = {
  code: string;
  name: string;
  description: string | null;
  min_days: number;
  max_days: number;
  price: Money;
  is_free: boolean;
  free_over: Money | null;
};

export type PlacedOrder = {
  order_number: string;
  email: string;
  items: {
    product_name: string;
    sku: string;
    color: unknown;
    size: unknown;
    image_url: string | null;
    quantity: number;
    line_total: Money;
  }[];
  totals: {
    subtotal: Money;
    discount: Money;
    shipping: Money;
    tax: Money;
    total: Money;
  };
};

// Confirm this list matches the countries you really ship to.
export const COUNTRIES = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
];

export const checkoutSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  full_name: z.string().trim().min(2, 'Enter your full name.').max(120, 'Name is too long.'),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number.'),
  line1: z.string().trim().min(5, 'Enter your street address.').max(190, 'Address is too long.'),
  line2: z.string().trim().max(190, 'Address is too long.'),
  city: z.string().trim().min(2, 'Enter your city.').max(100, 'City is too long.'),
  state: z.string().trim().max(100, 'State is too long.'),
  postal_code: z.string().trim().min(3, 'Enter your postal code.').max(20, 'Postal code is too long.'),
  country_code: z.string().length(2, 'Choose a country.'),
  customer_note: z.string().trim().max(500, 'Note is too long.'),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;

export const EMPTY_FORM: CheckoutForm = {
  email: '',
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country_code: 'PK',
  customer_note: '',
};

// Kept in memory only: the order contains personal details.
type LastOrderState = {
  order: PlacedOrder | null;
  address: CheckoutForm | null;
  save: (order: PlacedOrder, address: CheckoutForm) => void;
};

export const useLastOrder = create<LastOrderState>((set) => ({
  order: null,
  address: null,
  save: (order, address) => set({ order, address }),
}));

export function text(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    for (const k of ['name', 'label', 'code', 'message']) {
      const x = o[k];
      if (typeof x === 'string') return x;
    }
  }
  return '';
}

export function usd(minor: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minor / 100);
}
