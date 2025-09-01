import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold">ISDStore</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="underline">Admin Panel</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
