# ResumeForge AI

Production-ready, scalable SaaS for AI-powered resume optimization \u2014 ATS scoring,
job matching, cover letters, LinkedIn optimization, interview prep and more.

> **Status:** Foundation scaffold. The core architecture (auth, AI provider layer
> with fallback, queue/workers, billing, storage, security middleware, tests,
> Docker) is implemented. Feature verticals build on top of these primitives.

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript, Tailwind, shadcn |
| State/data | React Query, Zustand                                          |
| Backend    | Next.js route handlers, Prisma, PostgreSQL                    |
| Cache/Jobs | Redis, BullMQ workers                                         |
| Auth       | JWT (jose) + refresh sessions, scrypt, TOTP 2FA, Google OAuth |
| AI         | OpenAI + Anthropic with automatic provider fallback + streaming |
| Payments   | Stripe subscriptions + webhooks                               |
| Storage    | S3-compatible (AWS SDK v3) with presigned URLs                |
| Testing    | Vitest (unit) + Playwright (e2e)                              |
| Deploy     | Multi-stage Docker + docker-compose                           |

## Quick start

```bash
# 1. Install deps
npm install

# 2. Configure environment
cp .env.example .env   # then fill in secrets

# 3. Start Postgres + Redis (or use your own)
docker compose up -d db redis

# 4. Apply schema + seed plans/admin
npx prisma migrate dev
npm run db:seed

# 5. Run the app + worker
npm run dev      # web (http://localhost:3000)
npm run worker   # background AI worker (separate terminal)
```

Default seeded admin: `admin@resumeforge.ai` / `ChangeMe123!` (change immediately).

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Start Next.js in dev mode |
| `npm run build` | Prisma generate + production build |
| `npm run worker` | Start BullMQ worker process |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run db:seed` | Seed plans + admin user |
| `npm run lint` / `npm run typecheck` | Static checks |

## Project structure

```
prisma/                 Prisma schema + seed
src/
  app/                  App Router pages + API route handlers
    api/
      auth/             register, login (2FA-aware)
      resumes/analyze   queued resume analysis
      stripe/webhook    subscription lifecycle
      health            liveness/readiness probe
  lib/
    ai/                 provider abstraction, fallback, prompts
    auth/               password, jwt, session, totp
    analysis/           deterministic keyword match scorer
    resume/             pdf/docx/txt text extraction
    queue/              BullMQ queues + workers
    storage/            S3-compatible client
    stripe.ts redis.ts prisma.ts rate-limit.ts errors.ts logger.ts
  middleware.ts         security headers + auth gating
tests/
  unit/                 Vitest specs
  e2e/                  Playwright specs
ci/github-actions-ci.yml  CI pipeline (move to .github/workflows/ci.yml)
docs/ARCHITECTURE.md    architecture + ER diagrams
Dockerfile docker-compose.yml
```

## Deployment

```bash
docker compose up -d --build   # app + worker + postgres + redis
npx prisma migrate deploy      # run migrations against prod DB
```

The app builds with Next.js `output: "standalone"` for a minimal runtime image.

## CI

GitHub Actions pipeline lives at `ci/github-actions-ci.yml`. Move it to
`.github/workflows/ci.yml` and push to enable lint + typecheck + tests + build
on every PR. (It was placed outside `.github/workflows` because the automation
that scaffolded this repo lacks the GitHub `workflows` permission.)

## Security highlights

scrypt hashing, JWT + rotating refresh sessions, TOTP 2FA, Redis rate limiting,
strict CSP/security headers, Zod input validation, audit logging, encrypted
object storage, Stripe webhook signature verification.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design.
