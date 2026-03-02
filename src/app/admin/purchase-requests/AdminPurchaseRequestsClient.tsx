"use client";

import { useMemo, useState } from "react";
import { updatePurchaseRequest, type PurchaseStatus } from "./actions";

type PurchaseRow = {
  id: string;
  created_at: string;
  updated_at?: string | null;
  name: string;
  phone: string | null;
  email: string;
  firearm: string;
  source: string | null;
  receiving_ffl: string;
  notes: string | null;
  status: string | null;
  internal_notes?: string | null;
};

const STATUSES: PurchaseStatus[] = ["New", "Quoted", "Ordered", "Ready", "Complete", "Closed"];

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminPurchaseRequestsClient({ initialRows }: { initialRows: PurchaseRow[] }) {
  const [rows, setRows] = useState<PurchaseRow[]>(initialRows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Local draft state (status + internal notes) per row
  const drafts = useMemo(() => {
    const m = new Map<string, { status: PurchaseStatus; internalNotes: string }>();
    for (const r of rows) {
      const status = (STATUSES.includes((r.status as any) ?? "New") ? (r.status as PurchaseStatus) : "New") as PurchaseStatus;
      m.set(r.id, { status, internalNotes: (r.internal_notes ?? "") as string });
    }
    return m;
  }, [rows]);

  function setDraft(id: string, patch: Partial<{ status: PurchaseStatus; internalNotes: string }>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const currentStatus = (STATUSES.includes((r.status as any) ?? "New") ? (r.status as PurchaseStatus) : "New") as PurchaseStatus;
        const currentNotes = (r.internal_notes ?? "") as string;
        return {
          ...r,
          status: patch.status ?? currentStatus,
          internal_notes: patch.internalNotes ?? currentNotes,
        };
      })
    );
  }

  async function save(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r) return;

    const status = (STATUSES.includes((r.status as any) ?? "New") ? (r.status as PurchaseStatus) : "New") as PurchaseStatus;
    const internalNotes = (r.internal_notes ?? "") as string;

    setSavingId(id);
    setToast(null);

    try {
      await updatePurchaseRequest({ id, status, internalNotes });
      setToast({ type: "ok", msg: "Saved." });
    } catch (e: any) {
      setToast({ type: "err", msg: e?.message || "Save failed." });
    } finally {
      setSavingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div
          className={
            "rounded-2xl border p-4 text-sm " +
            (toast.type === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-600/15 text-red-200")
          }
        >
          {toast.msg}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-2 pr-4">Received</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Firearm</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2 pr-4">Workflow</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="py-3 pr-4 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                <td className="py-3 pr-4">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted">{r.email}</div>
                  {r.phone ? <div className="text-xs text-muted">{r.phone}</div> : null}
                </td>

                <td className="py-3 pr-4">
                  <details>
                    <summary className="cursor-pointer select-none">
                      <span className="font-medium">View</span>
                      <span className="text-muted">
                        {" "}
                        — {r.firearm.slice(0, 42)}
                        {r.firearm.length > 42 ? "…" : ""}
                      </span>
                    </summary>

                    <div className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted">
                      {r.firearm}
                    </div>

                    <div className="mt-3 text-xs text-muted">
                      <div className="font-medium text-foreground">Receiving FFL</div>
                      <div className="mt-1 whitespace-pre-wrap rounded-xl border border-border bg-background px-3 py-2">
                        {r.receiving_ffl}
                      </div>
                    </div>

                    {r.notes ? (
                      <div className="mt-3 text-xs text-muted">
                        <div className="font-medium text-foreground">Customer Notes</div>
                        <div className="mt-1 whitespace-pre-wrap rounded-xl border border-border bg-background px-3 py-2">
                          {r.notes}
                        </div>
                      </div>
                    ) : null}
                  </details>
                </td>

                <td className="py-3 pr-4">{r.source ?? <span className="text-muted">—</span>}</td>

                <td className="py-3 pr-4">
                  <div className="space-y-2">
                    <label className="block">
                      <div className="text-xs text-muted">Status</div>
                      <select
                        value={(STATUSES.includes((r.status as any) ?? "New") ? (r.status as any) : "New") as string}
                        onChange={(e) => setDraft(r.id, { status: e.target.value as PurchaseStatus })}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <div className="text-xs text-muted">Internal notes</div>
                      <textarea
                        value={(r.internal_notes ?? "") as string}
                        onChange={(e) => setDraft(r.id, { internalNotes: e.target.value })}
                        placeholder="Admin-only notes (pricing, vendor link, status updates, customer follow-up, etc.)"
                        className="mt-1 min-h-20 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                  </div>
                </td>

                <td className="py-3 pr-4">
                  <button
                    onClick={() => void save(r.id)}
                    disabled={savingId === r.id}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 disabled:opacity-60"
                  >
                    {savingId === r.id ? "Saving…" : "Save"}
                  </button>
                  <div className="mt-2 text-xs text-muted">
                    ID: <span className="font-mono">{r.id.slice(0, 8)}</span>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-sm text-muted">
                  No requests yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
