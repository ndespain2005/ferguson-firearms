import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type StatusCounts = Record<string, number>;

function countByStatus(rows: Array<{ status?: string | null }>) {
  const counts: StatusCounts = {};
  for (const r of rows) {
    const k = (r.status || "New").toString();
    counts[k] = (counts[k] || 0) + 1;
  }
  return counts;
}

export async function GET() {
  const user = await currentUser();
  const email =
    user?.emailAddresses?.[0]?.emailAddress ||
    user?.primaryEmailAddress?.emailAddress ||
    "";

  if (!user || !email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  const [p, q, c, t] = await Promise.all([
    db.from("purchase_requests").select("id, created_at, status").eq("email", email).order("created_at", { ascending: false }).limit(200),
    db.from("service_quotes").select("id, created_at, status").eq("email", email).order("created_at", { ascending: false }).limit(200),
    db.from("contact_messages").select("id, created_at, status").eq("email", email).order("created_at", { ascending: false }).limit(200),
    db.from("transfers").select("id, created_at, status").eq("email", email).order("created_at", { ascending: false }).limit(200),
  ]);

  const safe = (x: any) => (x?.error ? [] : (x?.data || []));

  const purchase = safe(p);
  const quotes = safe(q);
  const contacts = safe(c);
  const transfers = safe(t);

  const totals = {
    purchaseRequests: purchase.length,
    serviceQuotes: quotes.length,
    contactMessages: contacts.length,
    transfers: transfers.length,
  };

  const openLike = (status: string | null | undefined) => {
    const s = (status || "New").toLowerCase();
    return !["complete", "completed", "closed"].includes(s);
  };

  const open = {
    purchaseRequests: purchase.filter((r: any) => openLike(r.status)).length,
    serviceQuotes: quotes.filter((r: any) => openLike(r.status)).length,
    contactMessages: contacts.filter((r: any) => openLike(r.status)).length,
    transfers: transfers.filter((r: any) => openLike(r.status)).length,
  };

  return NextResponse.json({
    ok: true,
    email,
    totals,
    open,
    counts: {
      purchaseRequests: countByStatus(purchase),
      serviceQuotes: countByStatus(quotes),
      contactMessages: countByStatus(contacts),
      transfers: countByStatus(transfers),
    },
  });
}
