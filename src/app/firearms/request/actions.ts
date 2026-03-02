"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { SITE } from "@/lib/site-config";
import { Resend } from "resend";

export type PurchaseRequestInput = {
  firearm: string;
  source?: string;
  receivingFFL: string;
  notes?: string;

  // customer
  fullName: string;
  phone?: string;
  email: string;

  // honeypot
  company?: string;
};

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function esc(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function submitPurchaseRequest(input: PurchaseRequestInput) {
  // Honeypot spam trap
  if (typeof input.company === "string" && input.company.trim().length > 0) {
    return { id: "0", createdAt: new Date().toISOString(), emailSent: true };
  }

  const fullName = (input.fullName ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();
  const firearm = (input.firearm ?? "").trim();
  const source = (input.source ?? "").trim();
  const receivingFFL = (input.receivingFFL ?? "").trim();
  const notes = (input.notes ?? "").trim();

  if (!fullName) throw new Error("Full name is required.");
  if (!email || !isEmail(email)) throw new Error("A valid email is required.");
  if (!firearm) throw new Error("Firearm details are required.");
  if (!receivingFFL) throw new Error("Receiving FFL details are required.");

  const db = supabaseAdmin();

  const { data, error } = await db
    .from("purchase_requests")
    .insert([
      {
        id: crypto.randomUUID(),
        name: fullName,
        phone: phone || null,
        email,
        firearm,
        source: source || null,
        receiving_ffl: receivingFFL,
        notes: notes || null,
        status: "New",
      },
    ])
    .select("id, created_at")
    .single();

  if (error) throw new Error(error.message);

  // Optional email notification (same style as transfers)
  let emailSent = true;
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const to = process.env.PURCHASE_REQUEST_TO || process.env.TRANSFER_NOTIFY_EMAIL || SITE.email;
    const from =
      process.env.PURCHASE_REQUEST_FROM ||
      process.env.RESEND_FROM ||
      `Ferguson Firearms <no-reply@${SITE.email.split("@")[1]}>`;

    if (!resendKey) throw new Error("Missing env: RESEND_API_KEY");

    const resend = new Resend(required("RESEND_API_KEY"));
    const subject = `New Purchase Request — ${fullName}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;">
        <h2 style="margin:0 0 12px;">New Firearm Purchase Request</h2>
        <p style="margin:0 0 10px;color:#555;">${esc(SITE.name)} • ${esc(SITE.city)} • ${esc(SITE.phone)}</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;">
          <tr><td style="font-weight:600;">Submission ID</td><td>${esc(String(data.id))}</td></tr>
          <tr><td style="font-weight:600;">Name</td><td>${esc(fullName)}</td></tr>
          <tr><td style="font-weight:600;">Phone</td><td>${esc(phone || "—")}</td></tr>
          <tr><td style="font-weight:600;">Email</td><td>${esc(email)}</td></tr>
          <tr><td style="font-weight:600;">Firearm Requested</td><td>${esc(firearm)}</td></tr>
          <tr><td style="font-weight:600;">Where buying from</td><td>${esc(source || "—")}</td></tr>
          <tr><td style="font-weight:600;">Receiving FFL</td><td>${esc(receivingFFL)}</td></tr>
          <tr><td style="font-weight:600;">Notes</td><td>${esc(notes || "—")}</td></tr>
        </table>
      </div>
    `;

    await resend.emails.send({ from, to, subject, html, reply_to: email });
  } catch (e) {
    console.error("Purchase request email failed", e);
    emailSent = false;
  }

  return { id: data.id, createdAt: data.created_at, emailSent };
}
