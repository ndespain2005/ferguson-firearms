import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { Card, SectionHeading } from "@/components/ui";

type PurchaseRequestRow = {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string;
  firearm: string;
  source: string | null;
  receiving_ffl: string;
  notes: string | null;
  status: string | null;
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

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
            To enable admin access, set <span className="font-mono">ADMIN_EMAIL</span> in your environment to the
            email address you use for Clerk sign-in.
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
      .select("id, created_at, name, phone, email, firearm, source, receiving_ffl, notes, status")
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
        subtitle="This is your inbox for customer firearm purchase requests."
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
              Tip: see <span className="font-mono">supabase/purchase_requests.sql</span> in the repo for a starter
              table definition.
            </div>
          </div>
        </Card>
      ) : (
        <Card title={`Inbox (${rows.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="py-2 pr-4">Received</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Firearm</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="py-3 pr-4 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted">{r.email}</div>
                      {r.phone ? <div className="text-xs text-muted">{r.phone}</div> : null}
                    </td>
                    <td className="py-3 pr-4">
                      <details>
                        <summary className="cursor-pointer select-none">
                          <span className="font-medium">View</span>
                          <span className="text-muted"> — {r.firearm.slice(0, 42)}{r.firearm.length > 42 ? "…" : ""}</span>
                        </summary>
                        <div className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted">
                          {r.firearm}
                        </div>

                        <div className="mt-3 text-xs text-muted">
                          <div className="font-medium text-foreground">Receiving FFL</div>
                          <div className="mt-1 whitespace-pre-wrap rounded-xl border border-border bg-background px-3 py-2">
                            {r.receiving_ffl}
                          </div>
                        </div>

                        {r.notes ? (
                          <div className="mt-3 text-xs text-muted">
                            <div className="font-medium text-foreground">Notes</div>
                            <div className="mt-1 whitespace-pre-wrap rounded-xl border border-border bg-background px-3 py-2">
                              {r.notes}
                            </div>
                          </div>
                        ) : null}
                      </details>
                    </td>
                    <td className="py-3 pr-4">{r.source ?? <span className="text-muted">—</span>}</td>
                    <td className="py-3 pr-4">{r.status ?? "new"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 ? <div className="py-6 text-sm text-muted">No requests yet.</div> : null}
          </div>
        </Card>
      )}
    </div>
  );
}
