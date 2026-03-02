"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeading } from "@/components/ui";

const EMAIL = "nickdespain@fergusonfirearms.com"; // placeholder until domain is live

type FormState = {
  name: string;
  phone: string;
  email: string;
  firearm: string;
  source: string;
  receivingFFL: string;
  notes: string;
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
  });

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Ferguson Firearms — Firearm Purchase Request");
    const body = encodeURIComponent(
      `Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email}

Firearm Requested:
${form.firearm}

Where are you buying from (optional):
${form.source}

Receiving FFL (name + city + email/phone):
${form.receivingFFL}

Notes:
${form.notes}
`
    );
    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }, [form]);

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Request"
        title="Firearm Purchase Request"
        subtitle="Submit details and we’ll respond with next steps. Firearms are handled through compliant Ship-to-FFL workflows."
      />

      <Card title="Request Form (Preview)">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = mailto;
          }}
        >
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
                placeholder="317-600-8758"
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
            className="inline-flex w-full items-center justify-center rounded-xl bg-card px-4 py-2 text-sm font-medium shadow-sm ring-offset-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Send Request
          </button>

          <div className="text-xs text-muted">
            Preview behavior: opens your email client with a pre-filled message.
          </div>
        </form>
      </Card>
    </div>
  );
}
