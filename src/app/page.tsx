import Link from "next/link";
import Image from "next/image";
import { Card, ButtonLink, Badge, SectionHeading } from "@/components/ui";
import { SITE } from "@/lib/site-config";

const PHONE = "317-XXXXXXX";
const HOURS = "Mon–Fri 8:00 AM – 6:00 PM";
const CITY = "Indianapolis, IN";
const AREA = "Wanamaker";

export default function HomePage() {
  return (
    <div className="space-y-10 text-white">
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{CITY}</Badge>
            <Badge>{AREA}</Badge>
            <Badge>{HOURS}</Badge>
          </div>

          <SectionHeading
            eyebrow="Ferguson Firearms"
            title="Tactical. Modern. Minimal."
            subtitle="FFL transfers, request-to-purchase, custom services, and accessories — built for speed, clarity, and compliance."
          />

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/shop">Shop</ButtonLink>
            <ButtonLink href="/transfers" variant="ghost">
              Transfers
            </ButtonLink>
            <ButtonLink href="/firearms/request" variant="ghost">
              Request to Purchase
            </ButtonLink>
          </div>

          <div className="text-white/60 text-lg">
            <span className="font-semibold text-white">Phone:</span> {PHONE}
            <span className="mx-3">•</span>
            <span className="font-semibold text-white">Hours:</span> {HOURS}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Fast, clean intake">
              <div className="text-white/70 text-lg">
                Submit your transfer or request online. We confirm next steps and keep communication simple.
              </div>
            </Card>
            <Card title="Local & compliant">
              <div className="text-white/70 text-lg">
                Indianapolis-based workflows with clear Ship-to-FFL guidance and pickup scheduling.
              </div>
            </Card>
          </div>
        </div>

        <Card title="Brand Mark">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
            <Image
              src="/ferguson-logo.png"
              alt="Ferguson Firearms logo"
              fill
              className="object-contain p-8"
              priority
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>Dark-only Tactical</Badge>
            <Badge>Embers + Scanline FX</Badge>
            <Badge>Black/Red UI</Badge>
          </div>
        </Card>
      </div>

      <Card title="Shop by Category">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Accessories", sub: "Parts • optics • mounts", href: "/shop#accessories" },
            { title: "Rifles", sub: "Request flow", href: "/shop#rifles" },
            { title: "Handguns", sub: "Request flow", href: "/shop#handguns" },
            { title: "Apparel", sub: "Tees • hats", href: "/shop#apparel" },
          ].map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="glow-card rounded-2xl border border-white/10 bg-black/55 p-6 transition hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-black/65"
            >
              <div className="text-xl font-semibold">{c.title}</div>
              <div className="mt-2 text-white/70 text-lg">{c.sub}</div>
              <div className="mt-4 font-semibold text-red-400">Open →</div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Transfers — 3 steps">
          <ol className="list-decimal pl-5 space-y-2 text-white/70 text-lg">
            <li>Buy from seller and choose Ship-to-FFL.</li>
            <li>Submit our intake form (seller + order details).</li>
            <li>We notify you when it arrives and schedule pickup.</li>
          </ol>
          <div className="mt-5">
            <ButtonLink href="/transfers/intake">Start Transfer Intake</ButtonLink>
          </div>
        </Card>

        <Card title="Request-to-Purchase">
          <div className="text-white/70 text-lg">
            Looking for a rifle/handgun/receiver? Send the model and vendor info — we’ll respond with next steps.
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/firearms/request">Start Request</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">Questions</ButtonLink>
          </div>
        </Card>

        <Card title="Services">
          <div className="text-white/70 text-lg">
            Builds, installs, and gunsmithing requests with clear quoting and turnaround expectations.
          </div>
          <div className="mt-5">
            <ButtonLink href="/services" variant="ghost">View Services</ButtonLink>
          </div>
        </Card>
      </div>

      <Card title="Why Ferguson Firearms">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Fast Communication", "Clear updates from intake → pickup."],
            ["Clean UI + Process", "Designed to feel premium and simple."],
            ["Local Focus", "Indianapolis & Wanamaker area."],
            ["Tactical Brand", "Black/red styling with subtle motion."],
          ].map(([h, p]) => (
            <div key={h} className="rounded-2xl border border-white/10 bg-black/45 p-5">
              <div className="text-lg font-semibold">{h}</div>
              <div className="mt-2 text-white/70 text-lg">{p}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}