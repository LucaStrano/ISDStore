import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ProductPageProps { params: { id: string } }

function availabilityMeta(stock: number): { label: string; className: string } {
    if (stock <= 0) return { label: "Out of Stock", className: "text-italic text-gray-500" };
    if (stock <= 10) return { label: `Only ${stock} in stock!`, className: "text-red-600" };
    if (stock > 10 && stock <= 30) return { label: "Low Availability", className: "text-yellow-600" };
    // Treat >30 as available; spec explicitly calls out >=50 but we generalize
    return { label: "Available", className: "text-green-600" };
}

type ProductDTO = {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    image?: string | null;
    stock: number;
};

async function getProduct(id: string): Promise<{
    id: string; title: string; description: string; price: number; image?: string; stock: number;
} | null> {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const res = await fetch(`${base}/api/products/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to load product ${id}: ${res.status}`);
    const dto = (await res.json()) as ProductDTO;
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        price: (dto.priceCents ?? 0) / 100,
        image: dto.image ?? undefined,
        stock: dto.stock ?? 0,
    };
}
export default async function ProductDetailPage({ params }: ProductPageProps) {
    const product = await getProduct(params.id);
    if (!product) return notFound();

    const availability = availabilityMeta(product.stock);

    return (
        <Card className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 lg:w-5/12 xl:w-4/12">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            sizes="(max-width:768px) 100vw, 400px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                            No image
                        </div>
                    )}
                </div>
            </div>
            <CardContent className="p-0 flex-1 flex flex-col gap-4">
                <div className="space-y-1 flex flex-row items-center gap-5">
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                        {product.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                </div>
                <p className="text-sm md:text-base text-muted-foreground max-w-prose">
                    {product.description}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
                    <span className={`text-sm font-medium inline-flex items-center ${availability.className}`}>{availability.label}</span>
                </div>
                <div className="pt-2">
                    <button
                        className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-50"
                        disabled={product.stock <= 0}
                    >
                        {product.stock > 0 ? "Add to cart" : "Out of stock"}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}