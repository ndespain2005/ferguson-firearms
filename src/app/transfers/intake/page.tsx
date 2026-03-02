"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeading } from "@/components/ui";

const EMAIL = "317XXXXXXX@fergusonfirearms.com"; // placeholder until domain is live

type FormState = {
  name: string;
  phone: string;
  email: string;
  seller: string;
  orderNumber: string;
  tracking: string;
  firearmDetails: string;
  pickupWindow: string;
  notes: string;
};

export default function TransferIntakePage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    seller: "",
    orderNumber: "",
    tracking: "",
    firearmDetails: "",
    pickupWindow: "",
    notes: "",
  });

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Ferguson Firearms — Transfer Intake");
    const body = encodeURIComponent(
      `TRANSFER INTAKE

Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email}

Seller/Vendor: ${form.seller}
Order #: ${form.orderNumber}
Tracking #: ${form.tracking}

Firearm Details:
${form.firearmDetails}

Preferred Pickup Window:
${form.pickupWindow}

Notes:
${form.notes}
`
    );
    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }, [form]);

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Transfers"
        title="Transfer Intake Form"
        subtitle="Submit your order details and we’ll confirm next steps when your item ships/arrives."
      />

      <Card title="Intake (Preview)">
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
                placeholder="317-XXXXXXX"
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

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs text-muted">Seller / Vendor</div>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={form.seller}
                onChange={(e) => setForm({ ...form, seller: e.target.value })}
                placeholder="Website / store name"
                required
              />
            </label>

            <label className="space-y-1">
              <div className="text-xs text-muted">Order #</div>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={form.orderNumber}
                onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                placeholder="Order number"
              />
            </label>
          </div>

          <label className="space-y-1">
            <div className="text-xs text-muted">Tracking # (optional)</div>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.tracking}
              onChange={(e) => setForm({ ...form, tracking: e.target.value })}
              placeholder="UPS/USPS/FedEx tracking"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Firearm details</div>
            <textarea
              className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.firearmDetails}
              onChange={(e) => setForm({ ...form, firearmDetails: e.target.value })}
              placeholder="Make/model, caliber, SKU (if known)"
              required
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Preferred pickup window</div>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.pickupWindow}
              onChange={(e) => setForm({ ...form, pickupWindow: e.target.value })}
              placeholder="Example: Weekdays after 3pm"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Notes</div>
            <textarea
              className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything else we should know?"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-card px-4 py-2 text-sm font-medium shadow-sm ring-offset-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Submit Transfer Intake
          </button>

          <div className="text-xs text-muted">
            Preview behavior: opens your email client with a pre-filled message.
          </div>
        </form>
      </Card>
    </div>
  );
}
