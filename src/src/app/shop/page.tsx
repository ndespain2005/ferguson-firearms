"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Badge, Price, SectionHeading } from "@/components/ui";
import { Product, useCart } from "@/components/cart-context";

type Item = Product & { image: string; tag?: string };

const ACCESSORIES: Item[] = [
  { id: "acc-1", name: "Premium Sling (QD)", category: "Accessories", price: 59.0, image: "/products/sling.png", tag: "Best Seller" },
  { id: "acc-2", name: "Weapon Light Mount", category: "Accessories", price: 34.0, image: "/products/light-mount.png" },
  { id: "opt-1", name: "Micro Red Dot", category: "Optics", price: 199.0, image: "/products/red-dot.png", tag: "Featured" },
  { id: "opt-2", name: "Magnifier (Flip)", category: "Optics", price: 149.0, image: "/products/magnifier.png" },
  { id: "par-1", name: "Enhanced Trigger Guard", category: "Parts", price: 14.0, image: "/products/trigger-guard.png" },
  { id: "par-2", name: "Buffer Spring Kit", category: "Parts", price: 19.0, image: "/products/buffer-kit.png" },
];

const APPAREL: Item[] = [
  { id: "app-1", name: "FF Logo Tee", category: "Apparel", price: 29.0, image: "/products/logo-tee.png", tag: "New" },
  { id: "app-2", name: "Structured Hat", category: "Apparel", price: 32.0, image: "/products/hat.png" },
];

const FEATURED: Item[] = [
  ACCESSORIES[2],
  ACCESSORIES[0],
  APPAREL[0],
  ACCESSORIES[3],
];

const RECENT: Item[] = [
  ACCESSORIES[1],
  ACCESSORIES[5],
  APPAREL[1],
  ACCESSORIES[4],
];

function ShopNav() {
  const items = [
    { href: "#top", label: "Shop All" },
    { href: "#rifles", label: "Rifles" },
    { href: "#handguns", label: "Handguns" },
    { href: "#collectibles", label: "Collectibles" },
  ];

  return (
    <div id="top" className="glow-card rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((i) => (
          <a
            key={i.href}
            href={i.href}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
          >
            {i.label}
          </a>
        ))}
        <div className="ml-auto hidden sm:block text-white/60">
          Preview storefront — inventory connects in production.
        </div>
      </div>
    </div>
  );
}

type Filter = "All" | "Accessories" | "Optics" | "Parts";

