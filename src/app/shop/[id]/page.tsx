import Link from "next/link";
import { notFound } from "next/navigation";
import { INVENTORY, getItemById } from "@/lib/inventory";
import { Card, SectionHeading, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function ProductDetailPage({ params }: any) {
  const id = params?.id as string;
  const item = getItemById(id);
  if (!item) return notFound();

  const requestOnly = item.stock < 0;
  const out = item.stock === 0;

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Shop"
        title={item.name}
        subtitle={requestOnly ? "Request-only listing — submit intake for availability." : "Product details"}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35">
            <img src={item.image} alt={item.name} className="h-[360px] w-full object-cover" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge>{item.category}</Badge>
            {item.tag ? <Badge>{item.tag}</Badge> : null}
            {item.condition ? <Badge>{item.condition}</Badge> : null}
            {item.brand ? <Badge>{item.brand}</Badge> : null}
            {item.caliber ? <Badge>{item.caliber}</Badge> : null}
            {requestOnly ? <Badge>Request Only</Badge> : out ? <Badge>Out of Stock</Badge> : <Badge>In Stock</Badge>}
          </div>

          <div className="mt-4 text-white/70 text-lg">
            {item.description || "—"}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/45 p-4 text-white/70">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <div className="text-white/50 text-sm">SKU</div>
                <div className="font-semibold text-white/85">{item.sku || "—"}</div>
              </div>
              <div>
                <div className="text-white/50 text-sm">Price</div>
                <div className="font-semibold text-white/85">
                  {requestOnly ? "Request" : `$${item.price.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
            >
              Back to Shop
            </Link>

            {requestOnly ? (
              <Link
                href={`/transfers/intake?item=${encodeURIComponent(item.name)}`}
                className="btn-red-glow glow-pulse rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/35"
              >
                Request Availability
              </Link>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base text-white/70">
                Cart checkout coming soon.
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Pickup / transfers">
            <div className="text-white/70 text-lg space-y-3">
              <p>Local pickup and transfer workflow will be confirmed after intake.</p>
              <p className="text-white/60">
                For request-only items, submit intake to start the process.
              </p>
            </div>
          </Card>

          <Card title="Related categories">
            <div className="grid gap-3 sm:grid-cols-2">
              {["Accessories", "Rifles", "Handguns", "Collectibles", "Apparel"].map((c) => (
                <Link
                  key={c}
                  href={`/shop?cat=${encodeURIComponent(c)}`}
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white/80 transition hover:bg-red-600/25 hover:text-white"
                >
                  {c}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
