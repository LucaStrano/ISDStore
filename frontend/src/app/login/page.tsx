"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_BASE_URL, saveTokens } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                setError("Invalid credentials");
                return;
            }
            const data = (await res.json()) as { accessToken: string; refreshToken: string };
            saveTokens(data);
            router.push("/");
            router.refresh();
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-semibold">Login</h1>
            <form className="space-y-3" onSubmit={onSubmit}>
                <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button disabled={loading} className="w-full bg-primary text-primary-foreground py-2 rounded">
                    {loading ? "Logging in..." : "Login"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
            <p className="text-sm text-center">
                Don&apos;t have an account?{" "}
                <a href="/register" className="text-primary underline">
                    Register
                </a>
            </p>
        </div>
    );
}
