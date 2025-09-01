import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";

// Temporary mock data; will be fetched from backend later
const mockProducts = [
  { id: "1", title: "Gaming GPU", price: 799.99, stock: 75, image: "https://placehold.co/600x450/png?text=GPU" },
  { id: "2", title: "Mechanical Keyboard", price: 149.5, stock: 22, image: "https://placehold.co/600x450/png?text=Keyboard" },
  { id: "3", title: "NVMe SSD 2TB", price: 199.0, stock: 9, image: "https://placehold.co/600x450/png?text=SSD" },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Products</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {mockProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
