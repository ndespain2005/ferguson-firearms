# Ferguson Firearms — Preview Site (Next.js)

## Run locally (Windows/Mac)
```bash
npm install
npm run dev
```
Open http://localhost:3000

## What’s included
- Dark-only tactical theme (light mode removed)
- Heavy ember particles + watermark logo + scanline sweep
- Shop inspired layout: nav + tiles + featured + recently added
- Shop nav: Shop All / Rifles / Handguns / Collectibles
- Header placeholders: Wishlist + Account (visual only)
- Accessories & apparel: preview cart flow
- Rifles/handguns: request-to-purchase flow
- Transfer intake form (mailto preview)

## Windows note
Do NOT run from OneDrive-synced folders. Use `C:\Dev\...`.

## Accounts (Clerk)
This project uses Clerk for email/password accounts.

### Required environment variables (Vercel)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

### Routes
- /sign-in
- /sign-up
- /account
