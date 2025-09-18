"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth";

type CartItemDTO = {
  product: {
    id: string;
    title: string;
    image?: string;
    priceCents: number;
    stock: number;
  };
  quantity: number;
};

type CartDTO = {
  items: CartItemDTO[];
};

// Mock: pretend to fetch the cart from the backend/Redis
async function getCart(): Promise<CartDTO> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 150));

  return {
    items: [
      {
        product: {
          id: "11111111-1111-1111-1111-111111111111",
          title: "Gaming Laptop Pro 15",
          image: "https://placehold.co/400x300/png?text=Laptop",
          priceCents: 149999,
          stock: 25,
        },
        quantity: 1,
      },
      {
        product: {
          id: "22222222-2222-2222-2222-222222222222",
          title: "Mechanical Keyboard RGB",
          image: "https://placehold.co/400x300/png?text=Keyboard",
          priceCents: 8999,
          stock: 58,
        },
        quantity: 2,
      },
      {
        product: {
          id: "33333333-3333-3333-3333-333333333333",
          title: "Wireless Gaming Mouse",
          image: "https://placehold.co/400x300/png?text=Mouse",
          priceCents: 4999,
          stock: 120,
        },
        quantity: 1,
      },
    ],
  };
}

function centsToDollars(cents: number): number {
  return (cents ?? 0) / 100;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }
    getCart().then((c) => setCart(c)).finally(() => setLoading(false));
  }, [router]);

  const totalCents = (cart?.items || []).reduce(
    (sum, it) => sum + it.product.priceCents * it.quantity,
    0
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!cart) return null; // In case of redirect

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => {
            const price = centsToDollars(item.product.priceCents);
            const subtotal = price * item.quantity;
            return (
              <Card key={item.product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-28 h-20 shrink-0 rounded-md overflow-hidden border bg-muted">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="font-medium hover:underline line-clamp-2"
                        >
                          {item.product.title}
                        </Link>
                        <div className="flex w-auto items-center">
                          <div className="text-sm text-muted-foreground">
                          Unit: ${price.toFixed(2)}
                          </div>
                          <div className="ml-auto text-right font-semibold min-w-24">
                          ${subtotal.toFixed(2)}
                          </div>
                        </div>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                        Quantity: <span className="font-medium text-foreground">{item.quantity}</span>
                        </div>
                      </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex items-center justify-end gap-4 pt-2">
            <div className="text-lg font-semibold">
              Total: ${centsToDollars(totalCents).toFixed(2)}
            </div>
            <Button asChild>
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
