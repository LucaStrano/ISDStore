import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    image?: string;
    stock: number; // availability
  };
  className?: string;
}

function availabilityMeta(stock: number): { label: string; className: string } {
  if (stock <= 10) return { label: `Only ${stock} in stock!`, className: "text-red-600" };
  if (stock > 10 && stock <= 30) return { label: "Low Availability", className: "text-yellow-600" };
  if (stock <= 0) return { label: "Out of Stock", className: "text-italic text-gray-500" };
  // Treat >30 as available; spec explicitly calls out >=50 but we generalize
  return { label: "Available", className: "text-green-600" };
}

export function ProductCard({ product, className }: ProductCardProps) {
  const availability = availabilityMeta(product.stock);
  return (
    <Link href={`/products/${product.id}`} className={cn("group", className)}>
      <Card className="h-full flex flex-col group-hover:outline group-hover:outline-2 group-hover:outline-black">
        {product.image && (
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width:768px) 100vw, 300px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="line-clamp-2 min-h-[2.5rem] flex items-center">{product.title}</CardTitle>
          <div className="font-medium text-right ml-4 flex items-center">${product.price.toFixed(2)}</div>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-2 text-sm">
          <div className={cn("text-sm font-medium", availability.className)}>{availability.label}</div>
        </CardContent>
      </Card>
    </Link>
  );
}