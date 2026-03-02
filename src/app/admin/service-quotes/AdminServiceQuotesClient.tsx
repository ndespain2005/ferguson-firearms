"use client";

import { useState } from "react";
import { updateServiceQuote, type QuoteStatus } from "./actions";

type Row = {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string;
  service_type: string;
  description: string;
  status: string | null;
  internal_notes: string | null;
};

const STATUSES: QuoteStatus[] = ["New", "Quoted", "Scheduled", "In Progress", "Complete", "Closed"];

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminServiceQuotesClient({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function patch(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    const status = (STATUSES.includes((r.status as any) ?? "New") ? (r.status as any) : "New") as QuoteStatus;

    setSavingId(id);
    setToast(null);
    try {
      await updateServiceQuote({ id, status, internalNotes: r.internal_notes ?? "" });
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
              <th className="py-2 pr-4">Request</th>
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
                  <div className="mt-2 text-xs">
                    <span className="text-muted">Service:</span> {r.service_type}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <details>
                    <summary className="cursor-pointer select-none">
                      <span className="font-medium">View</span>
                      <span className="text-muted">
                        {" "}
                        — {r.description.slice(0, 56)}
                        {r.description.length > 56 ? "…" : ""}
                      </span>
                    </summary>
                    <div className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted">
                      {r.description}
                    </div>
                  </details>
                </td>
                <td className="py-3 pr-4">
                  <label className="block">
                    <div className="text-xs text-muted">Status</div>
                    <select
                      value={(STATUSES.includes((r.status as any) ?? "New") ? (r.status as any) : "New") as string}
                      onChange={(e) => patch(r.id, { status: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-2 block">
                    <div className="text-xs text-muted">Internal notes</div>
                    <textarea
                      value={r.internal_notes ?? ""}
                      onChange={(e) => patch(r.id, { internal_notes: e.target.value })}
                      className="mt-1 min-h-20 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => void save(r.id)}
                    disabled={savingId === r.id}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 disabled:opacity-60"
                  >
                    {savingId === r.id ? "Saving…" : "Save"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-sm text-muted">
                  No quotes yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
