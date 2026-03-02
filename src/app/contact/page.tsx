"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeading } from "@/components/ui";
import { SITE } from "@/lib/site-config";

const PHONE = "317-600-8758";
const EMAIL = "nickdespain@fergusonfirearms.com"; // placeholder until domain is live

type FormState = {
  name: string;
  phone: string;
  email: string;
  topic: "General" | "Transfer" | "Service Quote" | "Firearm Request";
  message: string;
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    topic: "General",
    message: "",
  });

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`Ferguson Firearms — ${form.topic}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\n\nMessage:\n${form.message}\n`
    );
    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }, [form]);

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Contact"
        title="Indianapolis, IN — Wanamaker Area"
        subtitle="Mon–Fri 8:00 AM – 6:00 PM • Phone 317-XXXXXXX"
      />

      <div className="flex flex-wrap gap-2">
        <a href="/transfers/intake" className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted transition hover:text-foreground">Transfer Intake</a>
        <a href="/firearms/request" className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted transition hover:text-foreground">Firearm Request</a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Contact Details">
          <div className="space-y-2 text-sm">
            <div className="text-muted">Phone</div>
            <div className="font-medium">{PHONE}</div>

            <div className="pt-3 text-muted">Email</div>
            <div className="font-medium">{EMAIL}</div>

            <div className="pt-3 text-muted">Hours</div>
            <div className="font-medium">Mon–Fri 8:00 AM – 6:00 PM</div>

            <div className="pt-3 text-muted">Notes</div>
            <div className="text-muted">
              Accessories can checkout normally. Firearms requests and transfers
              are handled through compliant workflows (Ship-to-FFL / request).
            </div>
          </div>
        </Card>

        <Card title="Send a Message (Preview)">
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
                <div className="text-xs text-muted">Topic</div>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={form.topic}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      topic: e.target.value as FormState["topic"],
                    })
                  }
                >
                  <option>General</option>
                  <option>Transfer</option>
                  <option>Service Quote</option>
                  <option>Firearm Request</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-xs text-muted">Phone</div>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="317-XXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs text-muted">Email</div>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  required
                />
              </label>
            </div>

            <label className="space-y-1">
              <div className="text-xs text-muted">Message</div>
              <textarea
                className="min-h-32 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what you need (transfer details, service request, firearm model, receiving FFL info, etc.)."
                required
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-card px-4 py-2 text-sm font-medium shadow-sm ring-offset-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Send Message
            </button>

            <div className="text-xs text-muted">
              Preview behavior: opens your email client with a pre-filled
              message. In production, this can submit to an email endpoint +
              store entries.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}