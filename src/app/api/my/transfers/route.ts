import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || "";

  if (!user || !email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("transfers")
    .select("id, created_at, status, firearm_type, item_name, serial_number, seller_name, seller_website, tracking_number, notes, expected_arrival, address, phone, email")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email, transfers: data || [] });
}
