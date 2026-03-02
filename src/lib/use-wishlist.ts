"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "ff_wishlist_v1";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.map(String));
  } catch {}
  return new Set();
}

function writeSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function useWishlist() {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIds(readSet());
  }, []);

  const count = ids.size;

  const has = (id: string) => ids.has(id);

  const toggle = (id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeSet(next);
      return next;
    });
  };

  const clear = () => {
    const empty = new Set<string>();
    writeSet(empty);
    setIds(empty);
  };

  const list = useMemo(() => Array.from(ids), [ids]);

  return { has, toggle, clear, count, list };
}
