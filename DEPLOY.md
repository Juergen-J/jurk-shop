# Deployment (Railway)

The monorepo uses **pnpm** (`packageManager` in `package.json`). Railway detects
it from `pnpm-lock.yaml` and runs `pnpm install` at the repo root.

## Services

Create one Railway project with four services from this repository / templates:

| Service    | Source                    | Public domain (example) |
|------------|---------------------------|-------------------------|
| Postgres   | Railway Postgres template | –                       |
| Redis      | Railway Redis template    | –                       |
| Backend    | this repo                 | `api.jurk.pro` (admin at `/app`) |
| Storefront | this repo                 | `shop.jurk.pro`         |

Deploy the **backend first**: the storefront needs its publishable API key.

### Backend

- Build command: `pnpm turbo build --filter=@dtc/backend`
- Start command: `cd apps/backend/.medusa/server && npm install && npm run predeploy && npm run start`
  - `predeploy` runs the database migrations and the migration scripts
    (initial store setup, § 19 UStG tax rate, English translations). They are
    idempotent, so redeploys are safe.
- Healthcheck path: `/health`

Variables:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<openssl rand -base64 32>
COOKIE_SECRET=<openssl rand -base64 32>
STORE_CORS=https://shop.jurk.pro
ADMIN_CORS=https://api.jurk.pro
AUTH_CORS=https://shop.jurk.pro,https://api.jurk.pro
STOREFRONT_URL=https://shop.jurk.pro
CONTACT_EMAIL=info@jurk.pro

# Email (order confirmations, withdrawals)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="JURK.PRO Shop <info@jurk.pro>"

# Cloudflare R2 (product images)
S3_FILE_URL=https://images.jurk.pro
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=auto
S3_BUCKET=jurk-shop
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### Storefront

- Build command: `pnpm turbo build --filter=@dtc/storefront`
- Start command: `cd apps/storefront && pnpm start` (listens on `$PORT`)

Variables (needed at build time, so redeploy after changing them):

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.jurk.pro
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<from the admin, see below>
NEXT_PUBLIC_BASE_URL=https://shop.jurk.pro
NEXT_PUBLIC_DEFAULT_REGION=de
NEXT_PUBLIC_FILE_HOSTNAME=images.jurk.pro
```

## Cloudflare R2

1. Cloudflare dashboard → R2 → create bucket `jurk-shop`.
2. Bucket → Settings → Custom Domains → connect `images.jurk.pro`
   (or enable the public `r2.dev` URL for testing). This is `S3_FILE_URL`.
3. R2 → Manage API tokens → create a token with *Object Read & Write* for the
   bucket. Use its Access Key ID / Secret Access Key.
4. The S3 endpoint is shown on the bucket page:
   `https://<account-id>.r2.cloudflarestorage.com`.

## After the first backend deploy

1. Create an admin user (Railway → Backend → shell):
   ```bash
   cd apps/backend/.medusa/server && npx medusa user -e info@jurk.pro -p '<password>'
   ```
2. Admin → Settings → Publishable API Keys → copy the key "Storefront" into
   `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` of the storefront and deploy it.
3. Admin → Settings → Store: bank details, notification email, free shipping,
   volume discounts, production times.
4. Replace the sample product variants/prices and upload photos.
5. DNS: CNAME `shop`, `api` (and `images` for R2) to the targets Railway /
   Cloudflare show.
6. Place a test order and submit a test withdrawal (Vertrag widerrufen) to
   check both emails.

## Before going live

- Name the hosting provider in the privacy policy
  (`apps/backend/src/legal/documents.ts`, section "Hosting").
- Have the legal texts reviewed.
- Kleinunternehmer status: if it ends, see `COMPANY.smallBusiness` in
  `apps/backend/src/legal/company.ts`.
