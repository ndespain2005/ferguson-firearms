import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { SITE } from "@/lib/site-config";
import { Card, SectionHeading, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

function formatInSiteTz(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: SITE.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export default async function AdminTransfersPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/sign-in");

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("transfers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="space-y-10 text-white">
        <SectionHeading eyebrow="Admin" title="Transfers" subtitle="Error loading transfers." />
        <Card title="Error">
          <div className="text-white/70">{error.message}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="Admin"
        title="Transfers Dashboard"
        subtitle="Latest transfer intakes (last 100)."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge>Signed in as {gate.user.primaryEmailAddress?.emailAddress}</Badge>
        <Link
          href="/transfers/intake"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
        >
          Open Intake Form
        </Link>
      </div>

      <div className="grid gap-5">
        {(data || []).map((t: any) => (
          <Card key={t.id} title={`#${t.id} • ${t.full_name}`}>
            <div className="grid gap-4 lg:grid-cols-3 text-lg">
              <div className="text-white/70">
                <div className="text-white/50 text-sm">Customer</div>
                <div className="font-semibold text-white/85">{t.full_name}</div>
                <div>{t.phone}</div>
                <div className="break-words">{t.email}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/50 text-sm">Address</div>
                <div className="break-words">{t.address}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/50 text-sm">Seller</div>
                <div className="font-semibold text-white/85">{t.seller_name}</div>
                <div className="break-words">{t.seller_website || "—"}</div>
                <div className="mt-2">
                  <span className="text-white/50 text-sm">Tracking:</span>{" "}
                  <span className="break-words">{t.tracking_number || "—"}</span>
                </div>
              </div>

              <div className="text-white/70">
                <div className="text-white/50 text-sm">Firearm</div>
                <div className="font-semibold text-white/85">{t.firearm_type}</div>
                <div className="break-words">{t.item_name || "—"}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/50 text-sm">Serial / ETA</div>
                <div className="break-words">{t.serial_number || "—"}</div>
                <div className="mt-2">
                  <span className="text-white/50 text-sm">Expected arrival:</span>{" "}
                  <span className="break-words">{t.expected_arrival || "—"}</span>
                </div>
              </div>

              <div className="text-white/70">
                <div className="text-white/50 text-sm">Status</div>
                <div className="font-semibold text-white/85">{t.status || "Pending"}</div>
              </div>
            </div>
<div>{t.phone}</div>
                <div className="break-words">{t.email}</div>
              </div>
              <div className="text-white/70">
                <div className="text-white/50 text-sm">Seller / Tracking</div>
                <div>{t.seller_name}</div>
                <div className="break-words">{t.tracking_number || "—"}</div>
              </div>
              <div className="text-white/70">
                <div className="text-white/50 text-sm">Firearm</div>
                <div>{t.firearm_type}</div>
                <div className="break-words">{t.item_name || "—"}</div>
              </div>
            </div>

            <div className="mt-4 text-white/60">
              <span className="font-semibold text-white/80">Status:</span> {t.status || "Pending"}{" "}
              <span className="mx-2">•</span>
              <span className="font-semibold text-white/80">Created:</span>{" "}
              {formatInSiteTz(t.created_at)}
            </div>

            {t.notes ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/45 p-4 text-white/70">
                <div className="text-white/50 text-sm mb-1">Notes</div>
                {t.notes}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
