"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { Card, Price, SectionHeading } from "@/components/ui";

export default function CartPage() {
  const { items, remove, setQty, clear, subtotal } = useCart();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Cart"
        title="Accessories Checkout (Preview)"
        subtitle="This preview includes a cart UX. In production, checkout connects to WooCommerce + your firearms-friendly gateway."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Items">
          {items.length === 0 ? (
            <div className="text-sm text-muted">
              Your cart is empty.{" "}
              <Link href="/shop" className="underline underline-offset-4">
                Browse the shop
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold">{i.name}</div>
                    <div className="text-xs text-muted">{i.category}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-muted">
                      Qty
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={i.qty}
                        onChange={(e) => setQty(i.id, Number(e.target.value))}
                        className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>

                    <div className="w-24 text-right text-sm">
                      <Price value={i.price * i.qty} />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(i.id)}
                      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted transition hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={clear}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Clear cart
              </button>
            </div>
          )}
        </Card>

        <Card title="Summary">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Subtotal</span>
              <Price value={subtotal} />
            </div>
            <div className="text-xs text-muted">
              Taxes/shipping handled at real checkout once WooCommerce is wired.
            </div>

            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-xl bg-card px-4 py-2 text-sm font-medium shadow-sm ring-offset-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Continue (Inquiry / Checkout)
            </Link>

            <div className="text-xs text-muted">
              For now this button routes to Contact. In production this becomes a
              real checkout.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
