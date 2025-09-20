"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { getAccessToken, authJson, clearTokens } from "@/lib/auth";

// Types aligned with backend CartViewDTO
type ProductDTO = {
  id: string;
  title: string;
  image?: string | null;
  priceCents: number;
  stock: number;
};

type CartViewItemDTO = {
  product: ProductDTO;
  quantity: number;
  itemTotalCents: number;
};

type CartViewDTO = {
  items: CartViewItemDTO[];
  totalCents: number;
};

async function fetchCart(): Promise<CartViewDTO> {
  console.log("CartPage: fetching /api/cart");
  const data = await authJson<CartViewDTO>("/api/cart");
  console.log(
    "CartPage: received cart",
    { items: data.items.length, totalCents: data.totalCents }
  );
  return data;
}

function centsToDollars(cents: number): number {
  return (cents ?? 0) / 100;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartViewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetchCart()
      .then((c) => setCart(c))
      .catch((err) => {
        console.error("CartPage: failed to fetch cart", err);
        try { clearTokens(); } catch {}
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const totalCents = cart?.totalCents ?? 0;

  async function handleCheckout() {
    setStatus("Starting checkout…");
    setError(null);
    setOrderId(null);
    setProgress(10);
    try {
      // Small UX delay to show progress start
      await new Promise((r) => setTimeout(r, 150));
      setStatus("Creating order…");
      setProgress(60);
      const res = await authJson<{ id: string; totalCents: number; createdAt: string }>(
        "/api/checkout",
        { method: "POST" }
      );
      setOrderId(res.id);
      setStatus("Finalizing…");
      setProgress(90);
      setProgress(100);
      setStatus("Done! Your order was created.");
    } catch (e: any) {
      console.error("Checkout failed", e);
      setError(e?.message || "Checkout failed");
      setStatus("Something went wrong");
      setProgress(0);
    }
  }

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
            const subtotal = centsToDollars(item.itemTotalCents);
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
            <Drawer open={open} onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                // When closing after a successful checkout, refresh cart then reset state
                if (orderId) {
                  void fetchCart().then((c) => setCart(c)).catch(() => {});
                }
                // reset drawer state
                setProgress(0);
                setStatus(null);
                setError(null);
                setOrderId(null);
              }
            }}>
              <DrawerTrigger asChild>
                <Button disabled={(cart?.items.length ?? 0) === 0} onClick={() => {
                  setOpen(true);
                  // kick off checkout as soon as the drawer opens
                  setTimeout(() => { void handleCheckout(); }, 50);
                }}>
                  Proceed to checkout
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Checking out</DrawerTitle>
                  <DrawerDescription>
                    We’re creating your order and clearing your cart. Please don’t close this.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <Progress value={progress} />
                  <div className="mt-2 text-sm">
                    {status}
                    {error ? (
                      <span className="text-destructive ml-2">{error}</span>
                    ) : null}
                  </div>
                  {orderId ? (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Order ID: <span className="font-mono text-foreground">{orderId}</span>
                    </div>
                  ) : null}
                </div>
                <DrawerFooter>
                  {orderId ? (
                    <Button onClick={() => router.push("/orders")}>View orders</Button>
                  ) : (
                    <Button disabled>Processing…</Button>
                  )}
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      )}
    </div>
  );
}
