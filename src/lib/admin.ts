import { currentUser } from "@clerk/nextjs/server";
import { SITE } from "@/lib/site-config";

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "signed_out" as const };

  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const allow = (process.env.ADMIN_EMAIL || SITE.email).toLowerCase();

  if (email !== allow) return { ok: false as const, reason: "not_admin" as const };

  return { ok: true as const, user };
}
