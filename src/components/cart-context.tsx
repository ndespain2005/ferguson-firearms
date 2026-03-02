"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type Product = {
  id: string;
  name: string;
  category: "Accessories" | "Optics" | "Parts" | "Apparel";
  price: number;
};

export type CartItem = Product & { qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (p: Product) => {
    setItems((cur) => {
      const existing = cur.find((x) => x.id === p.id);
      if (existing) return cur.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...cur, { ...p, qty: 1 }];
    });
  };

  const remove = (id: string) => setItems((cur) => cur.filter((x) => x.id !== id));

  const setQty = (id: string, qty: number) => {
    const safe = Number.isFinite(qty) ? Math.max(1, Math.min(99, Math.floor(qty))) : 1;
    setItems((cur) => cur.map((x) => (x.id === id ? { ...x, qty: safe } : x)));
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  const value: CartCtx = { items, add, remove, setQty, clear, subtotal };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
