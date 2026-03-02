import { Card, ButtonLink, SectionHeading } from "@/components/ui";
import { SITE } from "@/lib/site-config";

export default function TransfersPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Transfers"
        title="FFL Transfers — Indianapolis & Wanamaker"
        subtitle="Clear steps, clean intake, fast communication. Start your transfer online and we’ll confirm next steps."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="1) Place your order">
          <p className="text-sm text-muted">
            Purchase from your seller and select “Ship to FFL” if applicable.
          </p>
        </Card>
        <Card title="2) Submit intake">
          <p className="text-sm text-muted">
            Fill out the intake form with seller + order details.
          </p>
        </Card>
        <Card title="3) Pickup">
          <p className="text-sm text-muted">
            When it arrives, we’ll contact you to schedule pickup.
          </p>
        </Card>
      </div>

      <Card title="Start Transfer Intake">
        <p className="text-sm text-muted">
          Use the intake form so we have everything needed when your order ships
          and arrives.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/transfers/intake">Start Intake</ButtonLink>
          <ButtonLink href="/contact" variant="ghost">
            Ask a Transfer Question
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}