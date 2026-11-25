import { ProductRow } from '@/components/home/product-row';

export async function NewArrivals() {
  return (
    <ProductRow
      eyebrow="Just in"
      title="New arrivals"
      href="/c/new-arrivals"
      path="products?new=1&per_page=10"
    />
  );
}

export default NewArrivals;
