"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { sendTransferNotification } from "@/lib/email";
import { SITE } from "@/lib/site-config";

export type TransferIntakeInput = {
  itemName?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  sellerName: string;
  sellerWebsite?: string;
  trackingNumber?: string;
  firearmType: "Handgun" | "Rifle" | "Other";
  serialNumber?: string;
  expectedArrival?: string;
  notes?: string;
};

function esc(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export async function submitTransferIntake(input: TransferIntakeInput) {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("transfers")
    .insert([
      {
        item_name: input.itemName || null,
        full_name: input.fullName,
        phone: input.phone,
        email: input.email,
        address: input.address,
        seller_name: input.sellerName,
        seller_website: input.sellerWebsite || null,
        tracking_number: input.trackingNumber || null,
        firearm_type: input.firearmType,
        serial_number: input.serialNumber || null,
        expected_arrival: input.expectedArrival || null,
        notes: input.notes || null,
        status: "Pending",
      },
    ])
    .select("id, created_at")
    .single();

  if (error) throw new Error(error.message);

  const subject = `New Transfer Intake — ${input.fullName}`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;">
      <h2 style="margin:0 0 12px;">New Transfer Intake</h2>
      <p style="margin:0 0 10px;color:#555;">${esc(SITE.name)} • ${esc(SITE.city)} • ${esc(SITE.phone)}</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;">
        <tr><td style="font-weight:600;">Submission ID</td><td>${esc(String(data.id))}</td></tr>
        <tr><td style="font-weight:600;">Item</td><td>${esc(input.itemName || "—")}</td></tr>
        <tr><td style="font-weight:600;">Name</td><td>${esc(input.fullName)}</td></tr>
        <tr><td style="font-weight:600;">Phone</td><td>${esc(input.phone)}</td></tr>
        <tr><td style="font-weight:600;">Email</td><td>${esc(input.email)}</td></tr>
        <tr><td style="font-weight:600;">Address</td><td>${esc(input.address)}</td></tr>
        <tr><td style="font-weight:600;">Seller</td><td>${esc(input.sellerName)}</td></tr>
        <tr><td style="font-weight:600;">Seller Website</td><td>${esc(input.sellerWebsite || "—")}</td></tr>
        <tr><td style="font-weight:600;">Tracking</td><td>${esc(input.trackingNumber || "—")}</td></tr>
        <tr><td style="font-weight:600;">Type</td><td>${esc(input.firearmType)}</td></tr>
        <tr><td style="font-weight:600;">Serial</td><td>${esc(input.serialNumber || "—")}</td></tr>
        <tr><td style="font-weight:600;">Expected Arrival</td><td>${esc(input.expectedArrival || "—")}</td></tr>
        <tr><td style="font-weight:600;">Notes</td><td>${esc(input.notes || "—")}</td></tr>
      </table>
    </div>
  `;

  await sendTransferNotification({ subject, html });

  return { id: data.id, createdAt: data.created_at };
}
