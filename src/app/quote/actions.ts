"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { SITE } from "@/lib/site-config";
import { Resend } from "resend";

export type QuoteInput = {
  fullName: string;
  phone?: string;
  email: string;
  serviceType: "Custom Build" | "Optic Mounting" | "Accessory Install" | "Gunsmithing" | "Other";
  description: string;

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

export async function submitQuoteRequest(input: QuoteInput) {
  // Honeypot spam trap
  if (typeof input.company === "string" && input.company.trim().length > 0) {
    return { id: "0", createdAt: new Date().toISOString(), emailSent: true };
  }

  const fullName = (input.fullName ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();
  const serviceType = input.serviceType;
  const description = (input.description ?? "").trim();

  if (!fullName) throw new Error("Full name is required.");
  if (!email || !isEmail(email)) throw new Error("A valid email is required.");
  if (!description) throw new Error("Please describe the work you want quoted.");

  const db = supabaseAdmin();

  const { data, error } = await db
    .from("service_quotes")
    .insert([
      {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        name: fullName,
        phone: phone || null,
        email,
        service_type: serviceType,
        description,
        status: "New",
      },
    ])
    .select("id, created_at")
    .single();

  if (error) throw new Error(error.message);

  // Optional email notification
  let emailSent = true;
  try {
    const resend = new Resend(required("RESEND_API_KEY"));
    const to = process.env.QUOTE_NOTIFY_EMAIL || process.env.TRANSFER_NOTIFY_EMAIL || SITE.email;
    const from =
      process.env.RESEND_FROM ||
      `Ferguson Firearms <no-reply@${SITE.email.split("@")[1]}>`;

    const subject = `New Quote Request — ${fullName}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;">
        <h2 style="margin:0 0 12px;">New Service Quote Request</h2>
        <p style="margin:0 0 10px;color:#555;">${esc(SITE.name)} • ${esc(SITE.city)} • ${esc(SITE.phone)}</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;">
          <tr><td style="font-weight:600;">Submission ID</td><td>${esc(String(data.id))}</td></tr>
          <tr><td style="font-weight:600;">Name</td><td>${esc(fullName)}</td></tr>
          <tr><td style="font-weight:600;">Phone</td><td>${esc(phone || "—")}</td></tr>
          <tr><td style="font-weight:600;">Email</td><td>${esc(email)}</td></tr>
          <tr><td style="font-weight:600;">Service Type</td><td>${esc(serviceType)}</td></tr>
          <tr><td style="font-weight:600;">Description</td><td>${esc(description)}</td></tr>
        </table>
      </div>
    `;

    await resend.emails.send({ from, to, subject, html, reply_to: email });
  } catch (e) {
    console.error("Quote request email failed", e);
    emailSent = false;
  }

  return { id: data.id, createdAt: data.created_at, emailSent };
}
