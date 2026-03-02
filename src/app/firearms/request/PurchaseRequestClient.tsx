"use client";

import { useMemo, useState } from "react";
import { submitPurchaseRequest } from "./actions";
import { Card, SectionHeading } from "@/components/ui";
import { SITE } from "@/lib/site-config";

export default function PurchaseRequestClient() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firearm, setFirearm] = useState("");
  const [source, setSource] = useState("");
  const [receivingFFL, setReceivingFFL] = useState("");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [emailOk, setEmailOk] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return fullName.trim() && email.trim() && firearm.trim() && receivingFFL.trim();
  }, [fullName, email, firearm, receivingFFL]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await submitPurchaseRequest({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
        firearm: firearm.trim(),
        source: source.trim() || undefined,
        receivingFFL: receivingFFL.trim(),
        notes: notes.trim() || undefined,
        company,
      });
      setSuccessId(String(res.id));
      setEmailOk(Boolean((res as any).emailSent));
      // keep the submitted data out of the form once success hits
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Request"
        title="Firearm Purchase Request"
        subtitle="Tell us exactly what you want — we’ll reply with pricing, availability, and the fastest path to get it in your hands (compliant Ship‑to‑FFL)."
      />

      {successId ? (
        <Card title="Request received">
          <div className="text-white/70 text-lg space-y-3">
            <p>
              Thanks — we’ve logged your request in our system. We’ll reach out by email with next steps.
            </p>
            <p className="text-white/60">
              Reference ID: <span className="font-semibold text-white">{successId}</span>
            </p>

            {!emailOk ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
                Request saved, but notification email did not send. Check RESEND settings on Vercel.
              </div>
            ) : null}

            <p className="text-white/60">
              Questions? Call <span className="text-white font-semibold">{SITE.phone}</span> or email{" "}
              <span className="text-white font-semibold">{SITE.email}</span>.
            </p>
          </div>
        </Card>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Customer info">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={fullName} onChange={setFullName} required />
                <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="317-XXX-XXXX" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Email" value={email} onChange={setEmail} required />
                {/* Honeypot (hidden from humans) */}
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
              </div>
            </Card>

            <Card title="What you’re looking for">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Firearm (model / caliber / SKU)"
                  value={firearm}
                  onChange={setFirearm}
                  required
                  placeholder="e.g., Glock 19 Gen 5 MOS / 9mm"
                />
                <Field
                  label="Where buying from (optional)"
                  value={source}
                  onChange={setSource}
                  placeholder="Vendor / website link"
                />
              </div>

              <div className="mt-4 grid gap-4">
                <TextArea
                  label="Receiving FFL details"
                  value={receivingFFL}
                  onChange={setReceivingFFL}
                  required
                  placeholder="FFL name, city/state, phone/email (or attach later)"
                />
              </div>

              <div className="mt-4 grid gap-4">
                <TextArea
                  label="Notes (optional)"
                  value={notes}
                  onChange={setNotes}
                  placeholder="Color preferences, budget, timeframe, alternatives you’d accept, etc."
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Confirm & submit">
              <div className="text-white/70 text-lg space-y-3">
                <p>
                  Submitting this form puts your request into our admin inbox so we can quote quickly and coordinate the
                  cleanest compliant workflow.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-white/60">
                  <li>We’ll reply with pricing + availability (or options).</li>
                  <li>If shipping is involved, we’ll confirm Ship‑to‑FFL steps.</li>
                  <li>No payments are taken through this form.</li>
                </ul>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-600/15 p-4 text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="btn-red-glow glow-pulse mt-5 w-full rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>

              <div className="mt-4 text-xs text-white/45">
                This request does not reserve inventory. We’ll confirm availability and next steps by email.
              </div>
            </Card>

            <Card title="Contact">
              <div className="text-white/70 text-lg">
                <div>{SITE.city}</div>
                <div className="mt-2">
                  <div className="text-white/60">Phone</div>
                  <div className="font-semibold text-white">{SITE.phone}</div>
                </div>
                <div className="mt-2">
                  <div className="text-white/60">Email</div>
                  <div className="font-semibold text-white">{SITE.email}</div>
                </div>
              </div>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-white/70">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-white/70">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
      />
    </label>
  );
}
