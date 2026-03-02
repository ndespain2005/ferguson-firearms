"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/components/cart-context";

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <CartProvider>{children}</CartProvider>
    </ClerkProvider>
  );
}
