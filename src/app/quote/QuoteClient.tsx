"use client";

import { useMemo, useState } from "react";
import { submitQuoteRequest } from "./actions";
import { Card, SectionHeading } from "@/components/ui";
import { SITE } from "@/lib/site-config";

type ServiceType = "Custom Build" | "Optic Mounting" | "Accessory Install" | "Gunsmithing" | "Other";

export default function QuoteClient() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("Gunsmithing");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [emailOk, setEmailOk] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return fullName.trim() && email.trim() && description.trim();
  }, [fullName, email, description]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await submitQuoteRequest({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
        serviceType,
        description: description.trim(),
        company,
      });
      setSuccessId(String(res.id));
      setEmailOk(Boolean((res as any).emailSent));
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Quote"
        title="Request a Service Quote"
        subtitle="Describe the work — we’ll respond with scope, pricing, and turnaround. No surprises."
      />

      {successId ? (
        <Card title="Request received">
          <div className="text-white/70 text-lg space-y-3">
            <p>We’ve logged your quote request. We’ll reach out by email with next steps.</p>
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

            <Card title="Work details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Service type" value={serviceType} onChange={(v) => setServiceType(v as ServiceType)} />
                <div className="hidden sm:block" />
              </div>
              <div className="mt-4">
                <TextArea
                  label="Describe the work"
                  value={description}
                  onChange={setDescription}
                  required
                  placeholder="Include firearm model, parts you have (or want), preferred optic/light, any deadlines, and links if possible."
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Confirm & submit">
              <div className="text-white/70 text-lg space-y-3">
                <p>
                  Submitting this form puts your request into our admin inbox so we can quote quickly and schedule work.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-white/60">
                  <li>We’ll confirm scope before work begins.</li>
                  <li>Turnaround depends on parts availability + workload.</li>
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
                For fastest quotes, include links/SKUs and any preferred parts.
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
        className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-white/70">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 outline-none focus:ring-2 focus:ring-red-500/40"
      >
        <option value="Custom Build">Custom Build</option>
        <option value="Optic Mounting">Optic Mounting</option>
        <option value="Accessory Install">Accessory Install</option>
        <option value="Gunsmithing">Gunsmithing</option>
        <option value="Other">Other</option>
      </select>
    </label>
  );
}
