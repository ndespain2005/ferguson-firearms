"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import { ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "@/components/cart-context";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/transfers", label: "Transfers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function CartIcon() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-lg backdrop-blur transition hover:bg-black/70"
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
            <Image
              src="/ferguson-logo.png"
              alt="Ferguson Firearms logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-white">
              Ferguson Firearms
            </div>
            <div className="text-xs text-red-400">
              Indianapolis, IN — Wanamaker
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-red-600/30 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-lg backdrop-blur transition hover:bg-black/70"
            aria-label="Wishlist (placeholder)"
            title="Wishlist (placeholder)"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Wishlist</span>
          </button>

          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-lg backdrop-blur transition hover:bg-black/70"
            aria-label="Account"
            title="Account"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </Link>

          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-lg backdrop-blur transition hover:bg-black/70"
            >
              Sign In
            </Link>
          </SignedOut>

          <SignedIn>
            <SignOutButton>
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-lg backdrop-blur transition hover:bg-black/70"
              >
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>

          <CartIcon />


        </div>
      </div>
    </header>
  );
}
