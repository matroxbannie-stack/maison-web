import { Suspense } from 'react'
import { EditProduct } from '@/components/admin/products/edit-product'

export default function EditProductPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading product...</p>}>
      <EditProduct />
    </Suspense>
  )
}