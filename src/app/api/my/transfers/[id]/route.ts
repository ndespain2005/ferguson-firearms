import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await currentUser();
  const email =
    user?.emailAddresses?.[0]?.emailAddress ||
    user?.primaryEmailAddress?.emailAddress ||
    "";

  if (!user || !email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));

  // Limited fields customers can update
  const update: any = {};
  if (typeof body.tracking_number === "string") update.tracking_number = body.tracking_number.trim();
  if (typeof body.seller_name === "string") update.seller_name = body.seller_name.trim();
  if (typeof body.seller_website === "string") update.seller_website = body.seller_website.trim();
  if (typeof body.notes === "string") update.notes = body.notes.trim();

  if (!Object.keys(update).length) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Ensure record belongs to this user by email match
  const { data: row, error: findErr } = await db
    .from("transfers")
    .select("id, email")
    .eq("id", id)
    .single();

  if (findErr || !row) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if ((row.email || "").toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { error: updErr } = await db.from("transfers").update(update).eq("id", id);
  if (updErr) {
    return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
