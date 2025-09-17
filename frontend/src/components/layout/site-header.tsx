"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearTokens, getAccessToken, getRoleFromAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function SiteHeader() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    function readAuth() {
      const t = getAccessToken();
      setToken(t);
      setRole(getRoleFromAccessToken());
    }
    readAuth();
    window.addEventListener("auth:changed", readAuth);
    return () => window.removeEventListener("auth:changed", readAuth);
  }, []);

  function onLogout() {
    clearTokens();
    setToken(null);
    setRole(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold">ISDStore</Link>
        <nav className="flex gap-4 text-sm items-center">
          {role === "admin" && <Link href="/admin" className="underline">Admin Panel</Link>}
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>
          {!token ? (
            <Link href="/login">Login</Link>
          ) : (
            <button className="text-sm underline" onClick={onLogout}>Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
