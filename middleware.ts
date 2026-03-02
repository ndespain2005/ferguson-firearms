\
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/admin(.*)",
    "/account(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/transfers(.*)",
    "/shop(.*)",
    "/((?!_next|.*\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
