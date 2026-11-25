import { ProductRow } from '@/components/home/product-row';

export async function Trending() {
  return (
    <ProductRow
      eyebrow="Most wanted"
      title="Trending now"
      href="/c/new-arrivals"
      path="cms/trending"
    />
  );
}

export default Trending;
