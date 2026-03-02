import { Card, ButtonLink, SectionHeading } from "@/components/ui";

const services = [
  { title: "Custom Builds", desc: "Build consult + parts planning + assembly." },
  { title: "Optic Mounting", desc: "Mount + torque + witness marks (as needed)." },
  { title: "Accessory Installation", desc: "Lights, slings, mounts, handguards." },
  { title: "Gunsmithing Requests", desc: "Describe the job; we’ll quote scope + timeline." },
];

export default function ServicesPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Services"
        title="Tactical work. Minimal friction."
        subtitle="Request quotes for custom work and installs. We’ll confirm scope and turnaround before anything begins."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.title} title={s.title}>
            <p className="text-sm text-muted">{s.desc}</p>
          </Card>
        ))}
      </div>

      <Card title="Request a Quote">
        <p className="text-sm text-muted">
          For the preview, quotes route through the Contact page form.
        </p>
        <div className="mt-4">
          <ButtonLink href="/contact">Request Service Quote</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
