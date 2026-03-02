import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { Card, SectionHeading } from "@/components/ui";
import AdminContactMessagesClient from "./AdminContactMessagesClient";

type Row = {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string;
  topic: string;
  message: string;
  status: string | null;
  internal_notes: string | null;
};

export default async function AdminContactMessagesPage() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return (
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Admin"
          title="Contact Messages"
          subtitle={gate.reason === "signed_out" ? "Please sign in to access the admin inbox." : "You don’t have access to this page."}
        />
        <Card title="Access required">
          <div className="text-sm text-muted">
            Set <span className="font-mono">ADMIN_EMAIL</span> to your Clerk sign-in email to enable access.
          </div>
        </Card>
      </div>
    );
  }

  let rows: Row[] = [];
  let errorMsg: string | null = null;

  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("contact_messages")
      .select("id, created_at, name, phone, email, topic, message, status, internal_notes")
      .order("created_at", { ascending: false })
      .limit(250);

    if (error) errorMsg = error.message;
    rows = (data ?? []) as Row[];
  } catch {
    errorMsg = "Supabase is not configured (or table is missing). Run supabase/contact_messages.sql in Supabase SQL Editor.";
  }

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Admin"
        title="Contact Messages"
        subtitle="Inbox for general contact messages."
      />

      {errorMsg ? (
        <Card title="Setup required">
          <div className="text-sm text-muted">{errorMsg}</div>
        </Card>
      ) : (
        <Card title={`Inbox (${rows.length})`}>
          <AdminContactMessagesClient initialRows={rows} />
        </Card>
      )}
    </div>
  );
}
