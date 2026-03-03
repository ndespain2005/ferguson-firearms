import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

type Payload = {
  name: string;
  phone?: string;
  email: string;
  firearm: string;
  source?: string;
  receivingFFL: string;
  notes?: string;
  // honeypot (should be empty)
  company?: string;
};

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const data = (await safeJson(request)) as Partial<Payload> | null;
  if (!data) {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot spam trap
  if (typeof data.company === "string" && data.company.trim().length > 0) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const name = (data.name ?? "").trim();
  const phone = (data.phone ?? "").trim();
  const email = (data.email ?? "").trim();
  const firearm = (data.firearm ?? "").trim();
  const source = (data.source ?? "").trim();
  const receivingFFL = (data.receivingFFL ?? "").trim();
  const notes = (data.notes ?? "").trim();

  if (!name) return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
  if (!email || !isEmail(email)) return Response.json({ ok: false, error: "Valid email is required." }, { status: 400 });
  if (!firearm) return Response.json({ ok: false, error: "Firearm details are required." }, { status: 400 });
  if (!receivingFFL) return Response.json({ ok: false, error: "Receiving FFL details are required." }, { status: 400 });

  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    name,
    phone: phone || null,
    email,
    firearm,
    source: source || null,
    receiving_ffl: receivingFFL,
    notes: notes || null,
    status: "New",
    user_agent: request.headers.get("user-agent") ?? null,
    ip: request.headers.get("x-forwarded-for") ?? null,
  };

  // 1) Preferred: store in Supabase (admin page reads from here)
  let stored = false;
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from("purchase_requests").insert(record);
    if (!error) stored = true;
  } catch {
    // Supabase not configured or table missing
  }

  // 2) Optional: Email via Resend (recommended)
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.PURCHASE_REQUEST_TO; // e.g. "TBD"
  const from = process.env.PURCHASE_REQUEST_FROM ?? "Ferguson Firearms <TBD>";

  if (resendKey && to) {
    try {
      const resend = new Resend(resendKey);
      const subject = `Firearm Purchase Request — ${name}`;
      const text = [
        `New Firearm Purchase Request (${record.created_at})`,
        ``,
        `Name: ${name}`,
        `Phone: ${phone || "(not provided)"}`,
        `Email: ${email}`,
        ``,
        `Firearm Requested:`,
        firearm,
        ``,
        `Where buying from:`,
        source || "(not provided)",
        ``,
        `Receiving FFL:`,
        receivingFFL,
        ``,
        `Notes:`,
        notes || "(none)",
        ``,
        `Metadata:`,
        `IP: ${record.ip || ""}`,
        `UA: ${record.user_agent || ""}`,
        stored ? `Stored: yes (Supabase)` : `Stored: no (Supabase not configured)`,
      ].join("\n");

      await resend.emails.send({
        from,
        to,
        subject,
        text,
        reply_to: email,
      });
    } catch {
      // ignore email failures
    }
  }

  // 3) Dev fallback: append to local file (may not persist on serverless)
  if (!stored) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, "purchase-requests.jsonl");
      await fs.mkdir(dataDir, { recursive: true });
      await fs.appendFile(filePath, JSON.stringify(record) + "\n", "utf-8");
    } catch {
      // ignore
    }
  }

  return Response.json(
    {
      ok: true,
      stored,
      warning: stored
        ? undefined
        : "Supabase storage is not configured (or table missing). Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and create table purchase_requests for an admin inbox.",
    },
    { status: 200 }
  );
}
