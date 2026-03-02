"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { SITE } from "@/lib/site-config";
import { Resend } from "resend";

export type ContactTopic = "General" | "Transfer" | "Service Quote" | "Firearm Request";

export type ContactInput = {
  fullName: string;
  phone?: string;
  email: string;
  topic: ContactTopic;
  message: string;

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

export async function submitContactMessage(input: ContactInput) {
  // Honeypot spam trap
  if (typeof input.company === "string" && input.company.trim().length > 0) {
    return { id: "0", createdAt: new Date().toISOString(), emailSent: true };
  }

  const fullName = (input.fullName ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();
  const topic = input.topic;
  const message = (input.message ?? "").trim();

  if (!fullName) throw new Error("Full name is required.");
  if (!email || !isEmail(email)) throw new Error("A valid email is required.");
  if (!message) throw new Error("Message is required.");

  const db = supabaseAdmin();

  const { data, error } = await db
    .from("contact_messages")
    .insert([
      {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        name: fullName,
        phone: phone || null,
        email,
        topic,
        message,
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
    const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.TRANSFER_NOTIFY_EMAIL || SITE.email;
    const from =
      process.env.RESEND_FROM ||
      `Ferguson Firearms <no-reply@${SITE.email.split("@")[1]}>`;

    const subject = `Contact — ${topic} — ${fullName}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;">
        <h2 style="margin:0 0 12px;">New Contact Message</h2>
        <p style="margin:0 0 10px;color:#555;">${esc(SITE.name)} • ${esc(SITE.city)} • ${esc(SITE.phone)}</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;">
          <tr><td style="font-weight:600;">Submission ID</td><td>${esc(String(data.id))}</td></tr>
          <tr><td style="font-weight:600;">Topic</td><td>${esc(topic)}</td></tr>
          <tr><td style="font-weight:600;">Name</td><td>${esc(fullName)}</td></tr>
          <tr><td style="font-weight:600;">Phone</td><td>${esc(phone || "—")}</td></tr>
          <tr><td style="font-weight:600;">Email</td><td>${esc(email)}</td></tr>
          <tr><td style="font-weight:600;">Message</td><td>${esc(message)}</td></tr>
        </table>
      </div>
    `;

    await resend.emails.send({ from, to, subject, html, reply_to: email });
  } catch (e) {
    console.error("Contact message email failed", e);
    emailSent = false;
  }

  return { id: data.id, createdAt: data.created_at, emailSent };
}