function CategoryTiles() {
  const tiles = [
    { id: "accessories", title: "Accessories", sub: "Lights • mounts • parts", image: "/products/light-mount.png" },
    { id: "rifles", title: "Rifles", sub: "Request-to-purchase workflow", image: "/products/rifles.png" },
    { id: "handguns", title: "Handguns", sub: "Request-to-purchase workflow", image: "/products/handguns.png" },
    { id: "apparel", title: "Apparel", sub: "Tees • hats", image: "/products/logo-tee.png" },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className="glow-card group overflow-hidden rounded-2xl border border-white/10 bg-black/55 transition hover:-translate-y-0.5 hover:border-red-500/30"
        >
          <div className="relative aspect-[16/11] w-full">
            <Image
              src={t.image}
              alt={t.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          </div>
          <div className="p-5">
            <div className="text-lg font-semibold text-white">{t.title}</div>
            <div className="mt-1 text-white/70">{t.sub}</div>
            <div className="mt-4 inline-flex items-center text-red-400 font-semibold">
              Shop now →
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function ProductCard({ item, onAdd }: { item: Item; onAdd: (p: Product) => void }) {
  return (
    <div className="glow-card rounded-2xl border border-white/10 bg-black/55 p-5 transition hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-black/65">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition duration-300 hover:scale-[1.03]"
        />
        {item.tag ? (
          <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-sm font-semibold text-red-300">
            {item.tag}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white">{item.name}</div>
          <div className="mt-2">
            <Badge>{item.category}</Badge>
          </div>
        </div>
        <div className="text-base">
          <Price value={item.price} />
        </div>
      </div>

      <button
        onClick={() => onAdd(item)}
        className="btn-red-glow glow-pulse mt-5 w-full rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/35 focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        Add to Cart
      </button>
    </div>
  );
}

function SectionTabs() {
  const tabs = [
    { href: "#accessories", label: "Accessories" },
    { href: "#rifles", label: "Rifles" },
    { href: "#handguns", label: "Handguns" },
    { href: "#apparel", label: "Apparel" },
  ];
  return (
    <div className="sticky top-[64px] z-40 -mx-4 border-y border-white/10 bg-black/70 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
          >
            {t.label}
          </a>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/cart"
            className="rounded-full border border-white/10 bg-red-600 px-4 py-2 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            Cart →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FirearmSection({
  id,
  title,
  subtitle,
  image,
}: {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <Card title={title}>
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div className="text-lg font-semibold text-white">{subtitle}</div>
            <div className="text-white/70 text-lg">
              Firearms are handled through a request-to-purchase workflow. Submit details and we’ll respond with next steps and Ship-to-FFL info.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/firearms/request"
                className="btn-red-glow inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                Request to Purchase
              </Link>
              <Link
                href="/transfers"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
              >
                Transfer Info
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
            <Image src={image} alt={title} fill className="object-cover" />
          </div>
        </div>
      </Card>
    </section>
  );
}

export default function ShopPage() {
  const { add } = useCart();
  const [filter, setFilter] = useState<Filter>("All");

  const filteredAccessories = useMemo(() => {
    if (filter === "All") return ACCESSORIES;
    return ACCESSORIES.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <div className="space-y-10 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Shop"
          title="Shop by Category"
          subtitle="Category tiles + featured + recently added (inspired layout). Accessories & apparel use cart; firearms use request flow."
        />
        <div className="flex w-full max-w-xl items-center gap-2 md:justify-end">
          <input
            placeholder="Search (preview)…"
            className="w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
          />
        </div>
      </div>

      <ShopNav />

      <CategoryTiles />

      <SectionTabs />

      <Card title="Featured Products">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((p) => (
            <ProductCard key={p.id} item={p} onAdd={add} />
          ))}
        </div>
      </Card>

      <section id="accessories" className="scroll-mt-32 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-2xl font-semibold">Accessories</div>
          <div className="flex flex-wrap gap-2">
            {(["All", "Accessories", "Optics", "Parts"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full border border-white/10 px-4 py-2 text-base font-semibold transition ${
                  filter === f
                    ? "bg-red-600 text-white"
                    : "bg-black/40 text-white/70 hover:bg-red-600/25 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAccessories.map((p) => (
            <ProductCard key={p.id} item={p} onAdd={add} />
          ))}
        </div>
      </section>

      <FirearmSection id="rifles" title="Rifles" subtitle="Rifles — Request Flow" image="/products/rifles.png" />
      <FirearmSection id="handguns" title="Handguns" subtitle="Handguns — Request Flow" image="/products/handguns.png" />

      <section id="apparel" className="scroll-mt-32 space-y-5">
        <div className="text-2xl font-semibold">Apparel</div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {APPAREL.map((p) => (
            <ProductCard key={p.id} item={p} onAdd={add} />
          ))}
        </div>
      </section>
<section id="collectibles" className="scroll-mt-32">
  <Card title="Collectibles (Preview)">
    <div className="grid gap-6 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <div className="text-lg font-semibold text-white">Collectibles — Coming Soon</div>
        <div className="text-white/70 text-lg">
          Placeholder for future inventory: collectibles, limited drops, and unique items.
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="btn-red-glow inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            Ask About Collectibles
          </Link>
          <Link
            href="/shop#accessories"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
          >
            Browse Accessories
          </Link>
        </div>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-700/15 via-black to-black" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-2xl border border-white/10 bg-black/60 px-6 py-5 text-center">
            <div className="text-xl font-semibold text-white">Limited Drops</div>
            <div className="mt-2 text-white/60">Visual placeholder</div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</section>


      <Card title="Recently Added">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {RECENT.map((p) => (
            <ProductCard key={p.id} item={p} onAdd={add} />
          ))}
        </div>
        <div className="mt-5 text-white/60">
          Preview note: inventory and search will be connected to WooCommerce in production.
        </div>
      </Card>
    </div>
  );
}
