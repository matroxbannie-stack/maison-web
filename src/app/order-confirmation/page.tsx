import type { Metadata } from 'next';
import { ConfirmationView } from '@/components/checkout/confirmation-view';

export const metadata: Metadata = {
  title: 'Order confirmation',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return <ConfirmationView />;
}
