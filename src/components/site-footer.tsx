import Image from "next/image";
import Link from "next/link";

const PHONE = "317-600-8758";
const EMAIL = "nickdespain@fergusonfirearms.com"; // placeholder until domain is purchased

export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <Image
                src="/ferguson-logo.png"
                alt="Ferguson Firearms logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">Ferguson Firearms</div>
              <div className="text-xs text-muted">
                Indianapolis, IN — Wanamaker Area
              </div>
            </div>
          </div>
          <div className="text-sm text-muted">Mon–Fri 8:00 AM – 6:00 PM</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Contact</div>
          <div className="text-sm text-muted">{PHONE}</div>
          <div className="text-sm text-muted">{EMAIL}</div>
          <div className="text-xs text-muted">
            Firearms purchases handled through compliant processes (Ship-to-FFL /
            request workflow).
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Quick Links</div>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              ["Shop", "/shop"],
              ["Cart", "/cart"],
              ["Transfers", "/transfers"],
              ["Services", "/services"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-border bg-card px-3 py-2 text-muted transition hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <div className="mx-auto w-full max-w-6xl px-4 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} Ferguson Firearms. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
