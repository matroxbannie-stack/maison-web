import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Women', href: '/c/women' },
      { label: 'Men', href: '/c/men' },
      { label: 'Kids', href: '/c/kids' },
      { label: 'Footwear', href: '/c/footwear' },
      { label: 'Sale', href: '/c/sale' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Delivery', href: '/shipping-returns' },
      { label: 'Order tracking', href: '#' },
      { label: 'Size guide', href: '#' },
      { label: 'Contact us', href: '/contact' }, { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About MAISON', href: '/about' },
      { label: 'Careers', href: '#' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <p className="font-heading text-2xl font-semibold tracking-[0.3em]">MAISON</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Considered clothing and footwear, made to last. Designed with a quiet eye for detail.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-widest">{col.title}</h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>&copy; 2026 MAISON. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Cash on delivery available</p>
            <Link href="/admin" className="transition-colors hover:text-foreground">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter