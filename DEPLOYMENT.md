# Deployment Guide

## Required Environment Variables

Set these in production:

- `DATABASE_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`

Optional:

- `NEXT_PUBLIC_APP_ENV` (defaults to `development`)
- `NEXT_PUBLIC_ANALYTICS_ID`
- `NEXT_PUBLIC_ENABLE_ANALYTICS`
- `NEXT_PUBLIC_ENABLE_ERROR_TRACKING`
- `NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING`
- `CONTACT_EMAIL`
- `API_BASE_URL`

## Build and Run Commands

1. Install dependencies:

```bash
npm install
```

2. Run Prisma migration:

```bash
npx prisma migrate deploy
```

For local development database initialization:

```bash
npx prisma migrate dev --name init
```

3. Build for production:

```bash
npm run build
```

4. Start production server:

```bash
npm start
```

## Vercel Settings

Use these project settings in Vercel:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `.next`

Set required environment variables in Vercel:

- `DATABASE_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_GA_ID`
- `ENABLE_DEBUG_ENDPOINT`

## Port Behavior

- The launcher enforces a fixed port (`8080`).
- If the port is busy, startup fails fast with `EADDRINUSE`.

## Domain Configuration

- Set `NEXT_PUBLIC_SITE_URL` to your final domain, for example:
  - `https://alertcode.in`
- This value is used for canonical URLs, OpenGraph base URL, `robots.txt`, and `sitemap.xml` output.

## PWA Notes

- PWA is disabled in development.
- PWA is enabled in production builds.
- Manifest: `/manifest.json`
- Offline fallback page: `/offline`

## Monitoring Endpoints

- Health: `/api/health`
- Metrics: `/api/metrics`

## Security Notes

- Admin routes are protected by middleware + session cookie validation.
- Admin API responses are `no-store`.
- Security headers are configured in `next.config.js`.
- Rate limiting is active for admin login and admin project APIs.

## Database Backup Reminder

- Run daily backups for production databases.
- If using a hosted database, enable automated snapshot backups.
- Track Prisma migrations in version control and apply them through a controlled release pipeline.
