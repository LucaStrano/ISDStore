"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authJson, clearTokens, getAccessToken } from "@/lib/auth";

// Types aligned with backend OrderDTO and CartItemDTO
type OrderItemViewDTO = {
  title: string;
  quantity: number;
};

type OrderDTO = {
  id: string;
  userId: string;
  items: OrderItemViewDTO[];
  totalCents: number;
  status: string; // "completed"
  createdAt: string; // ISO date string
};

async function fetchOrders(): Promise<OrderDTO[]> {
  return await authJson<OrderDTO[]>("/api/orders");
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrders()
      .then((o) => setOrders(o))
      .catch((err) => {
        console.error("OrdersPage: failed to fetch orders", err);
        setError(err?.message || "Failed to load orders");
        try { clearTokens(); } catch {}
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!orders) return null; // In case of redirect

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-xl">Order {order.id}</CardTitle>
                  <span className="text-sm font-medium text-green-600">
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="divide-y">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="py-3 flex items-center justify-between">
                      <span className="truncate pr-4">{item.title}</span>
                      <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
