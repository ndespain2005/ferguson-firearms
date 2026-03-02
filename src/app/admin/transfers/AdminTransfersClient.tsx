"use client";

import { useMemo, useState, useTransition } from "react";
import { updateTransferStatus } from "./actions";
import { Card, Badge } from "@/components/ui";
import { SITE } from "@/lib/site-config";

type TransferRow = {
  id: number;
  created_at: string;
  status: string | null;
  item_name: string | null;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  seller_name: string;
  seller_website: string | null;
  tracking_number: string | null;
  firearm_type: string;
  serial_number: string | null;
  expected_arrival: string | null;
  notes: string | null;
};

const STATUSES = ["Pending", "Received", "Ready", "Completed"] as const;

function formatInSiteTz(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: SITE.timeZone,
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

function contains(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export default function AdminTransfersClient({ initial }: { initial: TransferRow[] }) {
  const [rows, setRows] = useState<TransferRow[]>(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | (typeof STATUSES)[number]>("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((t) => {
      if (statusFilter && (t.status || "Pending") !== statusFilter) return false;
      if (!q) return true;
      const blob = [
        t.full_name,
        t.phone,
        t.email,
        t.address,
        t.seller_name,
        t.seller_website || "",
        t.tracking_number || "",
        t.firearm_type,
        t.item_name || "",
        t.serial_number || "",
        t.expected_arrival || "",
        t.notes || "",
        String(t.id),
      ].join(" • ").toLowerCase();
      return blob.includes(q);
    });
  }, [rows, query, statusFilter]);

  function onChangeStatus(id: number, next: string) {
    setMsg(null);

    // Optimistic update
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));

    startTransition(async () => {
      try {
        await updateTransferStatus({ id, status: next });
        setMsg("Status updated.");
        setTimeout(() => setMsg(null), 1500);
      } catch (e: any) {
        // Revert on error
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: initial.find(x => x.id===id)?.status ?? r.status } : r)));
        setMsg(e?.message || "Failed to update status.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/70">
            {filtered.length} results
          </div>
          {isPending ? <Badge>Updating…</Badge> : null}
          {msg ? <Badge>{msg}</Badge> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, tracking, item, notes…"
              className="w-full sm:w-[420px] rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-[220px] rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5">
        {filtered.map((t) => (
          <Card key={t.id} title={`#${t.id} • ${t.full_name}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="text-white/60">
                <div>
                  <span className="text-white/50 text-sm">Created:</span>{" "}
                  <span className="text-white/80 font-semibold">{formatInSiteTz(t.created_at)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-white/50 text-sm">Status:</span>
                  <select
                    value={t.status || "Pending"}
                    onChange={(e) => onChangeStatus(t.id, e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-sm text-white/90 outline-none focus:ring-2 focus:ring-red-500/40"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3 text-lg w-full">
                <div className="text-white/70">
                  <div className="text-white/50 text-sm">Customer</div>
                  <div className="font-semibold text-white/85">{t.full_name}</div>
                  <div>{t.phone}</div>
                  <div className="break-words">{t.email}</div>
                </div>

                <div className="text-white/70">
                  <div className="text-white/50 text-sm">Address</div>
                  <div className="break-words">{t.address}</div>
                </div>

                <div className="text-white/70">
                  <div className="text-white/50 text-sm">Seller</div>
                  <div className="font-semibold text-white/85">{t.seller_name}</div>
                  <div className="break-words">{t.seller_website || "—"}</div>
                  <div className="mt-2">
                    <span className="text-white/50 text-sm">Tracking:</span>{" "}
                    <span className="break-words">{t.tracking_number || "—"}</span>
                  </div>
                </div>

                <div className="text-white/70">
                  <div className="text-white/50 text-sm">Firearm</div>
                  <div className="font-semibold text-white/85">{t.firearm_type}</div>
                  <div className="break-words">{t.item_name || "—"}</div>
                </div>

                <div className="text-white/70">
                  <div className="text-white/50 text-sm">Serial / ETA</div>
                  <div className="break-words">{t.serial_number || "—"}</div>
                  <div className="mt-2">
                    <span className="text-white/50 text-sm">Expected arrival:</span>{" "}
                    <span className="break-words">{t.expected_arrival || "—"}</span>
                  </div>
                </div>

                <div className="text-white/70">
                  <div className="text-white/50 text-sm">Notes</div>
                  <div className="rounded-2xl border border-white/10 bg-black/45 p-4 text-white/70 min-h-[80px]">
                    {t.notes || "—"}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
