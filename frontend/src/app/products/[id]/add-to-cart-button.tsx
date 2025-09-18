"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authJson, getAccessToken } from "@/lib/auth";
import { toast } from "sonner";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onAdd() {
    if (loading) return;
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await authJson("/api/cart/items", {
        method: "POST",
        body: { productId, quantity: 1 },
      });
      toast.success("Added to cart", {
        description: "The item was added to your cart.",
        action: {
          label: "View cart",
          onClick: () => router.push("/cart"),
        },
      });
      // Refresh in case any cart indicators depend on data
      router.refresh();
    } catch (e) {
      toast.error("Could not add to cart", {
        description: "Please log in and try again.",
        action: {
          label: "Log in",
          onClick: () => router.push("/login"),
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={onAdd} disabled={disabled || loading}>
      {loading ? "Adding…" : "Add to cart"}
    </Button>
  );
}
