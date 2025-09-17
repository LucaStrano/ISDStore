"use client";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const STORAGE_KEY = "isdstore.auth";

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
