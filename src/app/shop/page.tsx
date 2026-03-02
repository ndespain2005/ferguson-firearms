"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Badge, SectionHeading } from "@/components/ui";
import { useCart } from "@/components/cart-context";
import { INVENTORY, InventoryItem, Category, getBrands, getCalibers } from "@/lib/inventory";
import { useWishlist } from "@/lib/use-wishlist";

type Filter = "All" | Category;
type Availability = "All" | "InStock" | "OutOfStock" | "RequestOnly";

function matchesQuery(name: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return name.toLowerCase().includes(q);
}

function sortItems<T extends { name: string; price: number }>(items: T[], mode: "Featured" | "Name" | "PriceLow" | "PriceHigh") {
  const copy = [...items];
  if (mode === "Name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (mode === "PriceLow") return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (mode === "PriceHigh") return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
  return copy;
}

export default function ShopPage() {
  const { add } = useCart();
  const wishlist = useWishlist();

  const [filter, setFilter] = useState<Filter>("All");
  const [availability, setAvailability] = useState<Availability>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"Featured" | "Name" | "PriceLow" | "PriceHigh">("Featured");
  const [brand, setBrand] = useState<string>("");
  const [caliber, setCaliber] = useState<string>("");
  const [wishlistOnly, setWishlistOnly] = useState(false);

  const [quick, setQuick] = useState<InventoryItem | null>(null);

  const brands = useMemo(() => getBrands(INVENTORY), []);
  const calibers = useMemo(() => getCalibers(INVENTORY), []);

  const items = useMemo(() => {
    let out = INVENTORY;

    if (filter !== "All") out = out.filter((p) => p.category === filter);

    // Availability filter
    if (availability === "InStock") out = out.filter((p) => p.stock > 0);
    if (availability === "OutOfStock") out = out.filter((p) => p.stock === 0);
    if (availability === "RequestOnly") out = out.filter((p) => p.stock < 0);

    // Wishlist filter
    if (wishlistOnly) out = out.filter((p) => wishlist.has(p.id));

    // Brand / caliber filters
    if (brand) out = out.filter((p) => (p.brand || "") === brand);
    if (caliber) out = out.filter((p) => (p.caliber || "") === caliber);

    // Search
    out = out.filter((p) => matchesQuery(p.name, query));

    // Sort
    out = sortItems(out, sort);

    return out;
  }, [filter, availability, wishlistOnly, brand, caliber, query, sort, wishlist]);

  function primaryAction(item: InventoryItem) {
    if (item.stock < 0) {
      window.location.href = `/transfers/intake?item=${encodeURIComponent(item.name)}`;
      return;
    }
    if (item.stock === 0) return;
    add(item as any);
  }

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Shop"
        title="Inventory"
        subtitle="Browse, filter, and request availability. Accessories/Apparel use stock counts — firearms listings are request-only."
      />

      <Card title="Browse">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex flex-1 gap-3 flex-col md:flex-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="w-full md:w-[220px] rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 outline-none focus:ring-2 focus:ring-red-500/40"
              >
                <option value="Featured">Sort: Featured</option>
                <option value="Name">Sort: Name</option>
                <option value="PriceLow">Sort: Price (Low)</option>
                <option value="PriceHigh">Sort: Price (High)</option>
              </select>

              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full md:w-[220px] rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 outline-none focus:ring-2 focus:ring-red-500/40"
              >
                <option value="">Brand: All</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={caliber}
                onChange={(e) => setCaliber(e.target.value)}
                className="w-full md:w-[220px] rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 outline-none focus:ring-2 focus:ring-red-500/40"
              >
                <option value="">Caliber: All</option>
                {calibers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setWishlistOnly((v) => !v)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-red-600/25"
                title="Show wishlist"
              >
                Wishlist {wishlist.count ? `(${wishlist.count})` : ""}
              </button>
              <Link
                href="/account"
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-red-600/25"
              >
                Account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Chip active={filter === "All"} onClick={() => setFilter("All")}>Shop All</Chip>
          <Chip active={filter === "Rifles"} onClick={() => setFilter("Rifles")}>Rifles</Chip>
          <Chip active={filter === "Handguns"} onClick={() => setFilter("Handguns")}>Handguns</Chip>
          <Chip active={filter === "Collectibles"} onClick={() => setFilter("Collectibles")}>Collectibles</Chip>
          <Chip active={filter === "Accessories"} onClick={() => setFilter("Accessories")}>Accessories</Chip>
          <Chip active={filter === "Optics"} onClick={() => setFilter("Optics")}>Optics</Chip>
          <Chip active={filter === "Parts"} onClick={() => setFilter("Parts")}>Parts</Chip>
          <Chip active={filter === "Apparel"} onClick={() => setFilter("Apparel")}>Apparel</Chip>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Chip active={availability === "All"} onClick={() => setAvailability("All")}>All</Chip>
          <Chip active={availability === "InStock"} onClick={() => setAvailability("InStock")}>In Stock</Chip>
          <Chip active={availability === "OutOfStock"} onClick={() => setAvailability("OutOfStock")}>Out of Stock</Chip>
          <Chip active={availability === "RequestOnly"} onClick={() => setAvailability("RequestOnly")}>Request Only</Chip>

          <button
            type="button"
            onClick={() => {
              setBrand("");
              setCaliber("");
              setQuery("");
              setAvailability("All");
              setFilter("All");
              setWishlistOnly(false);
              setSort("Featured");
            }}
            className="ml-auto rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-red-600/20 hover:text-white"
          >
            Reset
          </button>
        </div>
      </Card>

      <div className="text-white/60 text-sm">
        Showing <span className="text-white/80 font-semibold">{items.length}</span> items
        {wishlistOnly ? <span className="ml-2">(wishlist)</span> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            item={p}
            onPrimary={() => primaryAction(p)}
            onQuick={() => setQuick(p)}
            wished={wishlist.has(p.id)}
            onWish={() => wishlist.toggle(p.id)}
          />
        ))}
      </div>

      {quick ? (
        <QuickView
          item={quick}
          wished={wishlist.has(quick.id)}
          onWish={() => wishlist.toggle(quick.id)}
          onClose={() => setQuick(null)}
          onPrimary={() => primaryAction(quick)}
        />
      ) : null}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-red-500/40 bg-red-600/20 text-white"
          : "border-white/10 bg-black/35 text-white/70 hover:bg-red-600/15 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({
  item,
  onPrimary,
  onQuick,
  wished,
  onWish,
}: {
  item: InventoryItem;
  onPrimary: () => void;
  onQuick: () => void;
  wished: boolean;
  onWish: () => void;
}) {
  const requestOnly = item.stock < 0;
  const out = item.stock === 0;

  return (
    <div className="relative">
      <Card title="">
        <Link href={`/shop/${encodeURIComponent(item.id)}`} className="block">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35">
            <img src={item.image} alt={item.name} className="h-52 w-full object-cover" />
          </div>
        </Link>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold tracking-tight">{item.name}</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge>{item.category}</Badge>
              {item.tag ? <Badge>{item.tag}</Badge> : null}
              {item.brand ? <Badge>{item.brand}</Badge> : null}
              {item.caliber ? <Badge>{item.caliber}</Badge> : null}
              {item.condition ? <Badge>{item.condition}</Badge> : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onWish}
            className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
              wished ? "border-red-500/40 bg-red-600/20 text-white" : "border-white/10 bg-black/35 text-white/70 hover:bg-red-600/15 hover:text-white"
            }`}
            title="Wishlist"
          >
            {wished ? "♥" : "♡"}
          </button>
        </div>

        <div className={`mt-3 text-sm font-semibold ${requestOnly ? "text-red-200" : out ? "text-red-300" : "text-white/70"}`}>
          {requestOnly ? "Request only" : out ? "Out of stock" : `In stock: ${item.stock}`}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onPrimary}
            disabled={item.stock === 0}
            className="btn-red-glow glow-pulse w-full rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/35 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requestOnly ? "Request Availability" : out ? "Out of Stock" : "Add to Cart"}
          </button>

          <button
            type="button"
            onClick={onQuick}
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
          >
            Quick View
          </button>
        </div>
      </Card>
    </div>
  );
}

function QuickView({
  item,
  onClose,
  onPrimary,
  wished,
  onWish,
}: {
  item: InventoryItem;
  onClose: () => void;
  onPrimary: () => void;
  wished: boolean;
  onWish: () => void;
}) {
  const requestOnly = item.stock < 0;
  const out = item.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-black/80 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">{item.name}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{item.category}</Badge>
              {item.tag ? <Badge>{item.tag}</Badge> : null}
              {item.brand ? <Badge>{item.brand}</Badge> : null}
              {item.caliber ? <Badge>{item.caliber}</Badge> : null}
              {item.condition ? <Badge>{item.condition}</Badge> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onWish}
              className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                wished ? "border-red-500/40 bg-red-600/20 text-white" : "border-white/10 bg-black/35 text-white/70 hover:bg-red-600/15 hover:text-white"
              }`}
            >
              {wished ? "♥" : "♡"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-red-600/15 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35">
            <img src={item.image} alt={item.name} className="h-72 w-full object-cover" />
          </div>

          <div className="space-y-4">
            <div className="text-white/70 text-lg">{item.description || "—"}</div>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-4 text-white/70">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-white/50 text-sm">SKU</div>
                  <div className="font-semibold text-white/85">{item.sku || "—"}</div>
                </div>
                <div>
                  <div className="text-white/50 text-sm">Price</div>
                  <div className="font-semibold text-white/85">{requestOnly ? "Request" : `$${item.price.toFixed(2)}`}</div>
                </div>
              </div>
            </div>

            <div className={`text-sm font-semibold ${requestOnly ? "text-red-200" : out ? "text-red-300" : "text-white/70"}`}>
              {requestOnly ? "Request only" : out ? "Out of stock" : `In stock: ${item.stock}`}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onPrimary}
                disabled={item.stock === 0}
                className="btn-red-glow glow-pulse w-full rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {requestOnly ? "Request Availability" : out ? "Out of Stock" : "Add to Cart"}
              </button>

              <Link
                href={`/shop/${encodeURIComponent(item.id)}`}
                className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
