# ResumeForge AI — Feature Overview

This document summarizes the product features and how each one behaves with or
without API keys configured.

## Works today with zero API keys

These features use your configured AI provider when keys are present, and
otherwise fall back to a deterministic, built-in engine. They require no extra
migrations.

| Feature | Route | Page | Persisted |
| --- | --- | --- | --- |
| Resume analysis (ATS score) | `/api/resumes/analyze` | `/dashboard/resumes` | Yes |
| Job match (fit %) | `/api/jobs/match` | `/dashboard/match` | Yes |
| Cover letters | `/api/cover-letters` | `/dashboard/cover-letters` | Yes |
| Interview prep | `/api/interview` | `/dashboard/interview` | Yes |
| LinkedIn optimizer | `/api/linkedin` | `/dashboard/linkedin` | Yes |
| Skill gap analysis | `/api/skills` | `/dashboard/skills` | No (compute-only) |
| Career roadmap | `/api/roadmap` | `/dashboard/roadmap` | No (compute-only) |
| History / version tracking | n/a (server page) | `/dashboard/history` | Reads existing data |

Every API route enforces authentication, per-user rate limiting, and zod input
validation, and returns a `provider` field so the UI can indicate whether output
came from an AI provider or the local engine.

## Auth & security

- Email/password with bcrypt-style hashing, JWT sessions, and optional TOTP 2FA.
- Honeypot spam traps on both the register and login forms.
- Audit logging for sensitive actions.
- Rate limiting on auth and AI endpoints.

## Requires real credentials (deferred)

These remain wired but inactive until the matching environment variables are set
(see `.env.example`). When keys are added, the existing fallbacks automatically
yield to the real providers with no further code changes for AI features.

- Stripe checkout & subscription upgrade
- Transactional email (verification + password reset over SMTP)
- Live OpenAI / Anthropic completions
- S3-compatible file storage for uploads
- Google OAuth sign-in

## Running locally

```bash
git pull
npm install
npm run typecheck
npm run build
npm run dev
```

Landing, pricing, legal, and the AI tools render without a database. Auth and
dashboard data need Postgres + Redis:

```bash
docker compose up -d db redis
npx prisma migrate dev
npm run db:seed
```
