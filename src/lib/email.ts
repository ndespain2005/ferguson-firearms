import { Resend } from "resend";
import { SITE } from "@/lib/site-config";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function sendTransferNotification(params: {
  subject: string;
  html: string;
}) {
  const resend = new Resend(required("RESEND_API_KEY"));
  const to = process.env.TRANSFER_NOTIFY_EMAIL || SITE.email;
  const from = process.env.RESEND_FROM || `Ferguson Firearms <no-reply@${SITE.email.split("@")[1]}>`;
  await resend.emails.send({
    from,
    to,
    subject: params.subject,
    html: params.html,
  });
}
