import {{ SignIn }} from "@clerk/nextjs";
import {{ SITE }} from "@/lib/site-config";

export default function Page() {{
  return (
    <div className="min-h-[calc(100vh-80px)] text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 p-8">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/50" />
              <div>
                <div className="text-lg font-semibold">{SITE.name}</div>
                <div className="text-sm text-white/55">Hybrid tactical + enterprise workflow</div>
              </div>
            </div>

            <div>
              <div className="text-3xl font-semibold leading-tight">
                Track requests, quotes, and transfers — without the phone tag.
              </div>
              <div className="mt-3 text-white/65">
                Clean status updates, clear steps, and fast communication. Built for real customers and real compliance.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Feature title="Fast Transfers" desc="Intake + status tracking so you always know where you stand." />
              <Feature title="Purchase Requests" desc="Send exact model/SKU details and we’ll quote quickly." />
              <Feature title="Service Quotes" desc="Describe work once — get a clean scope, price, and turnaround." />
              <Feature title="One Dashboard" desc="Everything you submitted, in one place." />
            </div>

            <div className="text-xs text-white/45">
              Questions? Call <span className="text-white/70">{SITE.phone}</span> • {SITE.city}
            </div>
          </div>
        </div>

        <div className="glow-card rounded-3xl border border-white/10 bg-black/55 p-6 md:p-8">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              elements: {{
                card: "bg-transparent shadow-none border-0 p-0",
                headerTitle: "text-white text-2xl",
                headerSubtitle: "text-white/60",
                socialButtonsBlockButton: "bg-black/40 border border-white/10 text-white hover:bg-red-600/25",
                formButtonPrimary: "bg-red-600 hover:bg-red-700",
                footerActionLink: "text-red-400 hover:text-red-300",
                formFieldInput: "bg-black/45 border border-white/10 text-white",
                formFieldLabel: "text-white/70",
                dividerLine: "bg-white/10",
                dividerText: "text-white/50",
              }},
            }}
          />
          <div className="mt-4 text-xs text-white/45">
            By continuing, you agree to receive account-related messages about your requests and updates.
          </div>
        </div>
      </div>
    </div>
  );
}}

function Feature({{ title, desc }}: {{ title: string; desc: string }}) {{
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/60">{desc}</div>
    </div>
  );
}}
