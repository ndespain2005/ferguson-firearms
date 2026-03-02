import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { Card, SectionHeading, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

type Stat = { label: string; value: number; href: string; hint: string };

function safeCount(x: any) {
  // supabase .select with { count: "exact", head: true } returns count on response
  return typeof x?.count === "number" ? x.count : 0;
}

export default async function AdminHomePage() {
  const gate = await requireAdmin();

  if (!gate.ok) {
    return (
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Admin"
          title="Admin Dashboard"
          subtitle={gate.reason === "signed_out" ? "Please sign in to access admin tools." : "You don’t have access to admin tools."}
        />
        <Card title="Access required">
          <div className="text-sm text-muted">
            Set <span className="font-mono">ADMIN_EMAIL</span> in your environment to the email address you use for Clerk sign-in.
          </div>
        </Card>
      </div>
    );
  }

  const db = supabaseAdmin();

  // "New" counts (fast)
  const [pNew, qNew, cNew, tNew] = await Promise.all([
    db.from("purchase_requests").select("id", { count: "exact", head: true }).eq("status", "New"),
    db.from("service_quotes").select("id", { count: "exact", head: true }).eq("status", "New"),
    db.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "New"),
    db.from("transfers").select("id", { count: "exact", head: true }).eq("status", "New"),
  ]);

  // Total counts (optional)
  const [pAll, qAll, cAll, tAll] = await Promise.all([
    db.from("purchase_requests").select("id", { count: "exact", head: true }),
    db.from("service_quotes").select("id", { count: "exact", head: true }),
    db.from("contact_messages").select("id", { count: "exact", head: true }),
    db.from("transfers").select("id", { count: "exact", head: true }),
  ]);

  const stats: Stat[] = [
    { label: "New purchase requests", value: safeCount(pNew), href: "/admin/purchase-requests", hint: `${safeCount(pAll)} total` },
    { label: "New service quotes", value: safeCount(qNew), href: "/admin/service-quotes", hint: `${safeCount(qAll)} total` },
    { label: "New contact messages", value: safeCount(cNew), href: "/admin/contact-messages", hint: `${safeCount(cAll)} total` },
    { label: "New transfers", value: safeCount(tNew), href: "/admin/transfers", hint: `${safeCount(tAll)} total` },
  ];

  return (
    <div className="space-y-10">
      <SectionHeading eyebrow="Admin" title="Admin Dashboard" subtitle="Live inbox counts and quick access." />

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((s) => (
          <a key={s.href} href={s.href} className="block">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 transition hover:border-white/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-white/60">{s.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{s.value}</div>
                  <div className="mt-2 text-xs text-white/45">{s.hint}</div>
                </div>
                <Badge>{s.value > 0 ? "Action" : "Clear"}</Badge>
              </div>
            </div>
          </a>
        ))}
      </div>

      <Card title="Admin tools">
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminLink href="/admin/purchase-requests" title="Purchase Requests" desc="Workflow + internal notes." />
          <AdminLink href="/admin/service-quotes" title="Service Quotes" desc="Quote intake + status pipeline." />
          <AdminLink href="/admin/contact-messages" title="Contact Messages" desc="General messages and follow-up." />
          <AdminLink href="/admin/transfers" title="Transfers" desc="Transfer intake submissions." />
        </div>
      </Card>

      <Card title="Tip">
        <div className="text-sm text-muted">
          Next upgrade: filter tabs (New / In Progress / Ready / Complete) inside each inbox + “quick action” buttons.
        </div>
      </Card>
    </div>
  );
}

function AdminLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} className="rounded-2xl border border-border bg-background p-4 transition hover:opacity-90">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm text-muted">{desc}</div>
    </a>
  );
}
