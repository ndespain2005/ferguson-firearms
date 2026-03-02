import type { Metadata } from "next";
import "./globals.css";
import { ThemeProviders } from "@/components/theme-providers";
import SiteHeader from "@/components/site-header";
import BackgroundFX from "@/components/background-fx";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  icons: { icon: "/favicon.png" },
  title: "Ferguson Firearms — Indianapolis, IN (Wanamaker)",
  description:
    "FFL Transfers • Custom Builds • Accessories — Serving Indianapolis & Wanamaker.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProviders>
          <div className="min-h-dvh bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 -z-10"><div className="tactical-grid absolute inset-0" /></div>
            <BackgroundFX />
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
              {children}
            </main>
            <SiteFooter />
          </div>
        </ThemeProviders>
      </body>
    </html>
  );
}
