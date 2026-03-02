import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { Card, SectionHeading, Badge } from "@/components/ui";
import AdminTransfersClient from "./AdminTransfersClient";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/sign-in");

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("transfers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

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
        subtitle="Search, review, and update transfer statuses."
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

      <AdminTransfersClient initial={(data || []) as any} />
    </div>
  );
}
