"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Card, ButtonLink, SectionHeading, Badge } from "@/components/ui";
import { useWishlist } from "@/lib/use-wishlist";
import { INVENTORY } from "@/lib/inventory";
import { usePreferences } from "@/lib/use-preferences";

type Profile = {
  name: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
};

type TransferLite = {
  id: number;
  created_at: string;
  status: string | null;
  firearm_type: string | null;
  item_name: string | null;
  serial_number?: string | null;
  seller_name: string | null;
  seller_website?: string | null;
  tracking_number: string | null;
  notes?: string | null;
  expected_arrival?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};


const EMPTY: Profile = {
  name: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

const TIMELINE = ["Pending", "Received", "Ready", "Completed"] as const;

function stepIndex(status: string | null) {
  const s = (status || "Pending").toLowerCase();
  const idx = TIMELINE.findIndex((t) => t.toLowerCase() === s);
  return idx >= 0 ? idx : 0;
}

function formatLocal(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const wishlist = useWishlist();
  const { prefs, update } = usePreferences();

  const [tab, setTab] = useState<"profile" | "transfers" | "wishlist" | "prefs">("profile");

  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [transfers, setTransfers] = useState<TransferLite[]>([]);
  const [tLoading, setTLoading] = useState(false);
  const [tError, setTError] = useState<string | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferLite | null>(null);
  const [updSaving, setUpdSaving] = useState(false);
  const [updMsg, setUpdMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const meta = (user.unsafeMetadata || {}) as any;

    setProfile({
      name: (user.fullName || meta.name || "").toString(),
      phone: (meta.phone || "").toString(),
      address1: (meta.address1 || "").toString(),
      address2: (meta.address2 || "").toString(),
      city: (meta.city || "").toString(),
      state: (meta.state || "").toString(),
      zip: (meta.zip || "").toString(),
    });
  }, [user]);

  const email = useMemo(() => user?.primaryEmailAddress?.emailAddress || "", [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await user.update({
        firstName: profile.name.split(" ")[0] || undefined,
        lastName: profile.name.split(" ").slice(1).join(" ") || undefined,
      });

      await user.update({
        unsafeMetadata: {
          name: profile.name,
          phone: profile.phone,
          address1: profile.address1,
          address2: profile.address2,
          city: profile.city,
          state: profile.state,
          zip: profile.zip,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  async function loadTransfers() {
    setTLoading(true);
    setTError(null);
    try {
      const res = await fetch("/api/my/transfers", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load transfers.");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load transfers.");
      setTransfers((json.transfers || []) as TransferLite[]);
    } catch (e: any) {
      setTError(e?.message || "Failed to load transfers.");
    } finally {
      setTLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "transfers") loadTransfers();
  }, [tab]);

  const wishlistItems = useMemo(() => {
    const set = new Set(wishlist.list);
    return INVENTORY.filter((p) => set.has(p.id));
  }, [wishlist.list]);

  if (!isLoaded) return <div className="px-4 py-10 text-white/60">Loading…</div>;

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Account"
        title="My Account"
        subtitle="Manage your profile, view transfer requests, and save items for later."
      />

      <SignedOut>
        <Card title="Sign in required">
          <div className="text-white/70 text-lg">Please sign in to view your account.</div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/sign-in">Sign In</ButtonLink>
            <ButtonLink href="/sign-up" variant="ghost">
              Create Account
            </ButtonLink>
          </div>
        </Card>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{email}</Badge>
          <Link
            href="/shop"
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
          >
            Back to Shop
          </Link>
          <Link
            href="/transfers/intake"
            className="btn-red-glow glow-pulse rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/35"
          >
            Start a Transfer
          </Link>
        </div>

        <Card title="Dashboard">
          <div className="flex flex-wrap gap-2">
            <Tab active={tab === "profile"} onClick={() => setTab("profile")}>Profile</Tab>
            <Tab active={tab === "transfers"} onClick={() => setTab("transfers")}>Transfers</Tab>
            <Tab active={tab === "wishlist"} onClick={() => setTab("wishlist")}>Wishlist ({wishlist.count})</Tab>
            <Tab active={tab === "prefs"} onClick={() => setTab("prefs")}>Preferences</Tab>
          </div>

          <div className="mt-6">
            {tab === "profile" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Profile & contact">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                      <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                    </div>
                    <Field label="Address line 1" value={profile.address1} onChange={(v) => setProfile({ ...profile, address1: v })} />
                    <Field label="Address line 2" value={profile.address2} onChange={(v) => setProfile({ ...profile, address2: v })} />

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="City" value={profile.city} onChange={(v) => setProfile({ ...profile, city: v })} />
                      <Field label="State" value={profile.state} onChange={(v) => setProfile({ ...profile, state: v })} />
                      <Field label="ZIP" value={profile.zip} onChange={(v) => setProfile({ ...profile, zip: v })} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="btn-red-glow inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save Profile"}
                      </button>
                      {saved ? <span className="text-red-300 font-semibold">Saved</span> : null}
                    </div>
                  </div>
                </Card>

                <Card title="Security & help">
                  <div className="text-white/70 text-lg space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      Password reset is handled by Clerk. Use “Forgot password” on sign-in.
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <ButtonLink href="/sign-in">Open Sign In</ButtonLink>
                      <ButtonLink href="/contact" variant="ghost">Contact Support</ButtonLink>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}

            {tab === "transfers" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={loadTransfers}
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
                  >
                    Refresh
                  </button>
                  {tLoading ? <Badge>Loading…</Badge> : null}
                  {tError ? <Badge>{tError}</Badge> : null}
                </div>

                {transfers.length ? (
                  <div className="overflow-hidden rounded-3xl border border-white/10">
                    <div className="grid grid-cols-12 bg-black/40 px-4 py-3 text-xs font-semibold text-white/60">
                      <div className="col-span-3">Date</div>
                      <div className="col-span-3">Status</div>
                      <div className="col-span-3">Type</div>
                      <div className="col-span-3">Item</div>
                    </div>
                    {transfers.map((t) => (
                      <button key={t.id} type="button" onClick={() => setSelectedTransfer(t)} className="grid w-full grid-cols-12 gap-2 border-t border-white/10 bg-black/25 px-4 py-3 text-left text-sm text-white/70 transition hover:bg-black/35">
                        <div className="col-span-3">{formatLocal(t.created_at)}</div>
                        <div className="col-span-3">
                          <span className="rounded-xl border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold text-white/80">
                            {t.status || "Pending"}
                          </span>
                        </div>
                        <div className="col-span-3">{t.firearm_type || "—"}</div>
                        <div className="col-span-3 truncate">{t.item_name || "—"}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-white/70">
                    No transfers found for this email yet.
                    <div className="mt-3">
                      <Link
                        href="/transfers/intake"
                        className="btn-red-glow glow-pulse inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/35"
                      >
                        Start a Transfer
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {tab === "wishlist" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={wishlist.clear}
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
                  >
                    Clear wishlist
                  </button>
                  <Link
                    href="/shop"
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
                  >
                    Browse shop
                  </Link>
                </div>

                {wishlistItems.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistItems.map((p) => (
                      <Link
                        key={p.id}
                        href={`/shop/${encodeURIComponent(p.id)}`}
                        className="rounded-3xl border border-white/10 bg-black/25 p-5 transition hover:border-red-500/25 hover:bg-black/35"
                      >
                        <div className="text-lg font-semibold text-white/85">{p.name}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge>{p.category}</Badge>
                          {p.tag ? <Badge>{p.tag}</Badge> : null}
                          {p.brand ? <Badge>{p.brand}</Badge> : null}
                        </div>
                        <div className="mt-3 text-white/60 text-sm">
                          {p.stock < 0 ? "Request only" : p.stock === 0 ? "Out of stock" : `In stock: ${p.stock}`}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-white/70">
                    Your wishlist is empty.
                  </div>
                )}
              </div>
            ) : null}

            {tab === "prefs" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Notifications">
                  <div className="space-y-4 text-white/70">
                    <Toggle
                      label="Transfer ready texts (placeholder)"
                      description="Keep this on to receive a pickup-ready notification in the future."
                      value={prefs.transferReadyTexts}
                      onChange={(v) => update({ transferReadyTexts: v })}
                    />
                    <Toggle
                      label="Marketing emails (placeholder)"
                      description="Occasional promos and shop updates."
                      value={prefs.marketingEmails}
                      onChange={(v) => update({ marketingEmails: v })}
                    />
                  </div>
                </Card>

                <Card title="Payments">
                  <div className="space-y-4 text-white/70">
                    <Toggle
                      label="Save card for faster checkout (placeholder)"
                      description="Checkout is not enabled yet. This saves your preference only."
                      value={prefs.savedCardPlaceholder}
                      onChange={(v) => update({ savedCardPlaceholder: v })}
                    />
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-white/60 text-sm">
                      When you add a real checkout system, this page can be wired to a payment provider.
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        </Card>
      
{selectedTransfer ? (
  <TransferModal
    t={selectedTransfer}
    onClose={() => {
      setSelectedTransfer(null);
      setUpdMsg(null);
    }}
    onSaved={async () => {
      await loadTransfers();
    }}
  />
) : null}

</SignedIn>
    </div>
  );
}

function TransferModal({
  t,
  onClose,
  onSaved,
}: {
  t: TransferLite;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [tracking, setTracking] = useState(t.tracking_number || "");
  const [seller, setSeller] = useState(t.seller_name || "");
  const [sellerUrl, setSellerUrl] = useState(t.seller_website || "");
  const [notes, setNotes] = useState(t.notes || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const idx = stepIndex(t.status);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/my/transfers/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: tracking,
          seller_name: seller,
          seller_website: sellerUrl,
          notes,
        }),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
      setMsg("Saved");
      await onSaved();
      setTimeout(() => setMsg(null), 1500);
    } catch (e: any) {
      setMsg(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-black/85 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-white/90">Transfer #{t.id}</div>
            <div className="mt-1 text-white/60 text-sm">{formatLocal(t.created_at)}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-red-600/15 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/35 p-5">
          <div className="text-white/70 text-sm font-semibold">Status timeline</div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {TIMELINE.map((s, i) => {
              const done = i <= idx;
              return (
                <div key={s} className="space-y-2">
                  <div
                    className={`h-2 rounded-full border ${
                      done ? "border-red-500/40 bg-red-600/25" : "border-white/10 bg-black/30"
                    }`}
                  />
                  <div className={`text-xs font-semibold ${done ? "text-white/80" : "text-white/45"}`}>{s}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 inline-flex items-center gap-2">
            <span className="rounded-xl border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold text-white/80">
              {t.status || "Pending"}
            </span>
            <span className="text-white/50 text-xs">Updates come from Ferguson Firearms.</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="Details">
            <div className="space-y-3 text-white/70 text-sm">
              <div>
                <div className="text-white/50 text-xs">Type</div>
                <div className="text-white/80 font-semibold">{t.firearm_type || "—"}</div>
              </div>
              <div>
                <div className="text-white/50 text-xs">Item</div>
                <div className="text-white/80 font-semibold">{t.item_name || "—"}</div>
              </div>
              {t.serial_number ? (
                <div>
                  <div className="text-white/50 text-xs">Serial</div>
                  <div className="text-white/80 font-semibold">{t.serial_number}</div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card title="Update info (limited)">
            <div className="space-y-4">
              <Field label="Tracking number" value={tracking} onChange={setTracking} />
              <Field label="Seller name" value={seller} onChange={setSeller} />
              <Field label="Seller website" value={sellerUrl} onChange={setSellerUrl} />
              <label className="block space-y-2">
                <div className="text-white/70">Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[110px] rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
                  placeholder="Add any helpful info for the shop…"
                />
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="btn-red-glow inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save updates"}
                </button>
                {msg ? <span className="text-white/70 text-sm">{msg}</span> : null}
              </div>

              <div className="text-white/40 text-xs">
                For security, you can only update tracking, seller info, and notes. If you need changes to the item/type,
                contact the shop.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-white/70">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/85 font-semibold">{label}</div>
          <div className="mt-1 text-white/60 text-sm">{description}</div>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`h-9 w-16 rounded-full border transition ${
            value ? "border-red-500/40 bg-red-600/25" : "border-white/10 bg-black/35"
          }`}
          aria-label={label}
        >
          <span
            className={`block h-7 w-7 translate-x-1 rounded-full bg-white/80 transition ${
              value ? "translate-x-8 bg-red-200" : ""
            }`}
          />
        </button>
      </div>
    
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="text-sm font-medium">Admin</div>
        <div className="mt-1 text-xs text-muted">View customer purchase requests (admin only).</div>
        <a
          href="/admin/purchase-requests"
          className="mt-3 inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90"
        >
          Open Purchase Requests
        </a>
      </div>


      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="text-sm font-medium">Admin</div>
        <div className="mt-1 text-xs text-muted">View inboxes (admin only).</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/admin/purchase-requests"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90"
          >
            Purchase Requests
          </a>
          <a
            href="/admin/service-quotes"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90"
          >
            Service Quotes
          </a>
          <a
            href="/admin/contact-messages"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90"
          >
            Contact Messages
          </a>
        </div>
      </div>

</div>
  );
}
