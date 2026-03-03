"use client";

import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/site-config";

function parseLaunchDate() {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_DATE || "";
  // Accept ISO like 2026-06-01T12:00:00Z or 2026-06-01
  const d = raw ? new Date(raw) : new Date("2026-12-31T00:00:00Z");
  return isNaN(d.getTime()) ? new Date("2026-12-31T00:00:00Z") : d;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function UnlockPage() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const launch = useMemo(() => parseLaunchDate(), []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, launch.getTime() - now.getTime());
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!pw.trim()) {
      setErr("Enter the preview password.");
      return;
    }
    // Store password in a cookie for the middleware check.
    // Preview only: server compares cookie to SITE_PASSWORD.
    document.cookie = `site_auth=${encodeURIComponent(pw)}; path=/; max-age=${60 * 60 * 24 * 7}`;
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    window.location.href = next;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Tactical animated background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-red-600/20 blur-3xl animate-pulse" />
        <div className="absolute -right-32 -bottom-32 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl animate-pulse" />
      </div>

      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
        }}
      />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/55 p-8">
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/50" />
              <div>
                <div className="text-lg font-semibold">{SITE.name}</div>
                <div className="text-sm text-white/55">Preview Access • Coming Soon</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-3xl font-semibold leading-tight">
                Storefront preview is locked while we finalize inventory and compliance details.
              </div>
              <div className="mt-3 text-white/65">
                You can still review the experience, workflows, and dashboards — access is restricted until launch.
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info title="Transfers" desc="Track intake + status updates." />
              <Info title="Purchase Requests" desc="Send model/SKU details for quotes." />
              <Info title="Service Quotes" desc="Clear scopes, pricing, turnaround." />
              <Info title="Admin Inbox" desc="Organize workflow in one place." />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/35 p-5">
              <div className="text-sm text-white/60">Launch countdown</div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Count label="Days" value={String(days)} />
                <Count label="Hours" value={pad(hours)} />
                <Count label="Min" value={pad(minutes)} />
                <Count label="Sec" value={pad(seconds)} />
              </div>
              <div className="mt-3 text-xs text-white/45">
                Set <span className="font-mono">NEXT_PUBLIC_LAUNCH_DATE</span> to control this countdown.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/55 p-8">
            <div className="text-sm text-white/60">Preview login</div>
            <div className="mt-2 text-2xl font-semibold">Enter password</div>
            <div className="mt-2 text-sm text-white/60">
              This site is in preview mode. Use the access password to continue.
            </div>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Preview password"
                className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-red-600/50"
              />
              {err ? <div className="text-sm text-red-300">{err}</div> : null}
              <button className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                Unlock Preview
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white/60">
              <div className="font-semibold text-white">Environment setup</div>
              <div className="mt-2 space-y-1">
                <div>
                  <span className="font-mono">SITE_LOCK=1</span> to enable lock
                </div>
                <div>
                  <span className="font-mono">SITE_PASSWORD=…</span> preview password
                </div>
                <div>
                  <span className="font-mono">NEXT_PUBLIC_LAUNCH_DATE=…</span> countdown date
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-white/45">
              Contact: <span className="text-white/70">{SITE.phone}</span> • <span className="text-white/70">{SITE.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/60">{desc}</div>
    </div>
  );
}

function Count({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[92px] rounded-2xl border border-white/10 bg-black/45 p-3">
      <div className="text-xs text-white/55">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
