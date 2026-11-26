'use client'

import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/admin/products/product-form'
import { Notice } from '@/components/admin/common/kit'

export function EditProduct() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id < 1) return <Notice message="Product not found." />
  return <ProductForm key={id} productId={id} />
}