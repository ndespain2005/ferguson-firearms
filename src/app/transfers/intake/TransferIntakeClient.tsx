"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitTransferIntake } from "./actions";
import { Card, SectionHeading } from "@/components/ui";
import { SITE } from "@/lib/site-config";

type FirearmType = "Handgun" | "Rifle" | "Other";

export default function TransferIntakeClient() {
  const params = useSearchParams();
  const prefillItem = params.get("item") || "";

  const [itemName, setItemName] = useState(prefillItem);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState<string>(SITE.phone);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerWebsite, setSellerWebsite] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [firearmType, setFirearmType] = useState<FirearmType>("Handgun");
  const [serialNumber, setSerialNumber] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return fullName.trim() && phone.trim() && email.trim() && address.trim() && sellerName.trim();
  }, [fullName, phone, email, address, sellerName]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await submitTransferIntake({
        itemName: itemName.trim() || undefined,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        sellerName: sellerName.trim(),
        sellerWebsite: sellerWebsite.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        firearmType,
        serialNumber: serialNumber.trim() || undefined,
        expectedArrival: expectedArrival.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccessId(String(res.id));
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Transfers"
        title="Transfer Intake"
        subtitle="Submit your ship-to-FFL details. We’ll confirm receipt and notify you when ready for pickup."
      />

      {successId ? (
        <Card title="Submission received">
          <div className="text-white/70 text-lg space-y-3">
            <p>
              You’re set. We’ve received your transfer intake and logged it in our system.
            </p>
            <p className="text-white/60">
              Reference ID: <span className="font-semibold text-white">{successId}</span>
            </p>
            <p className="text-white/60">
              Questions? Contact us at <span className="text-white font-semibold">{SITE.phone}</span> or{" "}
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
                <Field label="Phone" value={phone} onChange={setPhone} required />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Email" value={email} onChange={setEmail} required />
                <Field label="Address" value={address} onChange={setAddress} required />
              </div>
            </Card>

            <Card title="Transfer details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Item (optional)" value={itemName} onChange={setItemName} placeholder="e.g., Glock 19 Gen 5" />
                <Select label="Firearm type" value={firearmType} onChange={(v) => setFirearmType(v as FirearmType)} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Seller name" value={sellerName} onChange={setSellerName} required placeholder="Vendor / Individual" />
                <Field label="Seller website (optional)" value={sellerWebsite} onChange={setSellerWebsite} placeholder="https://..." />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Tracking # (optional)" value={trackingNumber} onChange={setTrackingNumber} />
                <Field label="Expected arrival (optional)" value={expectedArrival} onChange={setExpectedArrival} placeholder="MM/DD or date" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Serial # (optional)" value={serialNumber} onChange={setSerialNumber} />
                <Field label="Notes (optional)" value={notes} onChange={setNotes} placeholder="Anything we should know?" />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Confirm & submit">
              <div className="text-white/70 text-lg space-y-3">
                <p>
                  Submitting this form logs your transfer into our system and helps us move fast when it arrives.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-white/60">
                  <li>Bring valid ID for pickup.</li>
                  <li>Transfers are completed in-store per compliance requirements.</li>
                  <li>We’ll notify you after arrival processing.</li>
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
                {submitting ? "Submitting…" : "Submit intake"}
              </button>

              <div className="mt-4 text-xs text-white/45">
                This form is for transfer intake only — it does not guarantee availability and does not process payments.
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
        <option value="Handgun">Handgun</option>
        <option value="Rifle">Rifle</option>
        <option value="Other">Other</option>
      </select>
    </label>
  );
}
