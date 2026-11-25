import { cn } from '@/lib/utils'
import { PAYMENT_STYLES, STATUS_STYLES, label } from './order-types'

const BASE = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium'

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn(BASE, STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground')}>{label(status)}</span>
}

export function PaymentBadge({ status }: { status: string }) {
  return <span className={cn(BASE, PAYMENT_STYLES[status] ?? 'bg-muted text-muted-foreground')}>{label(status)}</span>
}
