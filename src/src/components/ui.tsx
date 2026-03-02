import Link from "next/link";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`glow-card rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl shadow-black/30 backdrop-blur ${className}`}
    >
      {title ? (
        <div className="mb-4 text-lg font-semibold tracking-tight text-white">
          {title}
        </div>
      ) : null}
      <div className="text-white/90">{children}</div>
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
}) {
  const base =
    "btn-red-glow inline-flex items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold ring-offset-2 transition focus:outline-none focus:ring-2";
  const style =
    variant === "solid"
      ? "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 focus:ring-red-500/50"
      : "border border-white/10 bg-black/40 text-white/80 hover:bg-red-600/25 hover:text-white focus:ring-red-500/40";
  return (
    <Link href={href} className={`${base} ${style}`}>
      {children}
    </Link>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-sm font-semibold text-white/75">
      {children}
    </span>
  );
}

export function Price({ value }: { value: number }) {
  return (
    <span className="font-semibold tabular-nums text-white">
      {value.toLocaleString("en-US", { style: "currency", currency: "USD" })}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-3">
      {eyebrow ? (
        <div className="text-sm uppercase tracking-[0.22em] text-red-400">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      {subtitle ? <p className="max-w-3xl text-white/70 text-lg">{subtitle}</p> : null}
    </div>
  );
}
