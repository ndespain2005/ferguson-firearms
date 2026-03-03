import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/products") ||
    pathname.includes(".")
  );
}

export default clerkMiddleware((_auth, req: NextRequest) => {
  const lockEnabled =
    (process.env.SITE_LOCK || "").toLowerCase() === "true" ||
    process.env.SITE_LOCK === "1";

  if (!lockEnabled) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Always allow the unlock page and static assets needed to render it.
  if (pathname === "/unlock" || pathname.startsWith("/unlock/") || isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.SITE_PASSWORD || "preview";
  const cookie = req.cookies.get("site_auth")?.value || "";

  if (cookie === password) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
});

export const config = {
  // Lock EVERYTHING (all routes + API). Only /unlock + static assets are allowed above.
  matcher: ["/(.*)"],
};
