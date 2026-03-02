"use server";

import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-server";

export type ContactStatus = "New" | "In Progress" | "Closed";

export async function updateContactMessage(input: { id: string; status: ContactStatus; internalNotes: string }) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Not authorized.");

  const db = supabaseAdmin();
  const { error } = await db
    .from("contact_messages")
    .update({ status: input.status, internal_notes: input.internalNotes || null })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}
