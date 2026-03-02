import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="glow-card rounded-2xl border border-white/10 bg-black/55 p-6">
        <SignUp
          appearance={{
            elements: {
              card: "bg-transparent shadow-none border-0",
              headerTitle: "text-white",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButton: "bg-black/40 border border-white/10 text-white hover:bg-red-600/25",
              formButtonPrimary: "bg-red-600 hover:bg-red-700",
              footerActionLink: "text-red-400 hover:text-red-300",
              formFieldInput: "bg-black/45 border border-white/10 text-white",
              formFieldLabel: "text-white/70",
            },
          }}
        />
      </div>
    </div>
  );
}
