import Link from "next/link";
import { Card, Badge, ButtonLink, SectionHeading } from "@/components/ui";
import { SITE } from "@/lib/site-config";

const CITY = "Indianapolis, IN";
const AREA = "Wanamaker";
const HOURS = "TBD";

export default function AboutPage() {
  return (
    <div className="space-y-10 text-white">
      <SectionHeading
        eyebrow="About"
        title="Local. Family-Owned. Process-Driven."
        subtitle="Ferguson Firearms is a locally operated, family-run business serving Indianapolis and the Wanamaker area with a modern, compliance-first approach."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge>{CITY}</Badge>
        <Badge>{AREA}</Badge>
        <Badge>{HOURS}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Family-Owned">
          <div className="text-white/70 text-lg">
            Built as a local family business, Ferguson Firearms was created to offer a cleaner,
            more professional alternative to high-volume, impersonal storefronts. We focus on
            relationships, reputation, and doing things the right way.
          </div>
        </Card>

        <Card title="Community Focused">
          <div className="text-white/70 text-lg">
            Serving Indianapolis and the surrounding Wanamaker community, we prioritize
            accessibility, transparency, and consistent communication from intake to pickup.
          </div>
        </Card>

        <Card title="Compliance First">
          <div className="text-white/70 text-lg">
            We operate with a strict compliance-first mindset. Clear documentation, proper
            intake workflows, and structured pickup procedures protect both our customers and our business.
          </div>
        </Card>
      </div>

      <Card title="Transfers — Built for Speed & Clarity">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 text-white/70 text-lg">
            <p>
              Our transfer workflow is designed to eliminate confusion. Once you purchase from a seller,
              you submit our intake form with the required details. We confirm receipt, track arrival,
              and notify you when it’s ready for pickup.
            </p>
            <p>
              Every step is structured so you know exactly what’s happening — no guessing,
              no unnecessary delays.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/45 p-6">
            <div className="text-xl font-semibold text-white">3-Step Transfer Process</div>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-white/70 text-lg">
              <li>Purchase from seller and select Ship-to-FFL.</li>
              <li>Submit Ferguson Firearms intake form.</li>
              <li>Receive arrival notification and schedule pickup.</li>
            </ol>
            <div className="mt-6">
              <ButtonLink href="/transfers/intake">
                Start Transfer Intake
              </ButtonLink>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Request-to-Purchase Workflow">
        <div className="text-white/70 text-lg space-y-4">
          <p>
            For rifles, handguns, and serialized items, we use a structured request-to-purchase system.
            Provide the model and vendor information, and we respond with clear next steps and shipping instructions.
          </p>
          <p>
            This approach ensures all regulated items are handled properly while keeping the process streamlined for customers.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/firearms/request">
            Start a Request
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost">
            Contact Us
          </ButtonLink>
        </div>
      </Card>

      <Card title="Why Customers Choose Us">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Local & Accessible", "Direct communication, not a corporate call center."],
            ["Fast Transfers", "Structured intake means quicker turnaround."],
            ["Clean Process", "Clear documentation and compliant procedures."],
          ].map(([h, p]) => (
            <div key={h} className="rounded-2xl border border-white/10 bg-black/45 p-5">
              <div className="text-lg font-semibold text-white">{h}</div>
              <div className="mt-2 text-white/70 text-lg">{p}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Built for the Long Term">
        <div className="text-white/70 text-lg">
          Ferguson Firearms is built on long-term relationships and responsible operation.
          Our goal is to create a professional, trusted name in the Indianapolis area —
          combining modern systems with traditional values.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="btn-red-glow inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            Browse Shop
          </Link>
          <Link
            href="/transfers"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-base font-semibold text-white/80 transition hover:bg-red-600/25 hover:text-white"
          >
            Transfer Info
          </Link>
        </div>
      </Card>
    </div>
  );
}