import Link from 'next/link'
import { User } from 'lucide-react'
import { CartButton } from '@/components/cart/cart-button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { SearchOverlay } from '@/components/layout/search-overlay'

const NAV = [
  { label: 'Women', href: '/c/women' },
  { label: 'Men', href: '/c/men' },
  { label: 'Kids', href: '/c/kids' },
  { label: 'Footwear', href: '/c/footwear' },
  { label: 'New Arrivals', href: '/c/new-arrivals' },
  { label: 'Sale', href: '/c/sale' },
]

export function SiteHeader() {
  return (
    <>
      <div className="bg-black px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white">
        Free standard delivery on orders over $100
      </div>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-5 lg:h-[72px] lg:px-10">
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  'text-[13px] font-medium uppercase tracking-wider transition-opacity hover:opacity-60 ' +
                  (item.label === 'Sale' ? 'text-red-600' : '')
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileMenu nav={NAV} />

          <Link
            href="/"
            className="font-heading text-2xl font-semibold tracking-[0.3em] lg:text-[28px]"
          >
            MAISON
          </Link>

          <div className="flex items-center justify-end gap-1">
            <SearchOverlay />
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-muted sm:inline-flex"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <CartButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  )
}

export default SiteHeader