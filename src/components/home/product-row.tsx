import { cmsGet } from '@/lib/cms';
import { ProductCard, type ProductSummary } from '@/components/product/product-card';
import { ScrollRow } from '@/components/home/scroll-row';

export async function ProductRow({
  eyebrow,
  title,
  href,
  path,
  limit = 10,
}: {
  eyebrow: string;
  title: string;
  href: string;
  path: string;
  limit?: number;
}) {
  const products = await cmsGet<ProductSummary[]>(path);
  if (!products || products.length === 0) return null;

  return (
    <ScrollRow eyebrow={eyebrow} title={title} href={href}>
      {products.slice(0, limit).map((p) => (
        <li
          key={p.id}
          className="w-[70%] shrink-0 snap-start sm:w-[42%] lg:w-[23.5%]"
        >
          <ProductCard product={p} />
        </li>
      ))}
    </ScrollRow>
  );
}
