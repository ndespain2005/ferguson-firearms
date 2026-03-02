import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { Card, SectionHeading } from "@/components/ui";
import AdminPurchaseRequestsClient from "./AdminPurchaseRequestsClient";

type PurchaseRequestRow = {
  id: string;
  created_at: string;  name: string;
  phone: string | null;
  email: string;
  firearm: string;
  source: string | null;
  receiving_ffl: string;
  notes: string | null;
  status: string | null;
  internal_notes: string | null;
};

export default async function AdminPurchaseRequestsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return (
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Admin"
          title="Purchase Requests"
          subtitle={
            gate.reason === "signed_out"
              ? "Please sign in to access the admin inbox."
              : "You don’t have access to this page."
          }
        />
        <Card title="Access required">
          <div className="text-sm text-muted">
            To enable admin access, set <span className="font-mono">ADMIN_EMAIL</span> in your environment to the email
            address you use for Clerk sign-in.
          </div>
        </Card>
      </div>
    );
  }

  let rows: PurchaseRequestRow[] = [];
  let errorMsg: string | null = null;

  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("purchase_requests")
      .select("id, created_at, name, phone, email, firearm, source, receiving_ffl, notes, status, internal_notes")
      .order("created_at", { ascending: false })
      .limit(250);

    if (error) errorMsg = error.message;
    rows = (data ?? []) as PurchaseRequestRow[];
  } catch (e: any) {
    errorMsg = "Supabase is not configured (or table is missing).";
  }

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Admin"
        title="Purchase Requests"
        subtitle="This is your inbox for customer firearm purchase requests. Update workflow status and keep internal notes here."
      />

      {errorMsg ? (
        <Card title="Setup required">
          <div className="space-y-3 text-sm text-muted">
            <div>{errorMsg}</div>
            <div>
              Make sure you have:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <span className="font-mono">SUPABASE_URL</span> and{" "}
                  <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> set
                </li>
                <li>A Supabase table named <span className="font-mono">purchase_requests</span></li>
              </ul>
            </div>
            <div className="text-xs">
              Tip: see <span className="font-mono">supabase/purchase_requests.sql</span> in the repo for a starter table
              definition (includes workflow status + internal notes).
            </div>
          </div>
        </Card>
      ) : (
        <Card title={`Inbox (${rows.length})`}>
          <AdminPurchaseRequestsClient initialRows={rows} />
        </Card>
      )}
    </div>
  );
}
