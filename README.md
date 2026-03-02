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

### Clerk routing note
Sign-in/sign-up pages use `routing="path"` with App Router catch-all routes.

## Placeholder inventory + search
Shop products include a `stock` number for display-only inventory. Out of stock disables Add to Cart. Search filters products by name across Shop sections.

## Transfer intake (DB + email)
### Required environment variables
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
Optional:
- TRANSFER_NOTIFY_EMAIL (defaults to SITE.email)
- RESEND_FROM (defaults to no-reply@fergusonfirearms.com)
- ADMIN_EMAIL (defaults to SITE.email)

### Supabase table (run in Supabase SQL editor)
```sql
create table if not exists transfers (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  status text not null default 'Pending',
  item_name text,
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  seller_name text not null,
  seller_website text,
  tracking_number text,
  firearm_type text not null,
  serial_number text,
  expected_arrival text,
  notes text
);
```
