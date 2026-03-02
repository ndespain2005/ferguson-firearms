"use server";

import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";

export type QuoteStatus = "New" | "Quoted" | "Scheduled" | "In Progress" | "Complete" | "Closed";

export async function updateServiceQuote(input: { id: string; status: QuoteStatus; internalNotes: string }) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Not authorized.");

  const db = supabaseAdmin();
  const { error } = await db
    .from("service_quotes")
    .update({ status: input.status, internal_notes: input.internalNotes || null })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}
