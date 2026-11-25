import { Truck, Banknote, PackageCheck } from 'lucide-react';

const ITEMS = [
  {
    icon: Truck,
    title: 'Complimentary Shipping',
    desc: 'Free standard delivery on orders over $100.',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    desc: 'Pay conveniently at your doorstep on eligible orders.',
  },
  {
    icon: PackageCheck,
    title: 'Order Tracking',
    desc: 'Follow your parcel from dispatch to delivery.',
  },
];

export function Services() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 px-4 sm:px-6 lg:px-8">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-4 py-8 sm:px-6 first:sm:pl-0 last:sm:pr-0">
              <Icon className="h-5 w-5 shrink-0 text-foreground mt-0.5" strokeWidth={1.5} />
              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.15em]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Services;