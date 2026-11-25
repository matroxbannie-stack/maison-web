'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

type NavItem = { label: string; href: string }

const EXTRA: NavItem[] = [
  { label: 'About MAISON', href: '/about' },
  { label: 'Contact us', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping and returns', href: '/shipping-returns' },
]

const subscribe = () => () => {}

export function MobileMenu({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div
                key="mobile-menu"
                className="fixed inset-0 z-[60] lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
              >
                <motion.div
                  className="absolute inset-0 bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={close}
                />
                <motion.aside
                  className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-background shadow-xl"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <div className="flex h-16 items-center justify-between border-b border-border px-5">
                    <span className="font-heading text-xl font-semibold tracking-[0.3em]">
                      MAISON
                    </span>
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={close}
                      autoFocus
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
                    >
                      <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  </div>

                  <nav
                    className="flex-1 overflow-y-auto px-5 py-6"
                    aria-label="Mobile"
                  >
                    <ul className="space-y-1">
                      {nav.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className={
                              'block py-3 text-lg font-medium uppercase tracking-wider ' +
                              (item.label === 'Sale' ? 'text-red-600' : '')
                            }
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <ul className="mt-8 space-y-1 border-t border-border pt-6">
                      {EXTRA.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}