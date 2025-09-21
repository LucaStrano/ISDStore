import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Format an integer amount of cents into a currency string, default USD
export function formatCents(
  cents: number | null | undefined,
  options?: { currency?: string; locale?: string }
): string {
  const currency = options?.currency ?? "USD";
  const locale = options?.locale ?? "en-US";
  const amount = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if Intl or currency code fails
    return `$${amount.toFixed(2)}`;
  }
}
