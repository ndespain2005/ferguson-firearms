"use client";

import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Card, ButtonLink, SectionHeading } from "@/components/ui";

type Profile = {
  name: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
};

const EMPTY: Profile = {
  name: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const meta = (user.unsafeMetadata || {}) as any;

    setProfile({
      name: (user.fullName || meta.name || "").toString(),
      phone: (meta.phone || "").toString(),
      address1: (meta.address1 || "").toString(),
      address2: (meta.address2 || "").toString(),
      city: (meta.city || "").toString(),
      state: (meta.state || "").toString(),
      zip: (meta.zip || "").toString(),
    });
  }, [user]);

  const email = useMemo(() => user?.primaryEmailAddress?.emailAddress || "", [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await user.update({
        firstName: profile.name.split(" ")[0] || undefined,
        lastName: profile.name.split(" ").slice(1).join(" ") || undefined,
      });

      await user.update({
  unsafeMetadata: {
    name: profile.name,
    phone: profile.phone,
    address1: profile.address1,
    address2: profile.address2,
    city: profile.city,
    state: profile.state,
    zip: profile.zip,
  },
});
  },
});
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) return <div className="px-4 py-10 text-white/60">Loading…</div>;

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Account"
        title="My Account"
        subtitle="Basic profile info for transfers and requests. Password reset + email verification are handled by Clerk."
      />

      <SignedOut>
        <Card title="Sign in required">
          <div className="text-white/70 text-lg">
            Please sign in to view your account.
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/sign-in">Sign In</ButtonLink>
            <ButtonLink href="/sign-up" variant="ghost">Create Account</ButtonLink>
          </div>
        </Card>
      </SignedOut>

      <SignedIn>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Profile">
            <div className="space-y-4">
              <div>
                <div className="text-white/70">Email</div>
                <div className="mt-1 text-lg font-semibold">{email}</div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
              </div>

              <Field label="Address line 1" value={profile.address1} onChange={(v) => setProfile({ ...profile, address1: v })} />
              <Field label="Address line 2" value={profile.address2} onChange={(v) => setProfile({ ...profile, address2: v })} />

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" value={profile.city} onChange={(v) => setProfile({ ...profile, city: v })} />
                <Field label="State" value={profile.state} onChange={(v) => setProfile({ ...profile, state: v })} />
                <Field label="ZIP" value={profile.zip} onChange={(v) => setProfile({ ...profile, zip: v })} />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="btn-red-glow inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                {saved ? <span className="text-red-300 font-semibold">Saved</span> : null}
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
                >
                  Back to Shop
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Security">
            <div className="text-white/70 text-lg space-y-3">
              <p>
                Use “Forgot password” on the sign-in page to reset your password anytime.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href="/sign-in">Open Sign In</ButtonLink>
                <ButtonLink href="/sign-up" variant="ghost">Create Another Account</ButtonLink>
              </div>
            </div>
          </Card>
        </div>
      </SignedIn>
    </div>
  );
}

function Field({
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/45 px-5 py-3 text-base text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500/40"
      />
    </label>
  );
}
