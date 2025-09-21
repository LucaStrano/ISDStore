"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authJson, getAccessToken, getRoleFromAccessToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ProductForm = {
  title: string;
  description: string;
  priceCents: number | "";
  image: string;
  stock: number | "";
};

export default function AdminPanelPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    title: "",
    description: "",
    priceCents: "",
    image: "",
    stock: "",
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const role = getRoleFromAccessToken();
    if (role !== "admin" && role !== "ADMIN") {
      router.push("/");
      return;
    }
    setIsAdmin(true);
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    // Basic client validation
    const title = form.title.trim();
    const description = form.description.trim();
    const priceCents = typeof form.priceCents === "string" ? parseInt(form.priceCents || "0", 10) : form.priceCents;
    const stock = typeof form.stock === "string" ? parseInt(form.stock || "0", 10) : form.stock;

    if (!title) return toast.error("Title is required");
    if (!description) return toast.error("Description is required");
    if (Number.isNaN(priceCents) || priceCents < 0) return toast.error("Price (cents) must be a non-negative number");
    if (Number.isNaN(stock) || stock < 0) return toast.error("Stock must be a non-negative number");

    setSaving(true);
    try {
      const created = await authJson("/api/admin/products", {
        method: "POST",
        body: { title, description, priceCents, image: form.image || undefined, stock },
      });
      toast.success("Product created");
      // Reset form
      setForm({ title: "", description: "", priceCents: "", image: "", stock: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Product title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 min-h-[120px]"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Product description"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Price (cents)</label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.priceCents}
                  onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value === "" ? "" : Number(e.target.value) }))}
                  placeholder="e.g. 12999 for $129.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Stock</label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value === "" ? "" : Number(e.target.value) }))}
                  placeholder="Quantity in stock"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Image URL</label>
              <input
                type="url"
                className="w-full border rounded-md px-3 py-2"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
