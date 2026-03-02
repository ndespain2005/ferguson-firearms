"use client";

import { useState } from "react";
import { Card, SectionHeading } from "@/components/ui";

type FormState = {
  name: string;
  phone: string;
  email: string;
  firearm: string;
  source: string;
  receivingFFL: string;
  notes: string;
  // Honeypot (hidden)
  company: string;
};

export default function FirearmsRequestPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    firearm: "",
    source: "",
    receivingFFL: "",
    notes: "",
    company: "",
  });

  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "sending" }
    | { state: "success"; message?: string }
    | { state: "error"; message: string }
  >({ state: "idle" });

  async function submit() {
    setStatus({ state: "sending" });

    try {
      const res = await fetch("/api/purchase-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await res.json().catch(() => null)) as any;

      if (!res.ok) {
        setStatus({ state: "error", message: data?.error || "Something went wrong. Please try again." });
        return;
      }

      // Clear form (keep it nice for customer)
      setForm({
        name: "",
        phone: "",
        email: "",
        firearm: "",
        source: "",
        receivingFFL: "",
        notes: "",
        company: "",
      });

      setStatus({ state: "success", message: data?.warning });
    } catch {
      setStatus({
        state: "error",
        message: "Network error. Please try again (or call the shop and we’ll take the request by phone).",
      });
    }
  }

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Request"
        title="Firearm Purchase Request"
        subtitle="Send us the details and we’ll reply with pricing, availability, and next steps. All firearms are handled through compliant Ship-to-FFL workflows."
      />

      <Card title="Request Form">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (status.state === "sending") return;
            void submit();
          }}
        >
          {/* Honeypot field (hidden from humans) */}
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs text-muted">Name</div>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="space-y-1">
              <div className="text-xs text-muted">Phone</div>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="317-XXX-XXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
          </div>

          <label className="space-y-1">
            <div className="text-xs text-muted">Email</div>
            <input
              type="email"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Firearm requested (model / caliber / SKU)</div>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.firearm}
              onChange={(e) => setForm({ ...form, firearm: e.target.value })}
              required
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Where are you buying from? (optional)</div>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Vendor / website"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Receiving FFL details</div>
            <textarea
              className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.receivingFFL}
              onChange={(e) => setForm({ ...form, receivingFFL: e.target.value })}
              placeholder="FFL name, city/state, phone/email (or attach later)"
              required
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Notes</div>
            <textarea
              className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything else we should know?"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-card px-4 py-2 text-sm font-medium shadow-sm ring-offset-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            disabled={status.state === "sending"}
          >
            {status.state === "sending" ? "Sending..." : "Submit Request"}
          </button>

          {status.state === "success" && (
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <div className="font-medium">Request received.</div>
              <div className="text-muted">
                We’ll reach out by email with next steps. {status.message ? `(${status.message})` : ""}
              </div>
            </div>
          )}

          {status.state === "error" && (
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <div className="font-medium">Couldn’t send request.</div>
              <div className="text-muted">{status.message}</div>
            </div>
          )}

          <div className="text-xs text-muted">
            Tip: for fastest turnaround, include an exact model, caliber, and a link or SKU if you have it.
          </div>
        </form>
      </Card>
    </div>
  );
}
