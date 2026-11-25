'use client'

import { useState } from 'react'
import { adminFetch } from '@/lib/admin-auth'
import { Btn, Field, INPUT, Modal, Notice } from '@/components/admin/common/kit'
import { errMsg } from '@/components/admin/common/use-admin-list'

export type Coupon = {
  id: number
  code: string
  description: string | null
  discount_type: string
  discount_value: number | null
  max_discount_minor: number | null
  min_subtotal_minor: number | null
  usage_limit_total: number | null
  usage_limit_per_user: number | null
  used_count: number
  excludes_sale_items: boolean
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  state: string
}

const money = (n: number | null) => (n == null ? '' : (n / 100).toFixed(2))
const toMinor = (s: string) => Math.round(Number(s) * 100)
const intOrNull = (s: string) => (s.trim() === '' ? null : Math.floor(Number(s)))
const toInputDate = (s: string | null) => (s ? s.replace(' ', 'T').slice(0, 16) : '')
const toApiDate = (s: string) => (s ? s.replace('T', ' ') + ':00' : null)

export function CouponForm({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null
  onClose: () => void
  onSaved: () => void
}) {
  const editing = coupon !== null
  const [code, setCode] = useState('')
  const [prefix, setPrefix] = useState('')
  const [description, setDescription] = useState(coupon?.description ?? '')
  const [type, setType] = useState(coupon?.discount_type ?? 'percentage')
  const [value, setValue] = useState(
    coupon ? (coupon.discount_type === 'percentage' ? String(coupon.discount_value ?? '') : money(coupon.discount_value)) : '',
  )
  const [maxDiscount, setMaxDiscount] = useState(money(coupon?.max_discount_minor ?? null))
  const [minSubtotal, setMinSubtotal] = useState(money(coupon?.min_subtotal_minor ?? null))
  const [limitTotal, setLimitTotal] = useState(coupon?.usage_limit_total != null ? String(coupon.usage_limit_total) : '')
  const [limitUser, setLimitUser] = useState(coupon?.usage_limit_per_user != null ? String(coupon.usage_limit_per_user) : '')
  const [excludeSale, setExcludeSale] = useState(coupon?.excludes_sale_items ?? false)
  const [startsAt, setStartsAt] = useState(toInputDate(coupon?.starts_at ?? null))
  const [expiresAt, setExpiresAt] = useState(toInputDate(coupon?.expires_at ?? null))
  const [active, setActive] = useState(coupon?.is_active ?? true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setError(null)
    let discountValue: number | null = null
    if (type === 'percentage') {
      const n = Number(value)
      if (!Number.isInteger(n) || n < 1 || n > 100) return setError('Percentage must be a whole number from 1 to 100.')
      discountValue = n
    } else if (type === 'fixed_amount') {
      const n = toMinor(value)
      if (!Number.isFinite(n) || n < 1) return setError('Enter the discount amount in USD.')
      discountValue = n
    }
    const body: Record<string, unknown> = {
      description: description.trim() || null,
      discount_type: type,
      discount_value: discountValue,
      max_discount_minor: type === 'percentage' && maxDiscount.trim() !== '' ? toMinor(maxDiscount) : null,
      min_subtotal_minor: minSubtotal.trim() !== '' ? toMinor(minSubtotal) : 0,
      usage_limit_total: intOrNull(limitTotal),
      usage_limit_per_user: intOrNull(limitUser),
      excludes_sale_items: excludeSale,
      starts_at: toApiDate(startsAt),
      expires_at: toApiDate(expiresAt),
      is_active: active,
    }
    if (!editing) {
      if (code.trim()) body.code = code.trim().toUpperCase()
      else if (prefix.trim()) body.prefix = prefix.trim().toUpperCase()
    }
    setBusy(true)
    try {
      if (editing) await adminFetch('/admin/coupons/' + coupon.id, { method: 'PATCH', body })
      else await adminFetch('/admin/coupons', { method: 'POST', body })
      onSaved()
    } catch (e) {
      setError(errMsg(e, 'Could not save the coupon.'))
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      busy={busy}
      title={editing ? 'Edit ' + coupon.code : 'New coupon'}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn onClick={save} busy={busy}>
            {editing ? 'Save changes' : 'Create coupon'}
          </Btn>
        </>
      }
    >
      <div className="space-y-3">
        {!editing && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code" hint="Leave empty to generate one">
              <input className={INPUT} value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER15" />
            </Field>
            <Field label="Prefix" hint="Used when code is empty">
              <input className={INPUT} value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="TEST" disabled={code.trim() !== ''} />
            </Field>
          </div>
        )}
        <Field label="Description">
          <input className={INPUT} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount type">
            <select className={INPUT} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed amount (USD)</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </Field>
          {type !== 'free_shipping' && (
            <Field label={type === 'percentage' ? 'Percent off' : 'Amount off (USD)'}>
              <input className={INPUT} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {type === 'percentage' && (
            <Field label="Max discount (USD)" hint="Optional">
              <input className={INPUT} inputMode="decimal" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
            </Field>
          )}
          <Field label="Minimum spend (USD)" hint="Optional">
            <input className={INPUT} inputMode="decimal" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Total uses" hint="Empty = unlimited">
            <input className={INPUT} inputMode="numeric" value={limitTotal} onChange={(e) => setLimitTotal(e.target.value)} />
          </Field>
          <Field label="Uses per customer" hint="Empty = unlimited">
            <input className={INPUT} inputMode="numeric" value={limitUser} onChange={(e) => setLimitUser(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts">
            <input type="datetime-local" className={INPUT} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </Field>
          <Field label="Expires">
            <input type="datetime-local" className={INPUT} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={excludeSale} onChange={(e) => setExcludeSale(e.target.checked)} className="h-4 w-4" />
          Exclude sale items
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
          Active
        </label>
        {error && <Notice message={error} />}
      </div>
    </Modal>
  )
}
