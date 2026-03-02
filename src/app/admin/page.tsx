import { requireAdmin } from "@/lib/admin";
import { Card, SectionHeading } from "@/components/ui";

const links = [
  {
    title: "Purchase Requests",
    desc: "Customer firearm purchase requests + workflow.",
    href: "/admin/purchase-requests",
  },
  {
    title: "Service Quotes",
    desc: "Gunsmithing / installs quote requests + workflow.",
    href: "/admin/service-quotes",
  },
  {
    title: "Contact Messages",
    desc: "General contact messages inbox.",
    href: "/admin/contact-messages",
  },
  {
    title: "Transfers",
    desc: "Transfer intake submissions.",
    href: "/admin/transfers",
  },
];

export default async function AdminHomePage() {
  const gate = await requireAdmin();

  if (!gate.ok) {
    return (
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Admin"
          title="Admin Dashboard"
          subtitle={gate.reason === "signed_out" ? "Please sign in to access admin tools." : "You don’t have access to admin tools."}
        />
        <Card title="Access required">
          <div className="text-sm text-muted">
            Set <span className="font-mono">ADMIN_EMAIL</span> in your environment to the email address you use for Clerk sign-in.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Admin"
        title="Admin Dashboard"
        subtitle="Quick access to inboxes and operations."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {links.map((l) => (
          <Card key={l.href} title={l.title}>
            <p className="text-sm text-muted">{l.desc}</p>
            <div className="mt-4">
              <a
                href={l.href}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90"
              >
                Open
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
