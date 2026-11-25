'use client'

import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement
    const isDark = root.classList.toggle('dark')
    try {
      localStorage.setItem('maison_theme', isDark ? 'dark' : 'light')
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
    >
      <Moon className="h-5 w-5 dark:hidden" strokeWidth={1.5} />
      <Sun className="hidden h-5 w-5 dark:block" strokeWidth={1.5} />
    </button>
  )
}

export default ThemeToggle