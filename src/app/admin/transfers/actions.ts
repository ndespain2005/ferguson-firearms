"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin";

export async function updateTransferStatus(params: { id: number; status: string }) {

  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const db = supabaseAdmin();
  const { error } = await db
    .from("transfers")
    .update({ status: params.status })
    .eq("id", params.id);

  if (error) throw new Error(error.message);

  return { ok: true as const };
}


export async function updateTransferStatuses(params: { ids: number[]; status: string }) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  if (!params.ids?.length) return { ok: true as const };

  const db = supabaseAdmin();
  const { error } = await db
    .from("transfers")
    .update({ status: params.status })
    .in("id", params.ids);

  if (error) throw new Error(error.message);

  return { ok: true as const };
}

export async function deleteTransfer(params: { id: number }) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const db = supabaseAdmin();
  const { error } = await db.from("transfers").delete().eq("id", params.id);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function deleteTransfers(params: { ids: number[] }) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
  if (!params.ids?.length) return { ok: true as const };

  const db = supabaseAdmin();
  const { error } = await db.from("transfers").delete().in("id", params.ids);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function updateTransferNotes(params: { id: number; notes: string }) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const db = supabaseAdmin();
  const { error } = await db
    .from("transfers")
    .update({ notes: params.notes })
    .eq("id", params.id);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}
