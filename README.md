# Alertcode Website (Stable v1)

Production-oriented Next.js 14 application for Alertcode, including:

- marketing pages (`/`, `/work`, `/blog`, `/about`, `/team`, `/community`, `/contact`)
- global search modal
- admin dashboard and protected admin APIs
- Prisma-backed content and operations data
- monitoring endpoints (`/api/health`, `/api/metrics`)
- PWA support for production builds

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- Vitest + Testing Library

## Prerequisites

- Node.js 18+
- npm 9+

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill required values:

- `DATABASE_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`

Optional values are documented in `.env.example` and `DEPLOYMENT.md`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database

Development:

```bash
npx prisma migrate dev
```

Production/staging:

```bash
npx prisma migrate deploy
```

## Scripts

```bash
npm run dev         # Next.js dev server
npm run lint        # ESLint
npm run test        # Vitest
npm run build       # Production build
npm run start       # Start production server
npm run analyze     # Bundle analysis build
```

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

CI runs:

- `npm ci`
- `npm run lint`
- `npx vitest run`
- `npm run build`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment variables, Vercel settings, and runtime notes.

## Stable v1 Release Checklist

- `npm run lint` passes
- `npm run test` passes
- `npm run build` passes
- `.env` is not committed
- secrets and local artifacts are ignored via `.gitignore`
