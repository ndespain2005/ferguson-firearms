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

type PurchaseRequestLite = {
  id: string;
  created_at: string;
  status: string | null;
  firearm: string;
  source: string | null;
  receiving_ffl: string;
  notes: string | null;
};

type ServiceQuoteLite = {
  id: string;
  created_at: string;
  status: string | null;
  service_type: string;
  description: string;
};

type ContactMessageLite = {
  id: string;
  created_at: string;
  status: string | null;
  topic: string;
  message: string;
};

type Stats = {
  totals: { purchaseRequests: number; serviceQuotes: number; contactMessages: number; transfers: number };
  open: { purchaseRequests: number; serviceQuotes: number; contactMessages: number; transfers: number };
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

function toneForStatus(status: string | null | undefined) {
  const s = (status || "New").toLowerCase();
  if (["complete", "completed"].includes(s)) return "success";
  if (["ready"].includes(s)) return "info";
  if (["closed"].includes(s)) return "muted";
  if (["quoted", "ordered", "received", "in progress", "pending", "scheduled"].includes(s)) return "warn";
  return "danger";
}

export default function AccountPage() {
  const { user } = useUser();
  const wishlist = useWishlist();
  const { prefs, update } = usePreferences();

  const [tab, setTab] = useState<"dashboard" | "activity" | "transfers" | "profile" | "wishlist" | "prefs">(
    "dashboard"
  );

  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [purchaseRows, setPurchaseRows] = useState<PurchaseRequestLite[]>([]);
  const [quoteRows, setQuoteRows] = useState<ServiceQuoteLite[]>([]);
  const [contactRows, setContactRows] = useState<ContactMessageLite[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [transfers, setTransfers] = useState<TransferLite[]>([]);
  const [tLoading, setTLoading] = useState(false);
  const [tError, setTError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const meta = (user.unsafeMetadata || {}) as any;
    const p = meta.profile || {};
    setProfile({
      name: p.name || user.fullName || "",
      phone: p.phone || "",
      address1: p.address1 || "",
      address2: p.address2 || "",
      city: p.city || "",
      state: p.state || "",
      zip: p.zip || "",
    });
  }, [user]);

  // Live stats from Supabase (via server API)
  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    fetch("/api/my/stats")
      .then((r) => r.json())
      .then((j) => (j?.ok ? setStats({ totals: j.totals, open: j.open }) : null))
      .catch(() => null)
      .finally(() => setStatsLoading(false));
  }, [user]);

  // Activity lists (lazy)
  useEffect(() => {
    if (!user) return;
    if (tab !== "activity" && tab !== "dashboard") return;

    setActivityLoading(true);
    Promise.all([
      fetch("/api/my/purchase-requests").then((r) => r.json()).catch(() => null),
      fetch("/api/my/service-quotes").then((r) => r.json()).catch(() => null),
      fetch("/api/my/contact-messages").then((r) => r.json()).catch(() => null),
    ])
      .then(([p, q, c]) => {
        setPurchaseRows((p?.ok ? p.rows : []) || []);
        setQuoteRows((q?.ok ? q.rows : []) || []);
        setContactRows((c?.ok ? c.rows : []) || []);
      })
      .finally(() => setActivityLoading(false));
  }, [user, tab]);

  // Transfers (existing behavior)
  useEffect(() => {
    if (!user) return;
    setTLoading(true);
    setTError(null);
    fetch("/api/my/transfers")
      .then((r) => r.json())
      .then((j) => {
        if (!j?.ok) throw new Error(j?.error || "Failed to load transfers");
        setTransfers(j.transfers || []);
      })
      .catch((e) => setTError(e?.message || "Failed to load transfers"))
      .finally(() => setTLoading(false));
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          profile,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    } finally {
      setSaving(false);
    }
  }

  const wishlistItems = useMemo(() => {
    const set = new Set(wishlist.list);
    return INVENTORY.filter((i) => set.has(i.id));
  }, [wishlist.list]);

  const displayName = user?.firstName || user?.fullName || "Account";

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Account"
        title={`Welcome back, ${displayName}`}
        subtitle="Hybrid tactical + enterprise: clean workflows, clear statuses, fast communication."
      />

      <SignedOut>
        <Card title="Sign in required">
          <div className="text-sm text-muted">Sign in to view your dashboard and track requests.</div>
          <div className="mt-4 flex gap-3">
            <ButtonLink href="/sign-in">Sign in</ButtonLink>
            <ButtonLink href="/sign-up" variant="secondary">
              Create account
            </ButtonLink>
          </div>
        </Card>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
            Dashboard
          </TabButton>
          <TabButton active={tab === "activity"} onClick={() => setTab("activity")}>
            My Activity
          </TabButton>
          <TabButton active={tab === "transfers"} onClick={() => setTab("transfers")}>
            Transfers
          </TabButton>
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
            Profile
          </TabButton>
          <TabButton active={tab === "wishlist"} onClick={() => setTab("wishlist")}>
            Wishlist
          </TabButton>
          <TabButton active={tab === "prefs"} onClick={() => setTab("prefs")}>
            Preferences
          </TabButton>
        </div>

        {tab === "dashboard" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Overview">
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard title="Open purchase requests" value={stats?.open.purchaseRequests} loading={statsLoading} />
                  <StatCard title="Open service quotes" value={stats?.open.serviceQuotes} loading={statsLoading} />
                  <StatCard title="Transfers in progress" value={stats?.open.transfers} loading={statsLoading} />
                  <StatCard title="Open messages" value={stats?.open.contactMessages} loading={statsLoading} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <QuickLink href="/firearms/request" title="New firearm request" desc="Model/SKU + vendor link." />
                  <QuickLink href="/quote" title="Request a quote" desc="Gunsmithing / installs." />
                  <QuickLink href="/transfers/intake" title="Start transfer intake" desc="Track it end-to-end." />
                </div>
              </Card>

              <Card title="Recent activity">
                {activityLoading ? (
                  <div className="text-sm text-muted">Loading…</div>
                ) : (
                  <div className="space-y-4">
                    <Recent label="Purchase requests" items={purchaseRows.slice(0, 3).map((r) => ({ id: r.id, created_at: r.created_at, status: r.status, text: r.firearm }))} />
                    <Recent label="Service quotes" items={quoteRows.slice(0, 3).map((r) => ({ id: r.id, created_at: r.created_at, status: r.status, text: `${r.service_type}: ${r.description}` }))} />
                    <Recent label="Messages" items={contactRows.slice(0, 3).map((r) => ({ id: r.id, created_at: r.created_at, status: r.status, text: `${r.topic}: ${r.message}` }))} />
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Quick access">
                <div className="grid gap-2">
                  <ButtonLink href="/contact" variant="secondary">
                    Contact the shop
                  </ButtonLink>
                  <ButtonLink href="/admin" variant="secondary">
                    Admin dashboard
                  </ButtonLink>
                </div>
                <div className="mt-4 text-xs text-muted">
                  Pro tip: include SKUs/links when possible for fastest quotes.
                </div>
              </Card>

              <Card title="Preferences snapshot">
                <div className="text-sm text-muted space-y-2">
                  <div>
                    <span className="text-foreground font-medium">Email updates:</span> {prefs.emailUpdates ? "On" : "Off"}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">Weekly deals:</span> {prefs.weeklyDeals ? "On" : "Off"}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {tab === "activity" ? (
          <div className="space-y-6">
            <Card title="Purchase requests">
              <SimpleTable
                columns={["Submitted", "Status", "Details"]}
                rows={purchaseRows.map((r) => [
                  formatLocal(r.created_at),
                  <Badge key={r.id} tone={toneForStatus(r.status)}>{r.status || "New"}</Badge>,
                  <span key={r.id + "-d"} className="text-sm text-muted">{r.firearm}</span>,
                ])}
                empty="No purchase requests yet."
                loading={activityLoading}
              />
            </Card>

            <Card title="Service quotes">
              <SimpleTable
                columns={["Submitted", "Status", "Details"]}
                rows={quoteRows.map((r) => [
                  formatLocal(r.created_at),
                  <Badge key={r.id} tone={toneForStatus(r.status)}>{r.status || "New"}</Badge>,
                  <span key={r.id + "-d"} className="text-sm text-muted">{r.service_type}: {r.description}</span>,
                ])}
                empty="No quote requests yet."
                loading={activityLoading}
              />
            </Card>

            <Card title="Contact messages">
              <SimpleTable
                columns={["Submitted", "Status", "Message"]}
                rows={contactRows.map((r) => [
                  formatLocal(r.created_at),
                  <Badge key={r.id} tone={toneForStatus(r.status)}>{r.status || "New"}</Badge>,
                  <span key={r.id + "-m"} className="text-sm text-muted">{r.topic}: {r.message}</span>,
                ])}
                empty="No messages yet."
                loading={activityLoading}
              />
            </Card>
          </div>
        ) : null}

        {tab === "transfers" ? (
          <Card title="Transfers">
            {tLoading ? <div className="text-sm text-muted">Loading…</div> : null}
            {tError ? <div className="text-sm text-red-400">{tError}</div> : null}

            {!tLoading && !tError ? (
              <div className="space-y-3">
                {transfers.length === 0 ? (
                  <div className="text-sm text-muted">No transfers yet.</div>
                ) : (
                  transfers.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{t.item_name || "Transfer"}</div>
                        <Badge tone={toneForStatus(t.status)}>{t.status || "Pending"}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted">
                        Submitted: {formatLocal(t.created_at)} • Seller: {t.seller_name || "—"} • Tracking:{" "}
                        {t.tracking_number || "—"}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link className="text-sm text-red-400 hover:text-red-300" href="/transfers">
                          Transfer info
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </Card>
        ) : null}

        {tab === "profile" ? (
          <Card title="Profile">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
              <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
              <Field label="Address 1" value={profile.address1} onChange={(v) => setProfile({ ...profile, address1: v })} />
              <Field label="Address 2" value={profile.address2} onChange={(v) => setProfile({ ...profile, address2: v })} />
              <Field label="City" value={profile.city} onChange={(v) => setProfile({ ...profile, city: v })} />
              <Field label="State" value={profile.state} onChange={(v) => setProfile({ ...profile, state: v })} />
              <Field label="ZIP" value={profile.zip} onChange={(v) => setProfile({ ...profile, zip: v })} />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => void saveProfile()}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save profile"}
              </button>
              {saved ? <span className="text-sm text-emerald-300">Saved</span> : null}
            </div>
          </Card>
        ) : null}

        {tab === "wishlist" ? (
          <Card title="Wishlist">
            {wishlistItems.length === 0 ? (
              <div className="text-sm text-muted">No saved items yet.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {wishlistItems.map((i) => (
                  <div key={i.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="font-medium">{i.name}</div>
                    <div className="mt-1 text-sm text-muted">{i.category}</div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/inventory/${i.id}`} className="text-sm text-red-400 hover:text-red-300">
                        View
                      </Link>
                      <button className="text-sm text-white/60 hover:text-white" onClick={() => wishlist.toggle(i.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {tab === "prefs" ? (
          <Card title="Preferences">
            <div className="space-y-4">
              <ToggleRow
                title="Email updates"
                desc="Get status updates on your requests."
                value={prefs.emailUpdates}
                onChange={(v) => update({ emailUpdates: v })}
              />
              <ToggleRow
                title="Weekly deals"
                desc="Receive weekly deal highlights."
                value={prefs.weeklyDeals}
                onChange={(v) => update({ weeklyDeals: v })}
              />
            </div>
          </Card>
        ) : null}
      </SignedIn>
    </div>
  );
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-xl border px-3 py-2 text-sm transition " +
        (active
          ? "border-red-500/40 bg-red-600/15 text-white"
          : "border-white/10 bg-black/30 text-white/70 hover:text-white hover:border-white/20")
      }
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, loading }: { title: string; value?: number; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="text-sm text-white/60">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{loading ? "—" : String(value ?? 0)}</div>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-white/20">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-white/60">{desc}</div>
    </a>
  );
}

function Recent({
  label,
  items,
}: {
  label: string;
  items: Array<{ id: string; created_at: string; status: string | null; text: string }>;
}) {
  return (
    <div>
      <div className="text-sm font-semibold">{label}</div>
      {items.length === 0 ? (
        <div className="mt-1 text-sm text-muted">No items yet.</div>
      ) : (
        <div className="mt-2 space-y-2">
          {items.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background p-3"
            >
              <div className="min-w-0">
                <div className="text-sm text-muted">{formatLocal(r.created_at)}</div>
                <div className="truncate text-sm">{r.text}</div>
              </div>
              <Badge tone={toneForStatus(r.status)}>{r.status || "New"}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimpleTable({
  columns,
  rows,
  empty,
  loading,
}: {
  columns: string[];
  rows: any[][];
  empty: string;
  loading?: boolean;
}) {
  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (!rows.length) return <div className="text-sm text-muted">{empty}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c} className="py-2 pr-4">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-border align-top">
              {r.map((cell, j) => (
                <td key={j} className="py-3 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-2">
      <div className="text-sm text-muted">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function ToggleRow({
  title,
  desc,
  value,
  onChange,
}: {
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background p-4">
      <div>
        <div className="font-medium">{title}</div>
        <div className="mt-1 text-sm text-muted">{desc}</div>
      </div>
      <button
        className={
          "rounded-full px-3 py-1 text-xs font-semibold " +
          (value ? "bg-red-600 text-white" : "bg-black/30 text-white/70 border border-white/10")
        }
        onClick={() => onChange(!value)}
      >
        {value ? "On" : "Off"}
      </button>
    </div>
  );
}
