"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Slide = {
  kicker: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

export default function InfoRotator() {
  const slides = useMemo<Slide[]>(
    () => [
      {
        kicker: "Local • Indianapolis, IN",
        title: "Ferguson Firearms — family-run shop",
        body: "Local pickup, transfers, and a fast compliance workflow. Serving Indy and the Wanamaker suburbs.",
        cta: { label: "Transfers intake", href: "/transfers/intake" },
      },
      {
        kicker: "This Week",
        title: "Accessory deals + new arrivals",
        body: "Fresh mags, mounts, and range essentials. Check the shop for in‑stock accessories and apparel.",
        cta: { label: "Browse Shop", href: "/shop" },
      },
      {
        kicker: "Transfers",
        title: "Track your intake from your account",
        body: "Create an account to view transfer status, open details, and update tracking or seller info.",
        cta: { label: "My Account", href: "/account" },
      },
      {
        kicker: "Services",
        title: "Builds • installs • troubleshooting",
        body: "From optics mounting to reliability checks — ask about quick turnaround service options.",
        cta: { label: "View Services", href: "/services" },
      },
    ],
    []
  );

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const s = slides[i];

  return (
    <div
      className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-white/50 text-xs font-semibold tracking-wide">{s.kicker}</div>
          <div className="mt-1 text-white/90 text-lg font-semibold">{s.title}</div>
          <div className="mt-2 text-white/70 text-sm leading-relaxed">{s.body}</div>
        </div>

        {s.cta ? (
          <Link
            href={s.cta.href}
            className="shrink-0 rounded-2xl border border-red-500/25 bg-red-600/15 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-600/25"
          >
            {s.cta.label}
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            className={`h-2.5 w-2.5 rounded-full border transition ${
              idx === i ? "border-red-500/40 bg-red-600/40" : "border-white/15 bg-black/40 hover:border-red-500/25"
            }`}
            aria-label={`Slide ${idx + 1}`}
            title={`Slide ${idx + 1}`}
          />
        ))}
        <div className="ml-auto text-white/40 text-[11px]">{paused ? "Paused" : "Auto-rotating"}</div>
      </div>
    </div>
  );
}
