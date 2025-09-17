import { ProductCard } from "@/components/product/product-card";

type ProductDTO = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  image?: string | null;
  stock: number;
};

async function getProducts(): Promise<ProductDTO[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json();
}

export default async function HomePage() {
  const products = await getProducts();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Products</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              title: p.title,
              price: (p.priceCents ?? 0) / 100,
              image: p.image ?? undefined,
              stock: p.stock ?? 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
