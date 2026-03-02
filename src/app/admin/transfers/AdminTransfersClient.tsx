"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { updateTransferStatus, updateTransferStatuses, deleteTransfer, deleteTransfers, updateTransferNotes } from "./actions";
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

function statusTone(status: string) {
  const s = (status || "Pending").toLowerCase();
  if (s === "completed") return "border-emerald-500/30 bg-emerald-500/15 text-emerald-200";
  if (s === "ready") return "border-violet-500/30 bg-violet-500/15 text-violet-200";
  if (s === "received") return "border-sky-500/30 bg-sky-500/15 text-sky-200";
  return "border-amber-500/30 bg-amber-500/15 text-amber-200";
}

function toCsv(rows: any[]) {
  const headers = [
    "id",
    "created_at",
    "status",
    "full_name",
    "phone",
    "email",
    "address",
    "seller_name",
    "seller_website",
    "tracking_number",
    "firearm_type",
    "item_name",
    "serial_number",
    "expected_arrival",
    "notes",
  ];
  const escape = (v: any) => {
    const s = String(v ?? "");
    const needs = /[",\n]/.test(s);
    const out = s.replaceAll('"', '""');
    return needs ? `"${out}"` : out;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h])).join(","));
  }
  return lines.join("\n");
}

function downloadCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function verifyDelete(label: string) {
  const v = window.prompt(`Type DELETE to confirm deletion of ${label}`);
  return (v || "").trim().toUpperCase() === "DELETE";
}

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
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [noteSaving, setNoteSaving] = useState<Record<number, boolean>>({});

  useEffect(() => {
  setPage(1);
  setSelected({});
}, [query, statusFilter]);

const metrics = useMemo(() => {
  const all = rows;
  const count = (s: string) => all.filter((r) => (r.status || "Pending") === s).length;
  return {
    total: all.length,
    pending: count("Pending"),
    received: count("Received"),
    ready: count("Ready"),
    completed: count("Completed"),
  };
}, [rows]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  function getNoteDraft(t: TransferRow) {
  return noteDrafts[t.id] ?? (t.notes || "");
}

function setNoteDraft(id: number, v: string) {
  setNoteDrafts((prev) => ({ ...prev, [id]: v }));
}

function saveNotes(id: number) {
  const notes = (noteDrafts[id] ?? "").trim();
  setNoteSaving((p) => ({ ...p, [id]: true }));
  setMsg(null);

  // optimistic update
  setRows((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)));

  startTransition(async () => {
    try {
      await updateTransferNotes({ id, notes });
      setMsg(`Notes saved for #${id}.`);
      setTimeout(() => setMsg(null), 1500);
    } catch (e: any) {
      setMsg(e?.message || "Failed to save notes.");
    } finally {
      setNoteSaving((p) => ({ ...p, [id]: false }));
    }
  });
}

function isSelected(id: number) {
  return !!selected[id];
}

function toggleOne(id: number) {
  setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
}

function toggleAllCurrentPage() {
  const allChecked = paged.every((r) => selected[r.id]);
  setSelected((prev) => {
    const next = { ...prev };
    for (const r of paged) next[r.id] = !allChecked;
    return next;
  });
}

const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)), [selected]);

function onDeleteOne(id: number) {
  if (!verifyDelete(`#${id}`)) return;

  // optimistic remove
  setRows((prev) => prev.filter((r) => r.id !== id));
  setSelected((prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });

  startTransition(async () => {
    try {
      await deleteTransfer({ id });
      setMsg(`Deleted #${id}.`);
      setTimeout(() => setMsg(null), 1500);
    } catch (e: any) {
      setMsg(e?.message || "Delete failed.");
    }
  });
}

function bulkDelete() {
  if (!selectedIds.length) return;
  if (!verifyDelete(`${selectedIds.length} transfer(s)`)) return;

  const ids = [...selectedIds];
  setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
  setSelected({});

  startTransition(async () => {
    try {
      await deleteTransfers({ ids });
      setMsg(`Deleted ${ids.length} transfer(s).`);
      setTimeout(() => setMsg(null), 1500);
    } catch (e: any) {
      setMsg(e?.message || "Bulk delete failed.");
    }
  });
}

function bulkSetStatus(next: string) {
  if (!selectedIds.length) return;
  setMsg(null);

  // optimistic
  setRows((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: next } : r)));

  startTransition(async () => {
    try {
      await updateTransferStatuses({ ids: selectedIds, status: next });
      setMsg(`Updated ${selectedIds.length} transfer(s).`);
      setTimeout(() => setMsg(null), 1500);
      setSelected({});
    } catch (e: any) {
      setMsg(e?.message || "Bulk update failed.");
    }
  });
}

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
            {filtered.length} results • {metrics.total} total
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
              className="w-full sm:w-[420px] rounded-2xl border border-white/10 bg-black/45 px-5 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-[220px] rounded-2xl border border-white/10 bg-black/45 px-5 py-2.5 text-sm text-white/90 outline-none focus:ring-2 focus:ring-red-500/40"
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
        {paged.map((t) => (
          <Card key={t.id} title={`#${t.id} • ${t.full_name}`}>
            <div className="mb-4 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-white/70 text-sm">
                <input type="checkbox" checked={isSelected(t.id)} onChange={() => toggleOne(t.id)} />
                Select
              </label>
              <span className={`rounded-xl border px-3 py-1 text-sm font-semibold ${statusTone(t.status || 'Pending')}`}>{t.status || 'Pending'}</span>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="text-white/60">
                <div>
                  <span className="text-white/50 text-sm">Created:</span>{" "}
                  <span className="text-white/80 font-semibold">{formatInSiteTz(t.created_at)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDeleteOne(t.id)}
                    className="rounded-xl border border-red-500/20 bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-600/20"
                    title="Delete this intake"
                  >
                    Delete
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2">
                    <span className="text-white/50 text-xs">Status</span>
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
              </div>

              <div className="grid gap-4 lg:grid-cols-3 text-base w-full">
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
                  <textarea
                    value={getNoteDraft(t)}
                    onChange={(e) => setNoteDraft(t.id, e.target.value)}
                    placeholder="Add internal notes…"
                    className="mt-2 w-full min-h-[96px] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveNotes(t.id)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
                      disabled={!!noteSaving[t.id]}
                    >
                      {noteSaving[t.id] ? "Saving…" : "Save notes"}
                    </button>
                    <div className="text-white/40 text-xs">Internal only</div>
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
