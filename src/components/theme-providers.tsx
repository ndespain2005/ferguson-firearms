"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/components/cart-context";

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/account" afterSignUpUrl="/account">
      <CartProvider>{children}</CartProvider>
    </ClerkProvider>
  );
}
