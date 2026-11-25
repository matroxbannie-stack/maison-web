'use client'

import { useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { CartDrawer } from '@/components/cart/cart-drawer'

export function CartButton() {
  const count = useCartStore((s) => (s.cart ? s.cart.item_count : 0))
  const openDrawer = useCartStore((s) => s.openDrawer)
  const refresh = useCartStore((s) => s.refresh)

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <>
      <button
        type="button"
        aria-label={count > 0 ? 'Bag, ' + count + ' items' : 'Bag'}
        onClick={openDrawer}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
        {count > 0 ? (
          <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold leading-none text-background">
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </button>
      <CartDrawer />
    </>
  )
}