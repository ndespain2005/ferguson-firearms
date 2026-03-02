"use client";

import { CartProvider } from "@/components/cart-context";

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  // Dark-only tactical branding
  return <CartProvider>{children}</CartProvider>;
}
