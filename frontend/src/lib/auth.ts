"use client";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const STORAGE_KEY = "isdstore.auth";
const PROFILE_KEY = "isdstore.profile";

export function saveTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") return;
  console.log("Saving Received Tokens to Local Storage:", tokens);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  try { window.dispatchEvent(new Event("auth:changed")); } catch {}
}

export function loadTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  console.log("Loading Tokens from Local Storage");
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  console.log("Clearing Tokens from Local Storage");
  localStorage.removeItem(STORAGE_KEY);
  // Also clear profile info when logging out
  try { localStorage.removeItem(PROFILE_KEY); } catch {}
  try { window.dispatchEvent(new Event("auth:changed")); } catch {}
}

export function getAccessToken(): string | null {
  const t = loadTokens();
  return t?.accessToken ?? null;
}

export function parseJwt<T = any>(token: string | null): T | null {
  if (!token) return null;
  console.log("Parsing JWT Token");
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    console.log("Parsed JWT Token:", jsonPayload);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getRoleFromAccessToken(): string | null {
  const claims = parseJwt<{ role?: string }>(getAccessToken());
  return claims?.role ?? null;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export async function authFetch(input: string, init: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const url = isAbsoluteUrl(input) ? input : `${API_BASE_URL}${input}`;
  return fetch(url, { ...init, headers });
}

export async function authJson<T = unknown>(
  path: string,
  opts?: { method?: string; body?: any; headers?: HeadersInit }
): Promise<T> {
  const method = opts?.method ?? "GET";
  const hdrs = new Headers(opts?.headers || {});
  if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");
  const res = await authFetch(path, {
    method,
    headers: hdrs,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with ${res.status}`);
  }
  // If no content (204), return undefined as any
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Lightweight profile storage: currently just the user's email for greeting
export function saveProfile(profile: { email: string }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
  try { window.dispatchEvent(new Event("auth:changed")); } catch {}
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as { email?: string };
    return obj.email ?? null;
  } catch {
    return null;
  }
}
