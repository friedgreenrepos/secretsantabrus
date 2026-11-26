# Secret Santabrus 🧝‍♀️

Il Secret Santa dei Calabrus. Crea un gruppo, condividi il codice, e il giorno
dell'estrazione ognuno riceve un'email con la persona a cui fare il regalo.

The successor of the original [Python script](https://github.com/friedgreenrepos/secretsantabrus/tree/v1-python),
using the same draw: shuffle everyone into one circle, each person gives to the next.

## Stack

- **Next.js 16** (App Router, server actions) + Tailwind 4, deployed on **Vercel**
- **Postgres** (Neon in production) via Drizzle ORM
- **Gmail SMTP** (Nodemailer + app password) for emails
- **Vercel Cron** at 08:00 UTC daily (09:00–10:00 in Italy) runs due draws

## How it works

| URL | Who | What |
| --- | --- | --- |
| `/crea` | organiser | creates the event, gets the code + an admin link by email |
| `/g/CODE` | anyone with the code | sees the event, joins with name, email and gift ideas |
| `/p/TOKEN` | participant (link in their email) | status, edit gift ideas, after the draw: who to buy for |
| `/admin/TOKEN` | organiser (link in their email) | edit event, remove people, draw early, opt-in reveal of matches |
| `/api/cron/draw` | Vercel Cron | draws groups whose date has arrived (≥ 3 people), retries failed emails |

No accounts: personal and admin links carry unguessable tokens.

## Local development

```bash
docker run -d --name secretsantabrus-db -e POSTGRES_USER=santa -e POSTGRES_PASSWORD=santa \
  -e POSTGRES_DB=santabrus -p 5433:5432 postgres:16
cp .env.example .env.local
pnpm install
pnpm db:migrate
pnpm dev
```

Without `GMAIL_*` variables, emails are written to `.emails/` as HTML files instead of sent.

```bash
pnpm test   # draw algorithm
pnpm lint
```

Trigger the cron locally: `curl -H "Authorization: Bearer change-me" localhost:3000/api/cron/draw`

## Environment variables (Vercel)

| Name | Value |
| --- | --- |
| `DATABASE_URL` | set automatically by the Neon integration (use the pooled URL) |
| `GMAIL_USER` | `secretsantabrus@gmail.com` |
| `GMAIL_APP_PASSWORD` | Google app password (16 chars) |
| `CRON_SECRET` | long random string; Vercel Cron sends it automatically |
| `APP_URL` | optional, e.g. a custom domain; defaults to the Vercel production URL |
